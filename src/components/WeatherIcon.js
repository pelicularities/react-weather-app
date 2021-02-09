import React, { useState } from "react";
import Loader from "react-loader-spinner";

function WeatherIcon({ icon, weather }) {
  if (icon == "loading") {
    return <Loader type="ThreeDots" color="#888888" height={80} width={80} />;
  }
  return <img className="sun-image" src={icon} alt={weather} />;
}

export default WeatherIcon;
