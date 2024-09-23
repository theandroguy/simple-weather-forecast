import React, { useState, useEffect } from "react";
import axios from "axios";

// Conditionally import icons if lucide-react is available
let Sun, Cloud, CloudRain, Wind, Search, Loader;
try {
  ({ Sun, Cloud, CloudRain, Wind, Search, Loader } = require("lucide-react"));
} catch (error) {
  console.warn("lucide-react not found, using fallback icons");
}

// Fallback icon component
const FallbackIcon = ({ name }) => (
  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs">
    {name.slice(0, 1)}
  </div>
);

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [topCitiesWeather, setTopCitiesWeather] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const topCities = ["Bhagalpur","Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"];

  useEffect(() => {
    const fetchTopCitiesWeather = async () => {
      try {
        const weatherData = await Promise.all(
          topCities.map((city) =>
            axios.get(`http://localhost:5000/weather?city=${city}`)
          )
        );
        setTopCitiesWeather(weatherData.map((response) => response.data));
      } catch (err) {
        setError("Error fetching top cities weather");
      }
    };

    fetchTopCitiesWeather();
  }, []);

  const handleSearch = async () => {
    if (city.trim() === "") {
      setError("Please enter a city");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `http://localhost:5000/weather?city=${city}`
      );
      setWeather(response.data);
      setIsLoading(false);
    } catch (err) {
      setError("Error fetching weather data");
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setCity(input);
    if (input.length > 1) {
      // Simulated API call for city suggestions
      // Replace this with an actual API call to get city suggestions
      const filteredCities = topCities.filter((c) =>
        c.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filteredCities);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion);
    setSuggestions([]);
    handleSearch();
  };

  const getWeatherIcon = (description) => {
    const lowerDesc = description.toLowerCase();
    if (Sun && Cloud && CloudRain && Wind) {
      if (lowerDesc.includes("sun") || lowerDesc.includes("clear")) return <Sun className="text-yellow-500" size={36} />;
      if (lowerDesc.includes("cloud")) return <Cloud className="text-gray-500" size={36} />;
      if (lowerDesc.includes("rain")) return <CloudRain className="text-blue-500" size={36} />;
      return <Wind className="text-gray-600" size={36} />;
    } else {
      return <FallbackIcon name={description} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-8">
      <h1 className="text-4xl font-light text-gray-800 mb-8">
        Weather Forecast
      </h1>

      <div className="relative mb-8 w-full max-w-md">
        <input
          type="text"
          value={city}
          onChange={handleInputChange}
          className="w-full px-4 py-2 text-lg rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
          placeholder="Search city..."
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 focus:outline-none disabled:opacity-50"
        >
          {isLoading ? (
            Loader ? <Loader className="animate-spin" size={24} /> : "Loading..."
          ) : (
            Search ? <Search size={24} /> : "🔍"
          )}
        </button>
        {suggestions.length > 0 && (
          <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg mt-1 z-10 overflow-hidden shadow-lg">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}

      {weather && (
        <div className="mt-8 bg-white p-8 rounded-lg shadow-md text-center w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800">{weather.location.name}</h2>
          <div className="flex justify-center items-center my-4">
            {getWeatherIcon(weather.current.weather_descriptions[0])}
            <p className="text-5xl font-light text-gray-800 ml-4">{weather.current.temperature}°C</p>
          </div>
          <p className="text-gray-600">
            {weather.current.weather_descriptions[0]}
          </p>
        </div>
      )}

      <div className="mt-16 w-full max-w-4xl">
        <h3 className="text-2xl font-light text-gray-800 mb-6 text-center">
          Top Cities in India
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topCitiesWeather.map((cityWeather, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md text-center"
            >
              <h4 className="text-lg font-semibold text-gray-800">{cityWeather.location.name}</h4>
              <div className="flex justify-center items-center my-2">
                {getWeatherIcon(cityWeather.current.weather_descriptions[0])}
                <p className="text-2xl font-light text-gray-800 ml-2">{cityWeather.current.temperature}°C</p>
              </div>
              <p className="text-sm text-gray-600">
                {cityWeather.current.weather_descriptions[0]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;