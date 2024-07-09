// components/ViewLog.tsx

"use client";

import {
  ReactNode,
  useState,
  useEffect,
  SyntheticEvent,
  useCallback,
} from "react";
import { Inter } from "next/font/google";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ".././globals.css";
import Calendar from "@/components/Calendar";
import axios from "axios";
import useFoodStore from "@/store/useFoodStore";

const inter = Inter({ subsets: ["latin"] });

interface Nutrients {
  ENERC_KCAL: number;
  PROCNT: number;
  CHOCDF: number;
  FAT: number;
}

interface Measure {
  weight: number;
}

interface Food {
  foodId: string;
  label: string;
  knownAs?: string; // Added this property
  image?: string;
  nutrients: Nutrients;
}

interface SelectedFoodItem {
  food: Food;
  measures: Measure[];
}

// Edamam API Credentials for Food Database API
const FOOD_DATABASE_API_ID = process.env.NEXT_PUBLIC_FOOD_DATABASE_API_ID;
const FOOD_DATABASE_API_KEY = process.env.NEXT_PUBLIC_FOOD_DATABASE_API_KEY;

// Add plugins to dayjs
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

const mealList = ["breakfast", "lunch", "dinner"];

const debounce = (func: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const ViewLog = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dateParam = searchParams.get("date");
  const mealParam = searchParams.get("meal");
  const [date, setDate] = useState<dayjs.Dayjs>(dayjs(dateParam));
  const [showCalendar, setShowCalendar] = useState<boolean>(true);
  const [mealChoice, setMealChoice] = useState<string>("breakfast");
  const [options, setOptions] = useState<SelectedFoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<SelectedFoodItem | null>(
    null
  );
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);

  const [searchInput, setSearchInput] = useState("");

  const selectedFoodItems = useFoodStore((state) => state.selectedFoodItems);
  const addFoodItem = useFoodStore((state) => state.addFoodItem);
  const removeFoodItem = useFoodStore((state) => state.removeFoodItem);

  const fetchFoodItems = async (query: string) => {
    if (!query) {
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.edamam.com/api/food-database/v2/parser`,
        {
          params: {
            app_id: FOOD_DATABASE_API_ID,
            app_key: FOOD_DATABASE_API_KEY,
            ingr: query,
          },
        }
      );

      const transformedOptions = response.data.hints.map((item: any) => ({
        food: {
          foodId: item.food.foodId,
          label: item.food.label,
          knownAs: item.food.knownAs, // Ensure this property is set if exists
          image: item.food.image,
          nutrients: {
            ENERC_KCAL: item.food.nutrients.ENERC_KCAL,
            PROCNT: item.food.nutrients.PROCNT,
            CHOCDF: item.food.nutrients.CHOCDF,
            FAT: item.food.nutrients.FAT,
          },
        },
        measures: item.measures.map((measure: any) => ({
          weight: measure.weight,
        })),
      }));
      setOptions(transformedOptions);
    } catch (error) {
      console.error("Error fetching food items:", error);
    }
    setLoading(false);
  };

  const debouncedFetchFoodItems = useCallback(
    debounce(fetchFoodItems, 500),
    []
  );

  const handleRemoveFoodItem = (index: number) => {
    removeFoodItem(date.format("YYYY-MM-DD"), mealChoice, index);
  };

  // Update state when URL query parameter changes
  useEffect(() => {
    const dateParam = searchParams.get("date");

    if (dateParam) {
      setDate(dayjs(dateParam));
    }
  }, [searchParams]);

  // Update URL when date state changes
  useEffect(() => {
    const formattedDate = date.format("YYYY-MM-DD");
    const queryParams = new URLSearchParams(searchParams.toString());

    queryParams.set("date", formattedDate);

    router.replace(`${pathname}?${queryParams.toString()}`);
  }, [date, router, pathname]);

  // Update state when URL query parameter changes
  useEffect(() => {
    const mealParam = searchParams.get("meal");

    if (mealParam) {
      setMealChoice(mealParam);
    }
  }, [searchParams]);

  // Update URL when date state changes
  useEffect(() => {
    const queryParams = new URLSearchParams(searchParams.toString());

    queryParams.set("meal", mealChoice);

    router.replace(`${pathname}?${queryParams.toString()}`);
  }, [mealChoice, router, pathname]);

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

  const handleTabChange = (e: SyntheticEvent, newValue: number) => {
    setMealChoice(mealList[newValue]);
    setSearchInput("");
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  return (
    <div
      className={`font-sans ${inter.className} text-gray-900 min-h-screen flex flex-col bg-white p-2`}
    >
      {/* Push content down to avoid overlap with fixed top bar */}
      <div className="flex-grow flex flex-col gap-4">
        {showCalendar && (
          <Calendar
            date={date}
            setDate={setDate}
            setShowCalendar={setShowCalendar}
            canHide={false}
          />
        )}

        {/* Full Width Square Card */}
        <div className="shadow-md flex w-full bg-gray-200 p-1  rounded-full">
          <StyledTabs
            value={mealList.findIndex((i) => i === mealChoice)}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="basic tabs example"
            TabIndicatorProps={{ style: { display: "none" } }} // Remove the indicator
            sx={{ width: "100%" }}
          >
            {mealList?.map((meal, index) => (
              <StyledTab
                sx={{ textTransform: "capitalize" }}
                key={meal}
                label={meal}
                id={meal}
                className="rounded-full flex-1"
              />
            ))}
          </StyledTabs>
        </div>

        <Paper
          component="form"
          sx={{
            p: "4px 16px",
            display: "flex",
            alignItems: "center",
            borderRadius: "40px",
            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.3)",
            overflow: "hidden",
            width: "100%",
          }}
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <Autocomplete
            sx={{ width: "100%" }}
            onInputChange={(event, value) => {
              debouncedFetchFoodItems(value);
            }}
            onChange={(event, value) => {
              if (!value) return;
              setSelectedFood(value);
              addFoodItem(date.format("YYYY-MM-DD"), mealChoice, value);
              setSearchInput("");
            }}
            id="food-search"
            options={options}
            loading={loading}
            getOptionLabel={(option) => option.food.label}
            renderInput={(params) => (
              <TextField
                sx={{ width: "100%" }}
                {...params}
                placeholder="Enter food item to search"
                variant="standard"
                InputProps={{
                  ...params.InputProps,
                  disableUnderline: true,
                  startAdornment: (
                    <SearchRoundedIcon fontSize="large" sx={{ px: 1 }} />
                  ),
                  endAdornment: (
                    <>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>{option.food.label}</Typography>
                </Box>
              </li>
            )}
          />
        </Paper>

        <div className="flex flex-col gap-4 mt-4 w-full ">
          {selectedFoodItems[date.format("YYYY-MM-DD")] &&
          selectedFoodItems[date.format("YYYY-MM-DD")][mealChoice]?.length >
            0 ? (
            selectedFoodItems[date.format("YYYY-MM-DD")][mealChoice].map(
              (item: SelectedFoodItem, index: number) => (
                <div
                  key={item.food.foodId}
                  className="bg-white flex flex-col p-4 gap-4 justify-center rounded-2xl  border-solid border-gray-200 border-2"
                >
                  <div className="flex w-full justify-between items-start">
                    <div className="flex justify-between gap-2 items-center">
                      {item.food.image ? (
                        <img
                          src={item.food.image}
                          alt={item.food.label}
                          className="w-20 h-20 rounded-3xl object-cover"
                        />
                      ) : (
                        <img
                          src={
                            "https://www.svgrepo.com/show/475115/fast-food.svg"
                          }
                          alt={"food placeholder img"}
                          className="w-20 h-20 rounded-3xl object-cover"
                        />
                      )}
                      <div className="flex flex-col gap-2">
                        <div className="text-xl font-medium pl-2">
                          {item.food.label}
                        </div>
                        <div className="flex gap-2 text-gray-600">
                          {item.food.nutrients?.ENERC_KCAL !== undefined && (
                            <div className="text-xs">
                              🔥 {item.food.nutrients.ENERC_KCAL.toFixed(2)}{" "}
                              KCal
                            </div>
                          )}
                          {item?.measures?.[0]?.weight !== undefined && (
                            <div className="text-xs">
                              • {item?.measures?.[0]?.weight.toFixed(2)} g
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <IconButton
                      onClick={() => handleRemoveFoodItem(index)}
                      size="large"
                      sx={{ p: 0 }}
                    >
                      <CloseRoundedIcon
                        fontSize="large"
                        sx={{ color: "#666df7", fontSize: 44 }}
                      />
                    </IconButton>
                  </div>
                  <div className="flex gap-2 justify-between">
                    <div className="mt-2 flex gap-4">
                      {/* Protein Meter */}
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-200 rounded-full h-12 w-2 flex flex-col justify-end">
                          <div
                            className="bg-green-500 rounded-full"
                            style={{
                              height: `${
                                ((item?.food?.nutrients?.PROCNT || 0) / 20) *
                                100
                              }%`,
                              width: "100%",
                            }}
                          ></div>
                        </div>
                        <div>
                          <div className="text-md font-semibold">
                            {item?.food?.nutrients?.PROCNT?.toFixed(1)} g
                          </div>
                          <div className="text-gray-600 font-medium">
                            Protein
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-4">
                      {/* Carbs Meter */}
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-200 rounded-full h-12 w-2 flex flex-col justify-end">
                          <div
                            className="bg-amber-400 rounded-full"
                            style={{
                              height: `${
                                ((item?.food?.nutrients?.CHOCDF || 0) / 20) *
                                100
                              }%`,
                              width: "100%",
                            }}
                          ></div>
                        </div>
                        <div>
                          <div className="text-md font-semibold">
                            {item?.food?.nutrients?.CHOCDF?.toFixed(1)} g
                          </div>
                          <div className="text-gray-600 font-medium">Carbs</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-4">
                      {/* Fat Meter */}
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-200 rounded-full h-12 w-2 flex flex-col justify-end">
                          <div
                            className="bg-purple-400 rounded-full"
                            style={{
                              height: `${
                                ((item?.food?.nutrients?.FAT || 0) / 20) * 100
                              }%`,
                              width: "100%",
                            }}
                          ></div>
                        </div>
                        <div>
                          <div className="text-md font-semibold">
                            {item?.food?.nutrients?.FAT?.toFixed(1)} g
                          </div>
                          <div className="text-gray-600 font-medium">Fat</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )
          ) : (
            <Typography variant="body2" className="text-gray-500">
              No food items logged for {mealChoice} on{" "}
              {date.format("MMMM D, YYYY")}.
            </Typography>
          )}
        </div>
      </div>
      <div className="h-16" />
      <Link prefetch={false} href="/">
        <div className="fixed bottom-0 left-0 right-0 shadow-2xl flex justify-between items-center p-2 ">
          <Button
            className="w-full bg-[#666df7] rounded-lg"
            variant="contained"
          >
            Done
          </Button>
        </div>
      </Link>
    </div>
  );
};

export default ViewLog;

const StyledTabs = styled(Tabs)({
  borderRadius: "24px",
  overflow: "hidden",
  "& .MuiTabs-scroller": {
    overflow: "visible !important",
  },
  "& .MuiTabs-flexContainer": {
    justifyContent: "space-between",
  },
  "& .MuiButtonBase-root": {
    flexGrow: 1,
    maxWidth: "none",
  },
});

const StyledTab = styled(Tab)({
  // minHeight: "40px",
  // minWidth: "80px",
  // padding: "0px 16px",
  borderRadius: "24px",
  "&.Mui-selected": {
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
});
