import "./App.css";
import React, { useState, useEffect } from "react";

function App() {
  const [weatherData, setWeatherData] = useState({
    main: { temp: "300" },
    sys: {},
  });

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
        console.log(weatherData);
      })
      .catch((err) => console.log(err));
  }, [queryUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setQueryUrl(
      `${baseUrl}${endpoint}?q=${city}&appid=${process.env.REACT_APP_OWM_API_KEY}`
    );
  };

  const tempConvertor = (temp) => {
    return (temp - 273.15).toFixed(1);
  };

  const sunRise = new Date(weatherData.sys.sunrise * 1000);
  const sunSet = new Date(weatherData.sys.sunset * 1000);

  const timeConverter = (date, offset) => {
    // takes date object
    // returns string in format hh:mm AM/PM
    // offset is in seconds, and may not be
    // an integer number of hours

    const offsetMilliseconds = offset * 1000;
    const localDate = new Date(date.getTime() + offsetMilliseconds);

    const hours24 = localDate.getUTCHours();
    const minutes = localDate.getUTCMinutes();
    const minutesPadded = minutes < 9 ? `0${minutes}` : minutes;
    const hours12 = hours24 % 12;
    const ampm = hours24 < 12 ? "AM" : "PM";

    return `${hours12}:${minutesPadded} ${ampm}`;
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
      <div className="weather-info">
        <div className="weather-info-main">
          <div className="temp-current">
            {tempConvertor(weatherData.main.temp)} ºC
          </div>
          <div className="info-small">{weatherData.name}</div>
        </div>
        <div className="weather-info-extras">
          <div className="weather-info-cell">
            <div className="info-medium">
              {tempConvertor(weatherData.main.temp_min)} ºC
            </div>
            <div className="info-small">minimum</div>
          </div>
          <div className="weather-info-cell">
            <div className="info-medium">
              {tempConvertor(weatherData.main.temp_max)} ºC
            </div>
            <div className="info-small">maximum</div>
          </div>
          <div className="weather-info-cell">
            <div className="info-medium">{weatherData.main.humidity} %</div>
            <div className="info-small">humidity</div>
          </div>
          <div className="weather-info-cell">
            <div className="info-medium">60%</div>
            <div className="info-small">precipitation chance</div>
          </div>
          <div className="weather-info-cell">
            <div className="info-medium">
              {timeConverter(sunRise, weatherData.timezone)}
            </div>
            <div className="info-small">sunrise</div>
          </div>
          <div className="weather-info-cell">
            <div className="info-medium">
              {timeConverter(sunSet, weatherData.timezone)}
            </div>
            <div className="info-small">sunset</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
