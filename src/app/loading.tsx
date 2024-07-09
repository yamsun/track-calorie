import { CircularProgress } from "@mui/material";
import React from "react";

const Loading = () => {
  return (
    <div className="h-full w-full flex justify-center items-center">
      <CircularProgress />
    </div>
  );
};

export default Loading;
