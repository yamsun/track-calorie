"use client";

import { useState, ReactElement, useCallback, useMemo, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  styled,
  SwipeableDrawer,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const getDaysArray = (function () {
  const names = Object.freeze([
    "sun",
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
  ]);
  return (year: number, month: number) => {
    const monthIndex = month - 1;
    const date = new Date(year, monthIndex, 1);
    const result = [];
    while (date.getMonth() === monthIndex) {
      let a: any = {};
      a["date"] = date.getDate();
      a["day"] = names[date.getDay()];
      result.push(a);
      date.setDate(date.getDate() + 1);
    }
    return result;
  };
})();

interface CustomTabProps {
  id: string;
  key: string;
  // day: {
  //   day: string;
  //   date: string;
  // };
  // dateForThisTab: string; // Assuming this is a string representing the date for this tab
  disabled?: boolean; // Make disabled prop optional
  label: ReactElement;
  "aria-controls": string;
}

const CustomTab = styled(({ key, disabled, ...props }: CustomTabProps) => (
  <Tab {...props} sx={{ mx: 0, px: 0 }} />
))(({ theme, disabled }) => ({
  textTransform: "none",
  color: "gray",
  fontWeight: 400,
  borderRadius: 32,
  "&.MuiTab-root": {
    height: 80,
    p: 0,
  },
  "&.Mui-selected": {
    backgroundColor: "#fff",
    color: "#1d4ed8",
    border: "0.1em solid lightgray",
    fontWeight: 800,
  },
  "&.Mui-focusVisible": {
    backgroundColor: "#1d4ed8",
  },
  "&.Mui-disabled": {
    opacity: 0.5,
    color: "gray",
  },
  ...(disabled && {
    opacity: 0.5,
    pointerEvents: "none",
  }),
}));

// Define the props interface
interface CalendarProps {
  date: Dayjs;
  setDate: (date: Dayjs) => void;
  setShowCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  canHide?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  date,
  setDate,
  setShowCalendar,
  canHide,
}) => {
  const [tempDate, setTempDate] = useState<dayjs.Dayjs>(dayjs());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [calendarType, setCalendarType] = useState<string>("month");
  const [dateTabValue, setDateTabValue] = useState<number>(0);

  const dayListInThisMonth = useMemo(
    () => getDaysArray(dayjs(date).year(), dayjs(date).month() + 1),
    [date]
  );

  useEffect(() => {
    let thisDate = dayjs(date).date();
    setDateTabValue(dayListInThisMonth.findIndex((i) => i?.date === thisDate));
  }, [date]);

  const handleDateChange = useCallback(
    (newDate: number) => {
      setDate(dayjs(date).date(newDate));
    },
    [date, setDate]
  );

  const handleMonthDateChange = useCallback((date: any) => {
    setTempDate(date); // Update the temporary state when the date is changed
  }, []);

  const handleMonthIncrease = useCallback(() => {
    let newDate = dayjs(date).add(1, "month").startOf("month");
    setDate(newDate);
    setDateTabValue(0);
  }, [date, setDate]);

  const handleMonthDecrease = useCallback(() => {
    let newDate = dayjs(date).subtract(1, "month").startOf("month");
    setDate(newDate);
    setDateTabValue(0);
  }, [date, setDate]);

  const handleApplyButtonClick = useCallback(() => {
    setDate(tempDate);
    setShowDatePicker(false);
  }, [tempDate, setDate]);

  const handleCancelButtonClick = useCallback(() => {
    setTempDate(date);
    setShowDatePicker(false);
  }, [date]);

  const handleDateTabChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setDateTabValue(newValue);
      handleDateChange(dayListInThisMonth[newValue]?.date);
    },
    [dayListInThisMonth, handleDateChange]
  );

  function a11yProps(index: any) {
    return {
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const renderDatePickerFooter = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        padding: 2,
        gap: 2,
      }}
    >
      <Button onClick={handleCancelButtonClick} variant="outlined" fullWidth>
        Cancel
      </Button>
      <Button onClick={handleApplyButtonClick} variant="contained" fullWidth>
        Apply
      </Button>
    </Box>
  );

  // useEffect(() => {
  //   let todaysDate = dayjs(date).date();
  //   setDateTabValue(
  //     dayListInThisMonth.findIndex((i) => i?.date === todaysDate)
  //   );
  // }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 0.5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box>
            <IconButton
              component="label"
              onClick={handleMonthDecrease}
              sx={{ px: 0 }}
            >
              <KeyboardArrowLeftIcon
                fontSize="small"
                sx={{
                  color: "gray",
                }}
              />
            </IconButton>
            <Button
              endIcon={<ExpandMoreRoundedIcon />}
              onClick={() => {
                setShowDatePicker((value) => !value);
                setCalendarType("month");
              }}
              sx={{
                color: "#000",
                background: "white",
                px: 1.5,
                borderRadius: 4,
                py: 0.5,
              }}
            >
              <Typography>
                {dayjs(date).format("MMMM")} {dayjs(date)?.format("YYYY")}
              </Typography>
            </Button>

            <IconButton
              component="label"
              onClick={handleMonthIncrease}
              sx={{ px: 0 }}
            >
              <KeyboardArrowRightIcon
                fontSize="small"
                sx={{
                  color: "gray",
                }}
              />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Box
            sx={{ background: "#fff", borderRadius: 8, p: 1 }}
            onClick={() => {
              setShowDatePicker((value) => !value);
              setCalendarType("day");
            }}
          >
            <TodayRoundedIcon />
          </Box>
          {canHide ? (
            <Button
              endIcon={<KeyboardArrowUpIcon />}
              onClick={() => {
                setShowCalendar(false);
              }}
              size="small"
              sx={{
                color: "#f87171", // Text color
                borderColor: "#f87171", // Border color
                px: 1,
                py: 0,
                borderRadius: 4,
                "&:hover": {
                  borderColor: "tomato", // Hover border color
                },
              }}
              variant="outlined"
            >
              <Typography
                variant="caption"
                sx={{
                  textTransform: "lowercase",
                  fontSize: "0.75rem",
                  textAlign: "center",
                }}
              >
                hide
              </Typography>
            </Button>
          ) : null}
        </Box>
      </Box>

      {/* Date Picker */}
      <Box
        sx={{
          width: "100%",
        }}
      >
        <SwipeableDrawer
          anchor="bottom"
          open={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onOpen={() => setShowDatePicker(true)}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StaticDatePicker
              displayStaticWrapperAs="desktop"
              disableFuture
              value={tempDate}
              openTo={calendarType == "day" ? "day" : "month"}
              views={
                calendarType == "day"
                  ? ["day", "month", "year"]
                  : ["month", "year"]
              }
              onChange={handleMonthDateChange}
            />
          </LocalizationProvider>
          <Box
            sx={{
              backgroundColor: "white",
              position: "relative",
            }}
          >
            {renderDatePickerFooter()}
          </Box>
        </SwipeableDrawer>
      </Box>

      {/* Date Tabs */}
      <Box>
        <Tabs
          value={dateTabValue}
          onChange={handleDateTabChange}
          variant="scrollable"
          scrollButtons
          // allowScrollButtonsMobile
          aria-label="scrollable auto tabs example"
          TabIndicatorProps={{ style: { display: "none" } }}
        >
          {dayListInThisMonth?.map((i, index) => (
            <CustomTab
              key={i?.date}
              id={`tab-${index}`}
              // day={i}
              // dateForThisTab={dayjs(date).set("date", i?.date).toString()}
              label={
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ textTransform: "capitalize" }}>
                    {i?.day}
                  </Typography>
                  <Typography>
                    <b>{i?.date}</b>
                  </Typography>
                  {i.date == dayjs().date() &&
                    date.month() == dayjs().month() && (
                      <HorizontalRuleIcon
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      />
                    )}
                </Box>
              }
              sx={{
                px: 0,
                // width: "min-content",
                minWidth: 50,
                textTransform: "capitalize",
              }}
              aria-controls={`simple-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
};

export default Calendar;
