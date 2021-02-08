import "./App.css";
import React, { useState, useEffect } from "react";

function App() {
  const [weatherData, setWeatherData] = useState({ main: { temp: "300" } });

  const baseUrl = "http://api.openweathermap.org/data/2.5/";
  const endpoint = "weather";
  const [city, setCity] = useState("Singapore");

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setQueryUrl(
      `${baseUrl}${endpoint}?q=${city}&appid=${process.env.REACT_APP_OWM_API_KEY}`
    );
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City name"
        />
        <input type="submit" value="Go" onSubmit={handleSubmit} />
      </form>
      <p>{weatherData.main.temp}</p>
    </div>
  );
}

export default App;
