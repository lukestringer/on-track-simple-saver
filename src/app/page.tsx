"use client";

// pages/index.tsx
import React, { useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Function to generate example graph data
const getExampleGraphData = () => {
  const startDate = new Date("2025-06-01");
  const endDate = new Date("2025-12-31");
  const startAmount = 0;
  const endAmount = 5000;
  const dates = [
    "2025-06-01",
    "2025-07-01",
    "2025-08-01",
    "2025-09-01",
    "2025-10-01",
    "2025-11-01",
    "2025-12-31",
  ];

  // Hardcoded data with clear point-to-point values.
  const hardcodedData = [
    { date: "2025-01-01", baseline: 0, actual: 0 },
    { date: "2025-07-01", baseline: null, actual: 850 },
    { date: "2025-08-01", baseline: null, actual: 1900 },
    { date: "2025-09-01", baseline: null, actual: 2750 },
    { date: "2025-10-01", baseline: null, actual: 3600 },
    { date: "2025-11-01", baseline: null, actual: 4300 },
    { date: "2025-12-31", baseline: 5000, actual: 5000 },
  ];

  return hardcodedData;
};

export default function Home() {
  // Local state to store the current graph data
  const [graphData, setGraphData] = useState(getExampleGraphData());
  const [newProgress, setNewProgress] = useState("");
  const [newDate, setNewDate] = useState("");

  const handleAddProgressSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // setGraphData((prevData) => [...prevData, newProgress]);
  };

  const todayString = new Date().toISOString().split("T")[0]; //today is latest date progress can be recorded

  return (
    <div className="base-container">
      <div className="header-container">
        <h1>On Track Simple Saver Demo</h1>
        <p>
          This demo shows what your savings goal tracking could look like with
          example data.
        </p>
      </div>
      <div className={"graph"}>
        <ResponsiveContainer className={"responsive-container"}>
          <LineChart
            data={graphData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Legend />
            {/* Baseline Goal Line */}
            <Line
              type="linear"
              dataKey="baseline"
              name="Goal Line"
              stroke="#000000"
              strokeWidth={3}
              dot={false}
              connectNulls={true}
            />
            {/* Progress Line (example actual savings progress) */}
            <Line
              type="stepAfter"
              dataKey="actual"
              name="Progress"
              stroke="#00853f"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="add-progress">
        <form onSubmit={handleAddProgressSubmit}>
          <div>
            <label>
              Progress Amount:
              <input
                type="number"
                value={newProgress}
                onChange={(e) => setNewProgress(e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Progress Date:
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                max={todayString} // Prevents selecting future dates
                required
              />
            </label>
          </div>
          <button type="submit">Add Progress Update</button>
        </form>
      </div>
    </div>
  );
}
