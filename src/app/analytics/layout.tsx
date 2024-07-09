import React from "react";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import Link from "next/link";
import dayjs from "dayjs";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div>
      {children}
      <div className="relative">
        <div className="fixed bottom-0 left-0 right-0 bg-[#f4edff] shadow-2xl flex justify-between items-center p-2">
          <div className="flex-1 flex justify-center">
            <div className="flex flex-col justify-center items-center ">
              <HomeOutlinedIcon />
              <Link prefetch={false} href={`/`}>
                <div>Home</div>
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex flex-col justify-center items-center">
              <div className="bg-[#e6d8ff] px-4 rounded-full">
                <BarChartRoundedIcon />
              </div>
              <Link prefetch={false} href={`/analytics`}>
                <div>Analytics</div>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex justify-center items-center bg-[#7a81fc] rounded-3xl w-20 h-20">
              <Link
                prefetch={false}
                href={`/viewlog?date=${dayjs().format(
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

export default Layout;
