import React from "react";
import "../stylesheets/LoaderApp.css";

function LoaderApp({ loading }) {
  return loading && <div className="loading">Loading...</div>;
}

export default LoaderApp;
