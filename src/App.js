import "./App.css";
import React, { useState, useEffect } from "react";

function App() {
  const [weatherData, setWeatherData] = useState({});

  const baseUrl = "http://api.openweathermap.org/data/2.5/";
  const endpoint = "weather";
  const city = "Singapore";

  const [queryUrl, setQueryUrl] = useState(
    `${baseUrl}${endpoint}?q=${city}&appid=${process.env.REACT_APP_OWM_API_KEY}`
  );

  useEffect(() => {
    fetch(queryUrl)
      .then((response) => response.json())
      .then((json) => {
        setWeatherData(json);
      })
      .catch((err) => console.log(err));
  }, [queryUrl]);

  console.log(weatherData);

  return <div className="App">{weatherData.main.temp}</div>;
}

export default App;
