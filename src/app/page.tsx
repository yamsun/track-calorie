// components/CustomLayout.tsx

"use client";

import { ReactNode, useEffect, useState } from "react";
import { Inter } from "next/font/google";
// import Calendar from "./components/Calendar";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { CircularSliderWithChildren } from "react-circular-slider-svg";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import Link from "next/link";
import "./globals.css";
import Calendar from "@/components/Calendar";
import useFoodStore, { SelectedFoodItem } from "@/store/useFoodStore";

const inter = Inter({ subsets: ["latin"] });

interface CustomLayoutProps {
  children?: ReactNode;
}

interface Ingredient {
  text: string;
  weight: number;
}

interface Meal {
  title: string;
  totalCalories: number;
  ingredients: { text: string; weight: number }[];
}

// Add plugins to dayjs
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

// Utility function to get human-readable date
const getHumanReadableDate = (date: dayjs.Dayjs) => {
  const today = dayjs();
  const formattedDate = dayjs(date);

  if (formattedDate.isSame(today, "day")) {
    return `Today, ${formattedDate.format("MMM D")}`;
  } else if (formattedDate.isSame(today.subtract(1, "day"), "day")) {
    return `Yesterday, ${formattedDate.format("MMM D")}`;
  } else {
    return formattedDate.format("MMM D");
  }
};

const CustomLayout = ({ children }: CustomLayoutProps) => {
  const [date, setDate] = useState<dayjs.Dayjs>(dayjs());
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  console.log({ date: date?.toString() });
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 380);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const selectedFoodItems = useFoodStore((state) => state.selectedFoodItems); // Accessing Zustand store

  // Function to retrieve food items for a specific date
  const handleGetFoodItems = (date: string): SelectedFoodItem[] => {
    const meals = selectedFoodItems[date];
    if (!meals) {
      return [];
    }
    // Concatenate all selected food items from each meal into one array
    return Object.values(meals).reduce(
      (acc, mealItems) => [...acc, ...mealItems],
      []
    );
  };

  const [foodMealWise, setFoodMealWise] = useState([]);

  const [dateFoods, setDateFoods] = useState<SelectedFoodItem[]>([]);
  useEffect(() => {
    const formattedDate = date.format("YYYY-MM-DD");
    const meals = selectedFoodItems[formattedDate];
    setFoodMealWise(meals);
    const foods = handleGetFoodItems(formattedDate);
    if (foods) {
      setDateFoods(foods);
    } else {
      setDateFoods([]);
    }
  }, [date, selectedFoodItems]);

  console.log({ selectedFoodItems, dateFoods });

  let totalCalories = dateFoods.reduce(
    (totalCalories, food) => totalCalories + food.food.nutrients.ENERC_KCAL,
    0
  );
  let caloriePercentage = ((totalCalories || 0) / 2500) * 100;

  let totalProtein = dateFoods
    .reduce((total, food) => total + (food.food.nutrients.PROCNT || 0), 0)
    .toFixed(1);
  let totalFat = dateFoods
    .reduce((total, food) => total + (food.food.nutrients.FAT || 0), 0)
    .toFixed(1);
  let totalCarbs = dateFoods
    .reduce((total, food) => total + (food.food.nutrients.CHOCDF || 0), 0)
    .toFixed(1);

  let totalNutrients = {
    Protein: totalProtein,
    Fat: totalFat,
    Carbs: totalCarbs,
  };

  // Function to convert foodMealWise to foodData format
  function convertTofoodData(foodMealWise) {
    if (!foodMealWise || typeof foodMealWise !== "object") {
      return [];
    }

    const mealOrder = ["breakfast", "lunch", "dinner"];
    const foodData = mealOrder
      .map((mealType) => {
        const meals = foodMealWise[mealType];
        if (!meals) {
          return null;
        }

        const totalCalories = meals.reduce((sum, meal) => {
          return sum + meal.food.nutrients.ENERC_KCAL;
        }, 0);

        // Get ingredients and sort by weight in descending order
        const ingredients = meals.map((meal) => ({
          text: meal.food.label,
          weight: meal.measures.reduce(
            (sum, measure) => sum + measure.weight,
            0
          ),
        }));

        const sortedIngredients = ingredients.sort(
          (a, b) => b.weight - a.weight
        );
        const topIngredients = sortedIngredients.slice(0, 3);
        const moreIngredients = sortedIngredients.slice(3);

        const ingredientsWithMore = topIngredients.map((ingredient, index) => {
          return {
            text: ingredient.text,
            weight: ingredient.weight,
          };
        });

        if (moreIngredients.length > 0) {
          ingredientsWithMore.push({
            text: "more",
            weight: moreIngredients.reduce(
              (sum, ingredient) => sum + ingredient.weight,
              0
            ),
          });
        }

        return {
          title: mealType.charAt(0).toUpperCase() + mealType.slice(1),
          totalCalories,
          ingredients: ingredientsWithMore,
        };
      })
      .filter((meal) => meal !== null);

    return foodData;
  }

  const foodData = convertTofoodData(foodMealWise);

  console.log({ foodData });

  return (
    <div
      className={`font-sans ${inter.className} text-gray-900 min-h-screen flex flex-col bg-gray-100 p-2`}
    >
      {/* Top Section */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 p-4 border-b flex justify-between items-start">
        <div
          onClick={() => {
            setShowCalendar(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div className="text-sm text-gray-600 font-medium">Hello, Eunha!</div>
          <div className="text-md font-bold">{getHumanReadableDate(date)}</div>
        </div>
        <NotificationsRoundedIcon />
      </div>
      {/* Push content down to avoid overlap with fixed top bar */}
      <div className="pt-20 flex-grow flex flex-col gap-4">
        {/* <AnimatePresence> */}
        {showCalendar && (
          // <div>sksksk</div>
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Calendar
              date={date}
              setDate={setDate}
              setShowCalendar={setShowCalendar}
              canHide={true}
            />
          </motion.div>
        )}
        {/* </AnimatePresence> */}

        {/* Full Width Square Card */}
        <div className="bg-white shadow-md rounded-lg py-2">
          <div
            className={`grid ${
              isSmallScreen ? "grid-cols-1" : "grid-cols-5"
            } gap-4`}
          >
            <div
              className={`min-w-[120px] ${
                isSmallScreen ? "col-span-1" : "col-span-3"
              } flex flex-col justify-start items-center`}
            >
              <div className="relative">
                <CircularSliderWithChildren
                  handle1={{
                    value: caloriePercentage > 100 ? 100 : caloriePercentage,
                  }}
                  arcColor={"#666df7"}
                  arcBackgroundColor={"#e4d9f7"}
                  startAngle={60}
                  endAngle={300}
                  trackWidth={14}
                  size={250}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      userSelect: "none",
                      paddingTop: "24px",
                    }}
                  >
                    <div className="text-4xl font-bold">
                      {(caloriePercentage > 100
                        ? 100
                        : caloriePercentage
                      )?.toFixed(1)}
                      %
                    </div>
                    <div className="text-xs text-gray-400 text-center">
                      Daily target achieved
                    </div>
                  </div>
                </CircularSliderWithChildren>
                <div className="absolute bottom-0 flex flex-col justify-start items-start w-full p-8 pb-2 pt-6 gap-0.5">
                  <div className="text-xl font-semibold">{`${totalCalories?.toFixed(
                    1
                  )}/2500 KCal`}</div>
                  <div className="text-xs text-gray-500">Eaten / Target</div>
                </div>
              </div>
            </div>

            <div
              className={`p-1 ${isSmallScreen ? "col-span-1" : "col-span-2"}`}
            >
              <div className="flex flex-col gap-1">
                {["Protein", "Fat", "Carbs"].map((nutrient) => (
                  <div
                    key={nutrient}
                    className="p-1 flex flex-col justify-start items-start gap-0.5"
                  >
                    <p className="font-semibold">{nutrient}</p>
                    <div className="flex flex-col items-start justify-start w-full">
                      <div className="w-full sm:w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${
                              Number(totalNutrients?.[nutrient]) > 100
                                ? 100
                                : Number(totalNutrients?.[nutrient])
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-gray-600 mt-1 sm:ml-2">
                        {totalNutrients?.[nutrient]} g
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {foodData.length > 0 ? (
          foodData.map((recipe, index) => (
            <Link
              prefetch={false}
              key={index}
              href={`/viewlog?date=${date.format(
                "YYYY-MM-DD"
              )}&meal=${recipe.title.toLowerCase()}`}
            >
              <div className="w-full max-w-[600px] bg-white rounded-lg flex flex-col items-start justify-center shadow-md p-4 gap-4 cursor-pointer">
                <div>
                  <div className="text-2xl font-medium">{recipe.title}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-medium">
                      {Math.round(recipe.totalCalories)}
                    </span>
                    <span className="text-md"> calories</span>
                  </div>
                </div>
                <div className="w-full flex flex-col">
                  {recipe.ingredients.map(
                    (ingredient: Ingredient, idx: number) => (
                      <div key={idx} className="flex flex-col w-full">
                        <div className="flex justify-between items-center w-full gap-2">
                          <div>{ingredient.text}</div>
                          <div className="p-1 pr-0 min-w-16">
                            {Math.round(ingredient.weight)} g
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <>
            <div className="w-full max-w-[600px] bg-white rounded-lg flex flex-col items-start justify-center shadow-md p-4 gap-4 animate-pulse">
              <div>No data for this day.</div>
            </div>
          </>
        )}
      </div>
      <Box sx={{ height: 120 }} />

      {/* Bottom Navigation Bar */}
      <div className="relative">
        <div className="fixed bottom-0 left-0 right-0 bg-[#f4edff] shadow-2xl flex justify-between items-center p-2">
          <div className="flex-1 flex justify-center">
            <div className="flex flex-col justify-center items-center ">
              <div className="bg-[#e6d8ff] px-4 rounded-full">
                <HomeOutlinedIcon />
              </div>
              <div>Home</div>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex flex-col justify-center items-center">
              <BarChartRoundedIcon />
              <Link prefetch={false} href={`/analytics`}>
                <div>Analytics</div>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex justify-center items-center bg-[#7a81fc] rounded-3xl w-20 h-20">
              <Link
                prefetch={false}
                href={`/viewlog?date=${date.format(
                  "YYYY-MM-DD"
                )}&meal=breakfast`}
              >
                <AddCircleOutlineRoundedIcon
                  sx={{ color: "#fff" }}
                  fontSize="large"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomLayout;
