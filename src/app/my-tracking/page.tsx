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
import { getGoal, listGoals } from "@/graphql/queries";

Amplify.configure(awsExports);
const client = generateClient();

type OnTrackData = { goal: GoalData; progressPoints: ProgressData[] };

type ProgressData = {
  date: string;
  amount: number;
};

type GraphData = {
  date: string;
  progressAmount?: number | null;
  goalAmount: number;
};

type GoalData = {
  //TODO Add id to GoalData to prevent fetching more than necessary when saving the goal
  startDate: string;
  startAmount: number;
  endDate: string;
  endAmount: number;
};

async function saveGoal(onTrackData: OnTrackData) {
  const goalInput = onTrackData.goal;
  //TODO prevent updates if existing data is same as old data. (And maybe prevent frequent updates?)
  console.log("Saving goal data...");
  try {
    const listGoalsResult = await client.graphql({ query: listGoals });
    console.log("Goals retrieved: ", listGoalsResult);
    const listedGoals = listGoalsResult.data.listGoals;
    const id = listedGoals.items[0].id;
    if (listedGoals.items.length > 0) {
      const input = {
        id: id,
        ...onTrackData.goal,
      };
      const updateResult = await client.graphql({ query: updateGoal, variables: { input: input } });
      console.log("Goal updated:", updateResult.data.updateGoal);
      const listGoalsResult = await client.graphql({ query: listGoals });
      console.log("Goals retrieved: ", listGoalsResult);
    } else {
      const createResult = await client.graphql({ query: createGoal, variables: { input: goalInput } });
      console.log("Goal created:", createResult.data.createGoal);
    }
  } catch (error) {
    console.error("Error creating goal:", error);
  }
}

async function handleSignOut() {
  try {
    await signOut();
    //TODO redirect to home page
  } catch (error) {
    console.log("error signing out: ", error);
  }
}

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
  return goalAmount;
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
  const initialGoalData = {
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
    async function fetchUserGoals() {
      console.log("Fetching user goals...");
      try {
        const result = await client.graphql({ query: listGoals });
        const existingGoals = result.data.listGoals;
        if (existingGoals.items.length === 0) {
          // wait until the user has made a goal
          console.log("User has not saved a goal yet.");
          return;
        } else {
          console.log(`Retrieved ${existingGoals.items.length} goals:`, existingGoals);
          //use the first (and hopefully only) goal in the list
          //TODO check if there are other goals and delete them (also can add other goals in future though)
          const existingGoal = existingGoals.items[0];
          const fetchedGoalData: GoalData = {
            //This is where the goal id could go to prevent fetching it for updating later.
            startAmount: existingGoal.startAmount,
            startDate: existingGoal.startDate,
            endAmount: existingGoal.endAmount,
            endDate: existingGoal.endDate,
          };
          console.log("Trying to update the graphs with fetched goal data:", fetchedGoalData);
          const nextOnTrackData: OnTrackData = { goal: fetchedGoalData, progressPoints: onTrackData.progressPoints };
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
    fetchUserGoals();
  }, []);

  async function deleteAllGoals() {
    const allGoals = (await client.graphql({ query: listGoals })).data.listGoals;
    console.log("Deleting goals. Fetching all goals: ", allGoals);
    for (let index = 0; index < allGoals.items.length; index++) {
      const id = allGoals.items[index].id;
      const deleteResult = await client.graphql({ query: deleteGoal, variables: { input: { id: id } } });
      console.log("Deleted goal: ", deleteResult);
    }
  }

  const handleAddProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextProgressDate = progressDateFormData; //convenience var
    const nextProgressAmount = parseFloat(progressFormData);

    // Validate that the selected date defined and is not in the future.
    if (nextProgressDate != undefined && new Date(nextProgressDate).getTime() > new Date(todayString).getTime()) {
      //TODO show error on date field or progress field
      console.error("Adding Progress: date error.");
      return;
    }
    if (isNaN(nextProgressAmount)) {
      //TODO show error on progress
      console.error("Adding Progress: progress amount error.");
      return;
    }

    let nextOnTrackData: OnTrackData = onTrackData;
    let nextGraphData: GraphData[] = graphData;
    let nextGoalAmount: number;
    let progressData = onTrackData.progressPoints;
    const nextProgressDateIndex = progressData.findIndex((data) => data.date === nextProgressDate);
    if (nextProgressDateIndex !== -1) {
      // If the progress date already exists, replace it.
      //TODO ask user if they want to replace it or use old value
      nextOnTrackData.progressPoints = [...progressData];
      nextOnTrackData.progressPoints[nextProgressDateIndex] = {
        date: nextProgressDate,
        amount: nextProgressAmount,
      };
      // don't need to update goal amount because already calculated.
    } else {
      // Otherwise, simply append a new entry.
      const nextProgressData: ProgressData = { date: nextProgressDate, amount: nextProgressAmount };
      nextOnTrackData.progressPoints = insertIntoSortedDateObjects(progressData, nextProgressData);
      //and calculate an accompanying goal amount and add to the graph data
      nextGoalAmount = calculateGoalAmount(onTrackData.goal, nextProgressDate);
      nextGraphData = insertIntoSortedDateObjects(nextGraphData, {
        date: nextProgressDate,
        progressAmount: nextProgressAmount,
        goalAmount: nextGoalAmount,
      });
    }
    setOnTrackData(nextOnTrackData);
    setGraphData(nextGraphData);
  };

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newStartAmount = parseFloat(goalStartFormData);
    const newEndAmount = parseFloat(goalEndFormData);

    if (isNaN(newStartAmount) || isNaN(newEndAmount)) {
      throw new Error("Goal amounts must be numbers.");
    }

    const newGoal: GoalData = {
      startDate: goalStartDateFormData,
      startAmount: newStartAmount,
      endDate: goalEndDateFormData,
      endAmount: newEndAmount,
    };

    const nextOnTrackData: OnTrackData = { goal: newGoal, progressPoints: onTrackData.progressPoints };
    setOnTrackData(nextOnTrackData);

    const nextGraphData = graphOnTrackData(nextOnTrackData);
    setGraphData(nextGraphData);

    //saves goal data to the database
    saveGoal(nextOnTrackData);
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
      <button
        style={{ top: "5vw", left: "5vw", position: "absolute" }}
        onClick={(e: React.FormEvent) => {
          e.preventDefault();
          deleteAllGoals();
        }}
      >
        Delete all existing goals
      </button>
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

export default withAuthenticator(MyTracking);
