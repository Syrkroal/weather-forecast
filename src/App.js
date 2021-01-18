import { useState, useEffect } from "react";
import { API_KEY } from "./.env";
import { Line } from "react-chartjs-2";

import "./App.css";

const K = -273.15;

const colors = {
    temperature: "rgba(99,132,255,1)",
    pressure: "rgba(132,255,99,1)",
    humidity: "rgba(255,99,132,1)",
    windSpeed: "rgba(244,255,69,1)",
    windDir: "rgba(255,173,69,1)",
    precipitation: "rgba(80,69,255,1)",
};

function App() {
    const [city, setCity] = useState("");
    const [weatherInfos, setWeatherInfos] = useState(null);
    const [graphs, setGraphs] = useState(null);
    const [error, setError] = useState(null);

    useEffect(parseWeatherInfos, [weatherInfos]);

    // api call to openweathermap to get the forecast
    function getWeather(event) {
        event.preventDefault();
        fetch(
            "https://api.openweathermap.org/data/2.5/forecast?q=" +
                city +
                "&appid=" +
                API_KEY
        )
            .then((res) => res.json())
            .then(
                (result) => {
                    console.log(result);
                    if (result.cod === "404") setError(result.message);
                    else setWeatherInfos(result.list);
                },
                (error) => {
                    console.log("error", error);
                }
            );
    }

    // handle the form event change for the city
    function handleChange(event) {
        setCity(event.target.value);
    }

    // parse weatherInfos to get all the data that we need for the charts
    function parseWeatherInfos() {
        if (!weatherInfos) return;
        let data = {
            temperature: [],
            pressure: [],
            humidity: [],
            windSpeed: [],
            windDir: [],
            precipitation: [],
        };
        let date = [];
        for (let i = 0; i < weatherInfos.length; i++) {
            data.temperature.push(
                parseFloat(weatherInfos[i].main.temp + K).toFixed(1)
            );
            data.pressure.push(weatherInfos[i].main.pressure);
            data.humidity.push(weatherInfos[i].main.humidity);
            data.windSpeed.push(weatherInfos[i].wind.speed);
            data.windDir.push(weatherInfos[i].wind.deg);
            if (weatherInfos[i].rain)
                data.precipitation.push(weatherInfos[i].rain["3h"]);
            else data.precipitation.push(0);
            date.push(weatherInfos[i].dt_txt);
        }
        renderWeatherGraphs(data, date);
    }

    // set graphs variable with graphs renders
    function renderWeatherGraphs(data, date) {
        setGraphs(
            Object.keys(data).map((key) => {
                const graphData = {
                    labels: date,
                    datasets: [
                        {
                            label: key,
                            backgroundColor: colors[key].slice(0, -2) + "0.2)",
                            borderColor: colors[key],
                            borderWidth: 1,
                            hoverBackgroundColor:
                                colors[key].slice(0, -2) + "0.4)",
                            hoverBorderColor: colors[key],
                            data: data[key],
                        },
                    ],
                };
                return (
                    <div className="graphContainer" key={key}>
                        <Line
                            data={graphData}
                            options={{
                                maintainAspectRatio: false,
                            }}
                        />
                    </div>
                );
            })
        );
    }

    return (
        <div className="App">
            <form className="formContainer" onSubmit={getWeather}>
                <label>
                    City :
                    <input
                        name="content"
                        type="text"
                        value={city}
                        onChange={handleChange}
                    />
                </label>
                <input type="submit" value="Send" />
            </form>
            {!weatherInfos && (
                <div>Enter a City to get a 5 days weather forecast</div>
            )}
            {error && <div>{error}</div>}
            <div className="graphs">{graphs}</div>
        </div>
    );
}

export default App;
