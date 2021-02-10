import "./App.css";
import React, { useState, useEffect } from "react";
import WeatherIcon from "./components/WeatherIcon";
import WeatherExtraInfo from "./components/WeatherExtraInfo";
import LoaderApp from "./components/LoaderApp";
import MessageFlash from "./components/MessageFlash";
import WeatherInfo from "./components/WeatherInfo";
import Footer from "./components/Footer";

function App() {
  // constants
  const baseUrl = "http://api.openweathermap.org/data/2.5/";
  const endpoint = "weather";
  const endpointForecast = "forecast";

  // state and state-dependent declarations
  const [messageFlash, setMessageFlash] = useState({
    message: "",
    className: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [units, setUnits] = useState("C");
  const [weatherData, setWeatherData] = useState({
    main: {},
    sys: {},
    weather: [{}],
    wind: { speed: 0.0 },
  });
  const sunRise = weatherData.sys.sunrise * 1000;
  const sunSet = weatherData.sys.sunset * 1000;

  const [forecastData, setForecastData] = useState({ list: [{}] });
  const [weatherIcon, setWeatherIcon] = useState("loading");
  const [weatherDescription, setWeatherDescription] = useState("");
  const [cityLocalTime, setCityLocalTime] = useState("");
  const [city, setCity] = useState("London");
  const [queryUrl, setQueryUrl] = useState(
    `${baseUrl}${endpoint}?q=${city}&appid=${process.env.REACT_APP_OWM_API_KEY}`
  );
  const [forecastUrl, setForecastUrl] = useState(
    `${baseUrl}${endpointForecast}?q=${city}&appid=${process.env.REACT_APP_OWM_API_KEY}`
  );

  // effects
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      getInitialDataUsingGeolocation,
      getInitialDataUsingDefaultCity
    );
  });

  useEffect(() => {
    if (messageFlash.message === "") return;
    setTimeout(() => {
      setMessageFlash({ message: "", className: "" });
    }, 6000);
  }, [messageFlash]);

  useEffect(() => {
    const fetchQuery = fetch(queryUrl)
      .then((response) => response.json())
      .then((json) => {
        if (json.cod === "404") {
          setMessageFlash({
            message: `Can't find weather data for ${city} 😞`,
            className: "error",
          });
        } else {
          setWeatherData(json);
        }
      })
      .catch(console.log);

    const fetchForecast = fetch(forecastUrl)
      .then((response) => response.json())
      .then((json) => {
        if (json.cod === "404") {
          setMessageFlash({
            message: `Can't find weather data for ${city} 😞`,
            className: "error",
          });
        } else {
          setForecastData(json);
        }
      })
      .catch(console.log);

    Promise.all([fetchQuery, fetchForecast]).then(() => {
      setIsLoading(false);
    });
  }, [queryUrl, forecastUrl]);

  useEffect(() => {
    try {
      const iconCode = weatherData.weather[0].icon;
      if (!iconCode) return;
      setWeatherIcon(
        `${process.env.PUBLIC_URL}/assets/owm_weather_codes/${iconCode}@2x.png`
      );
      setWeatherDescription(weatherData.weather[0].description);
      setCityLocalTime(timeConverter(Date.now(), weatherData.timezone, true));
      // setIsLoading(false);
    } catch (err) {
      console.log(err);
    }
  }, [weatherData]);

  // functions - conversions
  const timeConverter = (date, offset, showDate = false) => {
    // takes date as timestamp, not as date object
    // shows time in this format: 1:23 pm
    // if showDate is true, shows date in this format:
    // Wed, 10 Feb 2021, 12:00 pm
    // offset is in seconds, and may not be
    // an integer number of hours

    const offsetMilliseconds = offset * 1000;
    const localDate = new Date(date + offsetMilliseconds);

    let options = {
      timeZone: "UTC",
      hour: "numeric",
      minute: "2-digit",
      hourCycle: "h12",
    };
    if (showDate) {
      options = {
        ...options,
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      };
    }

    const timeString = localDate.toLocaleString("en-GB", options);
    return timeString;
  };

  const tempConverter = (temp) => {
    let convertedTemp = "";
    if (units === "F") {
      convertedTemp = ((temp - 273.15) * 9) / 5 + 32;
    } else {
      convertedTemp = temp - 273.15;
    }

    return convertedTemp.toFixed(1);
  };

  // functions - API-related

  const getInitialDataUsingGeolocation = (position) => {
    const lat = position.coords.latitude;
    const long = position.coords.longitude;
    setQueryUrl(
      `${baseUrl}${endpoint}?lat=${lat}&lon=${long}&appid=${process.env.REACT_APP_OWM_API_KEY}`
    );
    setForecastUrl(
      `${baseUrl}${endpointForecast}?lat=${lat}&lon=${long}&appid=${process.env.REACT_APP_OWM_API_KEY}`
    );
  };

  const getInitialDataUsingDefaultCity = () => {
    setQueryUrl(
      `${baseUrl}${endpoint}?q=${city}&appid=${process.env.REACT_APP_OWM_API_KEY}`
    );
    setForecastUrl(
      `${baseUrl}${endpointForecast}?q=${city}&appid=${process.env.REACT_APP_OWM_API_KEY}`
    );
  };

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

  // functions - event handlers
  const changeUnits = (e) => {
    setUnits(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city === "") return;
    setQueryUrl(
      `${baseUrl}${endpoint}?q=${city}&appid=${process.env.REACT_APP_OWM_API_KEY}`
    );
    setForecastUrl(
      `${baseUrl}${endpointForecast}?q=${city}&appid=${process.env.REACT_APP_OWM_API_KEY}`
    );
  };

  const showToolTip = (tooltip) => {
    setMessageFlash({ message: tooltip, className: "tool-tip" });
  };

  return (
    <div className="App">
      <LoaderApp loading={isLoading} />
      <div className={isLoading ? "d-none" : ""}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City name"
            aria-label="input-box"
          />
          <input
            type="submit"
            value="Go"
            onSubmit={handleSubmit}
            aria-label="go-button"
          />
          <div className="temp-button-container">
            <label htmlFor="C">
              <input
                type="radio"
                id="C"
                name="units"
                value="C"
                onChange={changeUnits}
                checked={units === "C"}
              />
              ºC
            </label>
            <label htmlFor="F">
              <input
                type="radio"
                id="F"
                name="units"
                value="F"
                onChange={changeUnits}
                checked={units === "F"}
              />
              ºF
            </label>
          </div>
        </form>
        <div className="weather-info">
          <WeatherInfo
            cityName={weatherData.name}
            temp={tempConverter(weatherData.main.temp)}
            units={units}
            cityLocalTime={cityLocalTime}
            icon={weatherIcon}
            weather={weatherDescription}
          />
          <MessageFlash
            message={messageFlash.message}
            className={messageFlash.className}
          />
          <div className="weather-info-extras">
            <div
              onMouseOver={() => {
                showToolTip("Chance of rain/snow in the next 3 hours");
              }}
            >
              <WeatherExtraInfo
                align="left"
                info={getPrecipitationChance(forecastData)}
                description="precipitation chance"
                image="umbrella.svg"
                imageAlt="umbrella in rainy weather"
              />
            </div>
            <div
              onMouseOver={() => {
                showToolTip(
                  "What temperature it really feels like outside, when accounting for humidity and wind"
                );
              }}
            >
              <WeatherExtraInfo
                align="right"
                info={`${tempConverter(weatherData.main.feels_like)} º${units}`}
                description="feels like"
                image="thermometer-sunny.svg"
                imageAlt="thermometer in sunny weather"
              />
            </div>
            <div
              onMouseOver={() => {
                showToolTip(
                  "Humidity levels of 20-60% are in the 'Comfortable Range'."
                );
              }}
            >
              <WeatherExtraInfo
                align="left"
                info={`${weatherData.main.humidity}%`}
                description="humidity"
                image="humidity.svg"
                imageAlt="thermometer with raindrop"
              />
            </div>
            <div
              onMouseOver={() => {
                showToolTip("Wind speeds above 12m/s can be dangerous");
              }}
            >
              <WeatherExtraInfo
                align="right"
                info={`${weatherData.wind.speed.toFixed(1)} m/s`}
                description="wind speed"
                image="windsock.svg"
                imageAlt="windsock"
              />
            </div>
            <div
              onMouseOver={() => {
                showToolTip(
                  "The time the first rays of sun appear on the horizon"
                );
              }}
            >
              <WeatherExtraInfo
                align="left"
                info={timeConverter(sunRise, weatherData.timezone)}
                description="sunrise"
                image="sunrise.svg"
                imageAlt="sun rising over horizon"
              />
            </div>
            <div
              onMouseOver={() => {
                showToolTip(
                  "The time the last rays of sun disappear over the horizon"
                );
              }}
            >
              <WeatherExtraInfo
                align="right"
                info={timeConverter(sunSet, weatherData.timezone)}
                description="sunset"
                image="sunset.svg"
                imageAlt="sun setting on the horizon"
              />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;
