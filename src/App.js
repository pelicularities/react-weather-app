import "./App.css";
import React, { useState, useEffect } from "react";
import WeatherIcon from "./components/WeatherIcon";
import WeatherExtraInfo from "./components/WeatherExtraInfo";

function App() {
  const [weatherData, setWeatherData] = useState({
    main: {},
    sys: {},
    weather: [{}],
  });

  const [forecastData, setForecastData] = useState({ list: [{}] });

  const [weatherIcon, setWeatherIcon] = useState("loading");
  const [weatherDescription, setWeatherDescription] = useState("");

  const [cityLocalTime, setCityLocalTime] = useState("");

  const baseUrl = "http://api.openweathermap.org/data/2.5/";
  const endpoint = "weather";
  const endpointForecast = "forecast";
  const [city, setCity] = useState("Singapore");

  const [queryUrl, setQueryUrl] = useState(
    `${baseUrl}${endpoint}?q=${city}&appid=${process.env.REACT_APP_OWM_API_KEY}`
  );

  const [forecastUrl, setForecastUrl] = useState(
    `${baseUrl}${endpointForecast}?q=${city}&appid=${process.env.REACT_APP_OWM_API_KEY}`
  );

  const timeConverter = (date, offset, showDate = false) => {
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

    const timeString = `${hours12}:${minutesPadded} ${ampm}`;

    if (showDate) {
      const day = localDate.getUTCDay();
      const dateNumber = localDate.getUTCDate();
      const month = localDate.getUTCMonth();
      const year = localDate.getUTCFullYear();
      const dateString = localDate.toLocaleDateString();
      return `${dateString} ${timeString}`;
    }

    return timeString;
  };

  useEffect(() => {
    fetch(queryUrl)
      .then((response) => response.json())
      .then((json) => {
        setWeatherData(json);
        console.log(weatherData);
      })
      .catch((err) => console.log(err));

    fetch(forecastUrl)
      .then((response) => response.json())
      .then((json) => {
        setForecastData(json);
        console.log(forecastData.list[0]);
      })
      .catch((err) => console.log(err));
  }, [queryUrl, forecastUrl]);

  useEffect(() => {
    try {
      const iconCode = weatherData.weather[0].icon;
      setWeatherIcon(`http://openweathermap.org/img/wn/${iconCode}@2x.png`);
      setWeatherDescription(weatherData.weather[0].description);
      setCityLocalTime(timeConverter(new Date(), weatherData.timezone, true));
    } catch (err) {
      console.log(err);
    }
  }, [weatherData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setQueryUrl(
      `${baseUrl}${endpoint}?q=${city}&appid=${process.env.REACT_APP_OWM_API_KEY}`
    );
    setForecastUrl(
      `${baseUrl}${endpointForecast}?q=${city}&appid=${process.env.REACT_APP_OWM_API_KEY}`
    );
  };

  const tempConvertor = (temp) => {
    return (temp - 273.15).toFixed(1);
  };

  const currentDate = new Date();
  const currentDate_string = currentDate.toUTCString();

  const sunRise = new Date(weatherData.sys.sunrise * 1000);
  const sunSet = new Date(weatherData.sys.sunset * 1000);

  const getPrecipitationChance = (forecastData) => {
    try {
      if (forecastData.list[0].pop) {
        return `${Math.round(forecastData.list[0].pop * 100)}%`;
      } else {
        // no percentage of precipitation returned by API
        // i.e. no chance of precipitation in next 3 hours
        return "0%";
      }
    } catch (err) {
      console.log(err);
      return "N/A";
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City name"
          aria-label = "input-box"
        />
        <input type="submit" value="Go" onSubmit={handleSubmit} aria-label="go-button"/>
      </form>
      <div className="weather-info">
        <div className="info-small">{cityLocalTime}</div>
        <div className="weather-info-main">
          <WeatherIcon icon={weatherIcon} weather={weatherDescription} />
          <div>
            <div className="temp-current">
              {tempConvertor(weatherData.main.temp)} ºC
            </div>
            <div className="info-small">{weatherData.name}</div>
          </div>
        </div>
        <div className="weather-info-extras">
          <WeatherExtraInfo
            align="left"
            info={`${tempConvertor(weatherData.main.temp_min)} ºC`}
            description="minimum"
            image="thermometer-cold.svg"
            imageAlt="thermometer in cold weather"
          />
          <WeatherExtraInfo
            align="right"
            info={`${tempConvertor(weatherData.main.temp_max)} ºC`}
            description="maximum"
            image="thermometer-sunny.svg"
            imageAlt="thermometer in sunny weather"
          />
          <WeatherExtraInfo
            align="left"
            info={`${weatherData.main.humidity} %`}
            description="humidity"
            image="humidity.svg"
            imageAlt="thermometer with raindrop"
          />
          <WeatherExtraInfo
            align="right"
            info={getPrecipitationChance(forecastData)}
            description="precipitation chance"
            image="umbrella.svg"
            imageAlt="umbrella in rainy weather"
          />
          <WeatherExtraInfo
            align="left"
            info={timeConverter(sunRise, weatherData.timezone)}
            description="sunrise"
            image="sunrise.svg"
            imageAlt="sun rising over horizon"
          />
          <WeatherExtraInfo
            align="right"
            info={timeConverter(sunSet, weatherData.timezone)}
            description="sunset"
            image="sunset.svg"
            imageAlt="sun setting on the horizon"
          />
        </div>
      </div>
      <div>
        Icons made by{" "}
        <a href="https://www.freepik.com" title="Freepik">
          Freepik
        </a>{" "}
        from{" "}
        <a href="https://www.flaticon.com/" title="Flaticon">
          www.flaticon.com
        </a>
      </div>
    </div>
  );
}

export default App;
