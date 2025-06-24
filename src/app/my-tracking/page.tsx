// pages/index.tsx
"use client";
import { Amplify } from "aws-amplify";
import { signOut } from "aws-amplify/auth";
// import Link from "next/link";
// import API from "aws-amplify";
import {
  createGoal,
  updateGoal,
  createProgressUpdate,
  updateProgressUpdate,
  deleteProgressUpdate,
  deleteGoal,
} from "@/graphql/mutations";
import { generateClient } from "aws-amplify/api";
// import {createGoal} from "../../graphql/mutations"
import awsExports from "../../aws-exports";
import React, { useState } from "react";
import {
  Chart as ChartJS,
  ChartOptions,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import "chartjs-adapter-date-fns"; // Date adapter for time scale support
import { Line } from "react-chartjs-2";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { listGoals, listProgressUpdates } from "@/graphql/queries";
import { CreateGoalInput, UpdateGoalInput } from "@/API";
import Link from "next/link";

Amplify.configure(awsExports);
const client = generateClient();

type OnTrackData = { goal: GoalData; progressPoints: ProgressData[] };

type GoalData = {
  goalID: string;
  startDate: string;
  startAmount: number;
  endDate: string;
  endAmount: number;
};

type ProgressData = {
  progressID: String;
  date: string;
  amount: number;
};

type GraphData = {
  date: string;
  progressAmount?: number | null;
  goalAmount: number;
};

// Register the necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

/**
 * Calculates the projected goal amount based on the progress date's position in the goal period.
 *
 * @param goalData - Object containing startDate, endDate, and goalAmount.
 * @param newProgressDate - The date for which progress is being measured.
 * @returns The estimated goal amount proportional to the progress date.
 */
function calculateGoalAmount(goalData: GoalData, newProgressDate: string): number {
  const startTime = new Date(goalData.startDate).getTime();
  const endTime = new Date(goalData.endDate).getTime();
  const progressTime = new Date(newProgressDate).getTime();

  if (isNaN(startTime) || isNaN(endTime) || isNaN(progressTime)) {
    throw new Error("Invalid date format. Ensure all dates are in 'YYYY-MM-DD' format.");
  }

  // if (progressTime < startTime || progressTime > endTime) {
  //   return 0;
  // }

  const progressPercentage = (progressTime - startTime) / (endTime - startTime);
  const goalAmount = progressPercentage * (goalData.endAmount - goalData.startAmount) + goalData.startAmount;
  //return only to two decimal places
  return Math.round(goalAmount * 100) / 100;
}

/**
 * Inserts a new progress entry into a sorted graphData array while maintaining chronological order.
 *
 * If the new entry's date is later than the last item, it is simply appended.
 * Uses binary search for fast insertion when inserting an older entry.
 *
 * @param dateObjects - Array of existing progress entries, sorted by date.
 * @param newEntry - The new progress entry to insert.
 * @returns A new array with the new entry placed in the correct position.
 */
function insertIntoSortedDateObjects<T extends { date: string }>(dateObjects: T[], newEntry: T): T[] {
  const newDate: number = new Date(newEntry.date).getTime();
  const lastEntry = dateObjects[dateObjects.length - 1];

  // Fast path: If it's the latest date, just push it (O(1))
  if (lastEntry && newDate > new Date(lastEntry.date).getTime()) {
    return [...dateObjects, newEntry];
  }

  // Binary search to find insertion index
  let left = 0,
    right = dateObjects.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midDate = new Date(dateObjects[mid].date).getTime();
    if (midDate < newDate) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // Insert into the correct position (O(n) due to shifting elements)
  const newDateObjects = [...dateObjects];
  newDateObjects.splice(left, 0, newEntry);
  return newDateObjects;
}

/**
 * Creates an array of GraphData objects using the provided OnTrackData.
 *
 * @param onTrackData The goal and progress points used to create the GraphData array.
 * @returns a GraphData array containing all the points needed to draw a graph.
 */
function graphOnTrackData(onTrackData: OnTrackData): GraphData[] {
  let graphData: GraphData[] = [];

  const goalStartDate = onTrackData.goal.startDate;
  const goalStartAmount = onTrackData.goal.startAmount;
  const goalEndDate = onTrackData.goal.endDate;
  const goalEndAmount = onTrackData.goal.endAmount;

  let startTime = new Date(goalStartDate).getTime();
  let endTime = new Date(goalEndDate).getTime();
  let m = (goalEndAmount - goalStartAmount) / (endTime - startTime);
  let c = goalEndAmount - m * endTime;

  //add start entry for goal start
  graphData.push({ date: goalStartDate, progressAmount: null, goalAmount: goalStartAmount });
  //add all existing progress points with newly calculated goal progress amounts
  for (let i = 0; i < onTrackData.progressPoints.length; i++) {
    const progressPoint = onTrackData.progressPoints[i];
    let time = new Date(progressPoint.date).getTime();
    const goalProgressAmount = m * time + c;
    graphData.push({ date: progressPoint.date, progressAmount: progressPoint.amount, goalAmount: goalProgressAmount });
  }
  //add end entry for goal end
  graphData.push({ date: goalEndDate, progressAmount: null, goalAmount: goalEndAmount });
  return graphData;
}

function MyTracking() {
  const todayDate = new Date();
  const todayString = todayDate.toISOString().split("T")[0];

  //set up default data with about 6 months either side of today
  const futureMonth = String(todayDate.getMonth() + (6 % 12)).padStart(2, "0");
  const pastMonth = todayDate.getMonth() - 6 < 1 ? "01" : String(todayDate.getMonth() - 6).padStart(2, "0");
  const todayYear = String(todayDate.getFullYear());
  //Hardcoded initial values
  const initialGoalData: GoalData = {
    goalID: "", //empty for now until it's generated and passed back
    startDate: `${todayYear}-${pastMonth}-01`,
    endDate: `${todayYear}-${futureMonth}-28`,
    startAmount: 0,
    endAmount: 0,
  };
  const initialOnTrackData: OnTrackData = { goal: initialGoalData, progressPoints: [] };

  // Local state to store the current graph data
  const [onTrackData, setOnTrackData] = useState(initialOnTrackData);
  let initialGraphData = graphOnTrackData(onTrackData);
  const [graphData, setGraphData] = useState(initialGraphData);
  //const [graphData, setGraphData] = useState([{date: todayString, goal: 0, progress: 0}]);
  const [progressFormData, setProgressFormData] = useState("");
  const [progressDateFormData, setProgressDateFormData] = useState("");
  const [goalStartFormData, setStartGoalFormData] = useState("");
  const [goalStartDateFormData, setStartGoalDateFormData] = useState("");
  const [goalEndFormData, setEndGoalFormData] = useState("");
  const [goalEndDateFormData, setEndGoalDateFormData] = useState("");

  React.useEffect(() => {
    //load goal data and update state when received
    async function fetchUserOnTrackData() {
      //TODO Solve double fetching of goals...
      try {
        const result = await client.graphql({ query: listGoals });
        const fetchedGoals = result.data.listGoals;
        if (fetchedGoals.items.length === 0) {
          // wait until the user has made a goal
          return;
        } else {
          //use the first (and hopefully only) goal in the list
          //TODO check if there are other goals and delete them (also can add other goals in future though)
          const fetchedGoalData = fetchedGoals.items[0]; //assumes they're returned in the same order each time...
          const fetchedGoal: GoalData = {
            goalID: fetchedGoalData.id, //have to do this because goalID is not the same as id.
            startAmount: fetchedGoalData.startAmount,
            startDate: fetchedGoalData.startDate,
            endAmount: fetchedGoalData.endAmount,
            endDate: fetchedGoalData.endDate,
          };

          let fetchedProgressUpdates = (await client.graphql({ query: listProgressUpdates })).data.listProgressUpdates;
          // let fetchedProgressPoints: ProgressData[] = [];

          const fetchedProgressPoints: ProgressData[] = fetchedProgressUpdates.items
            .map((item) => ({
              progressID: item.id, // Rename id to progressID
              date: item.date,
              amount: item.amount,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          const nextOnTrackData: OnTrackData = { goal: fetchedGoal, progressPoints: fetchedProgressPoints };
          setOnTrackData(nextOnTrackData);
          //update graph data
          const nextGraphData: GraphData[] = graphOnTrackData(nextOnTrackData);
          setGraphData(nextGraphData);
        }
      } catch (err) {
        console.error("Error fetching goal data:", err);
      } finally {
      }
    }
    fetchUserOnTrackData();
  }, []);

  /**
   * This function updates the database with the goal (updating an existing one or adding a new one if none exists)
   * and if a new goal is created, local on track data is updated with its goal ID.
   * @param onTrackData contains the new goal to post to the database
   */
  async function postGoalAndSetOnTrack(onTrackData: OnTrackData) {
    //TODO prevent updates if existing data is same as old data. (And maybe prevent frequent updates?)
    try {
      const listGoalsResult = await client.graphql({ query: listGoals });
      const listedGoals = listGoalsResult.data.listGoals;
      if (listedGoals.items.length > 0) {
        //if there is an existing goal returned, grab it's id and then use that id to update it with the amount.
        const updateGoalInputWithID: UpdateGoalInput = {
          id: listedGoals.items[0].id,
          startDate: onTrackData.goal.startDate,
          startAmount: onTrackData.goal.startAmount,
          endDate: onTrackData.goal.endDate,
          endAmount: onTrackData.goal.endAmount,
        };
        const updateResult = await client.graphql({ query: updateGoal, variables: { input: updateGoalInputWithID } });
        const listGoalsResult = await client.graphql({ query: listGoals });
      } else {
        const createGoalInput: CreateGoalInput = {
          startDate: onTrackData.goal.startDate,
          startAmount: onTrackData.goal.startAmount,
          endDate: onTrackData.goal.endDate,
          endAmount: onTrackData.goal.endAmount,
        };
        const createResult = await client.graphql({ query: createGoal, variables: { input: createGoalInput } });
        //update goal id
        const goalID: string = createResult.data.createGoal.id;
        const nextOnTrackData: OnTrackData = { goal: onTrackData.goal, progressPoints: onTrackData.progressPoints };
        nextOnTrackData.goal.goalID = goalID;
        setOnTrackData(nextOnTrackData);
      }
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  }

  function updateOnTrackWithProgressID(onTrackData: OnTrackData, progressData: ProgressData): OnTrackData {
    let nextOnTrackData: OnTrackData = { goal: onTrackData.goal, progressPoints: onTrackData.progressPoints };
    const progressIndex = nextOnTrackData.progressPoints.findIndex((data) => data.date === progressData.date);
    try {
      if (progressIndex !== -1) {
        nextOnTrackData.progressPoints[progressIndex] = progressData;
      } else {
        nextOnTrackData.progressPoints.push(progressData);
      }
    } catch (error) {
      console.error("Can't find the provided progress data in the provided On Track data:", error);
    }
    return nextOnTrackData;
  }

  /**
   * Updates the existing progress update with matching ID to provided progress data.
   * @param progressData The progress data to update existing values with.
   */
  async function postUpdateProgress(progressData: ProgressData) {
    const progressID = progressData.progressID;
    if (progressID === "") {
      console.error("Empty progress ID provided when updating database progress... Is this an new progress update?");
    }
    try {
      const updateResult = await client.graphql({
        query: updateProgressUpdate,
        variables: { input: { id: String(progressID), amount: progressData.amount } },
      });
    } catch (error) {
      console.error("Error posting existing progress data update:", error);
    }
  }

  /**
   * Creates a new progress update in the database and updates the local progress data id with the returned one.
   * @param progressData
   */
  async function postNewProgress(progressData: ProgressData) {
    try {
      const input = { date: progressData.date, amount: progressData.amount };
      const newResult = await client.graphql({ query: createProgressUpdate, variables: { input: input } });
      const resultData = newResult.data.createProgressUpdate;
      //add the id to the right progress data in the on track data
      const progressWithID: ProgressData = {
        progressID: resultData.id,
        date: progressData.date,
        amount: progressData.amount,
      };
      const nextOnTrackData = updateOnTrackWithProgressID(onTrackData, progressWithID);
      setOnTrackData(nextOnTrackData);
    } catch (error) {
      console.error("Error posting new progress update:", error);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      //TODO redirect to home page
    } catch (error) {}
  }

  function handleAddProgressSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextProgressDate = progressDateFormData;
    const nextProgressAmount = parseFloat(progressFormData);

    // Validate that the selected date defined and is not in the future.
    if (nextProgressDate != undefined && new Date(nextProgressDate).getTime() > new Date(todayString).getTime()) {
      console.error("Adding Progress: date error.");
      return;
    }
    if (isNaN(nextProgressAmount)) {
      console.error("Adding Progress: progress amount error.");
      return;
    }

    let nextOnTrackData: OnTrackData = { goal: onTrackData.goal, progressPoints: onTrackData.progressPoints };
    let nextGraphData: GraphData[] = [...graphData];

    let existingProgress: ProgressData | null = null;
    for (let i = 0; i < nextOnTrackData.progressPoints.length; i++) {
      const progress = nextOnTrackData.progressPoints[i];
      if (progress.date == nextProgressDate) {
        existingProgress = progress;
        existingProgress.amount = nextProgressAmount;
      }
    }
    if (existingProgress != null) {
      //TODO ask user if they want to replace it or use old value
      // If a progress update with the same date already exists, replace the progress amount.
      // (Don't need to update date or goal as they're unchanged.)
      existingProgress.amount = nextProgressAmount;
      // need to update graph data to new progress value
      let matchingGraph: GraphData | null = null;
      for (let i = 0; i < nextGraphData.length; i++) {
        const graphData = nextGraphData[i];
        if (graphData.date == nextProgressDate) {
          matchingGraph = graphData;
          break;
        }
      }
      if (matchingGraph != null) {
        matchingGraph.progressAmount = nextProgressAmount;
      } else {
        console.error("Couldn't find a graph entry with the same date.");
      }

      //Update database
      postUpdateProgress(existingProgress);
    } else {
      // Otherwise, simply append a new entry.
      let nextProgressData: ProgressData = { progressID: "", date: nextProgressDate, amount: nextProgressAmount };
      nextOnTrackData.progressPoints = insertIntoSortedDateObjects(nextOnTrackData.progressPoints, nextProgressData);
      //and calculate an accompanying goal amount and add to the graph data
      let nextGoalProgressAmount: number = calculateGoalAmount(nextOnTrackData.goal, nextProgressDate);
      nextGraphData = insertIntoSortedDateObjects(nextGraphData, {
        date: nextProgressDate,
        progressAmount: nextProgressAmount,
        goalAmount: nextGoalProgressAmount,
      });
      // Add a new entry to the database (function also stores returned id)
      postNewProgress(nextProgressData);
    }
    setOnTrackData(nextOnTrackData);
    setGraphData(nextGraphData);
  }

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newStartAmount = parseFloat(goalStartFormData);
    const newEndAmount = parseFloat(goalEndFormData);

    if (isNaN(newStartAmount) || isNaN(newEndAmount)) {
      throw new Error("Goal amounts must be numbers.");
    }

    const newGoal: GoalData = {
      goalID: "",
      startDate: goalStartDateFormData,
      startAmount: newStartAmount,
      endDate: goalEndDateFormData,
      endAmount: newEndAmount,
    };

    const nextOnTrackData: OnTrackData = { goal: newGoal, progressPoints: onTrackData.progressPoints };
    // setOnTrackData(nextOnTrackData); //this is done in post goal anyway.
    //saves goal data to the database
    postGoalAndSetOnTrack(nextOnTrackData);

    const nextGraphData = graphOnTrackData(nextOnTrackData);
    setGraphData(nextGraphData);
  };
  // Chart.js options with a time scale for the x-axis.
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "month",
          tooltipFormat: "dd MMM yyyy",
          displayFormats: {
            month: "MMM",
          },
        },
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Amount",
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
      annotation: {
        annotations: {
          todayLine: {
            type: "line",
            // Using xMin and xMax creates a vertical line at the given date value.
            xMin: todayString,
            xMax: todayString,
            borderColor: "blue",
            borderWidth: 2,
          },
        },
      },
    },
  };

  // Prepare Chart.js data: using object notation in the datasets so that the
  // time scale reads the x (date) values correctly.
  const chartData = {
    datasets: [
      {
        label: "Goal Line",
        data: graphData.map((item) => ({ x: item.date, y: item.goalAmount })),
        borderColor: "#000000",
        borderWidth: 3,
        fill: false,
        tension: 0,
        pointRadius: 0,
        spanGaps: true,
      },
      {
        label: "Progress",
        data: graphData.map((item) => ({ x: item.date, y: item.progressAmount })),
        borderColor: "#00853f",
        borderWidth: 3,
        stepped: true,
        fill: false,
        pointRadius: 3,
        spanGaps: true,
      },
    ],
  };

  return (
    <div className="base-container">
      <div className="header-container">
        <h1>On Track - Simple Saver </h1>
      </div>
      <div className="graph" style={{ height: "400px" }}>
        {/* TODO add refresh button to graph to query database again and consider useEffect().*/}
        <Line data={chartData} options={chartOptions} />
      </div>
      <div className="add-boxes">
        <div className="add-progress">
          <h2>Progress Update</h2>
          {/* TODO style this so it is centered horizontally (and change to inline with tailwind.) */}
          <form onSubmit={handleAddProgressSubmit}>
            <label>
              <span>Amount:</span>
              <input
                type="number"
                value={progressFormData}
                onChange={(e) => setProgressFormData(e.target.value)}
                required
              />
            </label>
            <label>
              <span>Date:</span>
              <input
                type="date"
                value={progressDateFormData}
                onChange={(e) => setProgressDateFormData(e.target.value)}
                max={todayString} // Prevents selecting future dates
                required
              />
            </label>
            <button type="submit">Add Progress Update</button>
          </form>
        </div>
        <div className="add-goal">
          <h2>Change Goal</h2>
          <form onSubmit={handleAddGoalSubmit}>
            <label>
              <span>Start Amount:</span>
              <input
                type="number"
                value={goalStartFormData}
                onChange={(e) => setStartGoalFormData(e.target.value)}
                required
              />
            </label>
            <label>
              <span>Start Date:</span>
              <input
                type="date"
                value={goalStartDateFormData}
                onChange={(e) => setStartGoalDateFormData(e.target.value)}
                required
              />
            </label>
            <label>
              <span>End Amount:</span>
              <input
                type="number"
                value={goalEndFormData}
                onChange={(e) => setEndGoalFormData(e.target.value)}
                required
              />
            </label>
            <label>
              <span>End Date:</span>
              <input
                type="date"
                value={goalEndDateFormData}
                onChange={(e) => setEndGoalDateFormData(e.target.value)}
                required
              />
            </label>
            <button type="submit">Update Goal</button>
          </form>
        </div>
      </div>
      <button className="loginBtn" onClick={handleSignOut}>
        Logout
      </button>
    </div>
  );
}

// Define a custom header component.
function CustomHeader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
        borderBottom: "1px solid #ccc",
      }}
    >
      <Link href="/" style={{ left: "45vw" }}>
        <button>Return to demo</button>
      </Link>
    </div>
  );
}

export default withAuthenticator(MyTracking, { components: { Header: CustomHeader } });
