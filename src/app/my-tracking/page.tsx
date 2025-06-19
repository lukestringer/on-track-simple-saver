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

type UserOnTrackData = { goal: GoalData; progressPoints: ChartDataItem[] };

type ChartDataItem = {
  date: string;
  goal: number;
  progress?: number | null;
};

// type ProgressData = {
//   date: string;
//   progress: number;
// };

type GoalData = {
  //TODO Add id to GoalData to prevent fetching more than necessary when saving the goal
  startDate: string;
  startAmount: number;
  endDate: string;
  endAmount: number;
};

async function saveGoal(goalInput: GoalData) {
  //TODO prevent updates if existing data is same as old data. (And maybe prevent frequent updates?)
  console.log("Saving goal data...");
  try {
    const listGoalsResult = await client.graphql({ query: listGoals });
    const listedGoals = listGoalsResult.data.listGoals;
    if (listedGoals.items.length > 0) {
      const input = {
        id: listedGoals.items[0].id,
        startAmount: goalInput.startAmount,
        startDate: goalInput.startDate,
        endAmount: goalInput.endAmount,
        endDate: goalInput.endDate,
      };
      const updateResult = await client.graphql({ query: updateGoal, variables: { input: input } });
      console.log("Goal updated:", updateResult.data.updateGoal);
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
 * @param graphData - Array of existing progress entries, sorted by date.
 * @param newEntry - The new progress entry to insert.
 * @returns A new array with the new entry placed in the correct position.
 */
function insertSortedGraphData(graphData: ChartDataItem[], newEntry: ChartDataItem): ChartDataItem[] {
  const newDate: number = new Date(newEntry.date).getTime();
  const lastEntry = graphData[graphData.length - 1];

  // Fast path: If it's the latest date, just push it (O(1))
  if (lastEntry && newDate > new Date(lastEntry.date).getTime()) {
    return [...graphData, newEntry];
  }

  // Binary search to find insertion index
  let left = 0,
    right = graphData.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midDate = new Date(graphData[mid].date).getTime();
    if (midDate < newDate) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // Insert into the correct position (O(n) due to shifting elements)
  const newGraphData = [...graphData];
  newGraphData.splice(left, 0, newEntry);
  return newGraphData;
}

function updateGoalAmounts(graphData: ChartDataItem[], newGoalData: GoalData): ChartDataItem[] {
  console.log("Updating goal amounts...");
  //TODO deal with some weird behaviour about the chart updating when the date is changed (after a new goal update has happened) probably to do with having so many state variables as well...
  //update start and end data points
  const startDateIndex = graphData.findIndex((data) => data.date === newGoalData.startDate);
  const endDateIndex = graphData.findIndex((data) => data.date === newGoalData.endDate);

  if (startDateIndex !== -1) {
    //existing entry with same date, so update that one
    graphData[startDateIndex].goal = newGoalData.startAmount;
  } else {
    //add new start date entry
    graphData = [{ date: newGoalData.startDate, goal: newGoalData.startAmount, progress: null }, ...graphData];
  }
  if (endDateIndex !== -1) {
    //existing entry with same date
    graphData[endDateIndex].goal = newGoalData.endAmount;
  } else {
    //add new end date entry
    graphData = [...graphData, { date: newGoalData.endDate, goal: newGoalData.endAmount, progress: null }];
  }

  let startTime = new Date(newGoalData.startDate).getTime();
  let endTime = new Date(newGoalData.endDate).getTime();
  let m = (newGoalData.endAmount - newGoalData.startAmount) / (endTime - startTime);
  let c = newGoalData.endAmount - m * endTime;

  for (let i = 0; i < graphData.length; i++) {
    let time = new Date(graphData[i].date).getTime();
    graphData[i].goal = m * time + c;
    //if there are data points outside of new goal data range which don't have progress data, remove them
    if ((time < startTime || time > endTime) && graphData[i].progress === null) {
      graphData.splice(i, 1);
    }
  }

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
  const initialGraphData: ChartDataItem[] = [
    { date: initialGoalData.startDate, goal: initialGoalData.startAmount, progress: null },
    { date: initialGoalData.endDate, goal: initialGoalData.endAmount, progress: null },
  ];

  const [goalData, setGoalData] = useState<GoalData>(initialGoalData);
  // Local state to store the current graph data
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
          // setGoalData(fetchedGoalData);//TODO hmm...
          //fill in inbetween values
          const updatedGraphData = updateGoalAmounts(graphData, fetchedGoalData);
          setGraphData(updatedGraphData);
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

    const newDate = progressDateFormData; //convenience var
    const newProgress = parseFloat(progressFormData);

    // Validate that the selected date defined and is not in the future.
    if (newDate != undefined && new Date(newDate).getTime() > new Date(todayString).getTime()) {
      //TODO show error on date field or progress field
      return;
    }
    if (isNaN(newProgress)) {
      //TODO show error on progress
      return;
    }

    let updatedGraphData: ChartDataItem[];
    const index = graphData.findIndex((data) => data.date === newDate);
    if (index !== -1) {
      // If the progress date already exists, replace it.
      //TODO ask user if they want to replace it or use old value
      updatedGraphData = [...graphData];
      updatedGraphData[index] = {
        date: newDate,
        progress: newProgress,
        goal: calculateGoalAmount(goalData, newDate),
      };
    } else {
      // Otherwise, simply append a new entry.
      const newGoalAmount = calculateGoalAmount(goalData, newDate);
      const newData = { date: newDate, progress: newProgress, goal: newGoalAmount };
      updatedGraphData = insertSortedGraphData(graphData, newData);
    }

    setGraphData(updatedGraphData);
  };

  // Prepare Chart.js data: using object notation in the datasets so that the
  // time scale reads the x (date) values correctly.
  const chartData = {
    datasets: [
      {
        label: "Goal Line",
        data: graphData.map((item) => ({ x: item.date, y: item.goal })),
        borderColor: "#000000",
        borderWidth: 3,
        fill: false,
        tension: 0,
        pointRadius: 0,
        spanGaps: true,
      },
      {
        label: "Progress",
        data: graphData.map((item) => ({ x: item.date, y: item.progress })),
        borderColor: "#00853f",
        borderWidth: 3,
        stepped: true,
        fill: false,
        pointRadius: 3,
        spanGaps: true,
      },
    ],
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

    //fill in inbetween values
    const updatedGraphData = updateGoalAmounts(graphData, newGoal);
    setGraphData(updatedGraphData);

    //saves goal data to the database
    saveGoal(goalData);
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
