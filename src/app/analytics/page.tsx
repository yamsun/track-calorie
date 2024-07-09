"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Box, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useFoodStore from "@/store/useFoodStore";

const getLast7Days = () => {
  return Array.from({ length: 7 }, (_, i) =>
    dayjs().subtract(i, "day").format("YYYY-MM-DD")
  ).reverse();
};

const calculateCalories = (data: {
  [date: string]: { [meal: string]: any[] };
}) => {
  const last7Days = getLast7Days();
  return last7Days.map((date) => {
    const meals = data[date] || {};
    let totalCalories = 0;

    Object.values(meals).forEach((mealItems) => {
      mealItems.forEach((item: any) => {
        const weight = item.measures[0]?.weight || 2;
        const calories = item.food.nutrients.ENERC_KCAL || 2;
        totalCalories += (calories * weight) / 100;
      });
    });

    return {
      date: dayjs(date).format("MMM DD"), // Format date to a more readable format
      calories: totalCalories,
    };
  });
};

const CaloriesChart = () => {
  const { selectedFoodItems } = useFoodStore();
  const [data, setData] = useState<{ date: string; calories: number }[]>([]);

  useEffect(() => {
    const processedData = calculateCalories(selectedFoodItems);
    setData(processedData);
  }, [selectedFoodItems]);

  return (
    <Box
      sx={{
        px: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Typography variant="h5" align="center" sx={{ mb: 2 }}>
        Calories Trend (Last 7 Days)
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="calories" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CaloriesChart;
