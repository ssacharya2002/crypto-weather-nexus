"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCityWeatherHistory } from "@/redux/features/weatherSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  AlertTriangle,
  Cloud,
  Droplets,
  Thermometer,
  Wind,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WeatherDetailsSkeleton } from "./weather-details-skeleton";

export function CityWeatherDetails({ city }: { city: string }) {
  const dispatch = useAppDispatch();
  const { currentCity, cityHistory, loading, error } = useAppSelector(
    (state) => state.weather
  );

  useEffect(() => {
    dispatch(fetchCityWeatherHistory(city));
  }, [dispatch, city]);

  if (loading) {
    return <WeatherDetailsSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load weather details. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!currentCity) {
    return (
      <Alert className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>City not found</AlertTitle>
        <AlertDescription>
          Could not find weather data for {city}.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Weather</CardTitle>
          <CardDescription>
            Last updated: {new Date().toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Thermometer className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Temperature</p>
                <p className="text-2xl font-bold">
                  {currentCity.temperature}°C
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Cloud className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Conditions</p>
                <p className="text-2xl font-bold">{currentCity.conditions}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Droplets className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Humidity</p>
                <p className="text-2xl font-bold">{currentCity.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Wind className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Wind Speed</p>
                <p className="text-2xl font-bold">
                  {currentCity.windSpeed} km/h
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="px-2">
          <Alert variant="default" className=" text-green-500">
            <AlertCircle />
            <AlertTitle>NOTE: </AlertTitle>
            <AlertDescription className="">
              Historical weather data requires a premium weather service. We're
              showing forecast data instead.
            </AlertDescription>
          </Alert>
        </div>
        <CardHeader>
          <CardTitle>Forecast Data</CardTitle>
          <CardDescription>
            Temperature and humidity trends over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
            <TabsContent value="chart" className="pt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cityHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#8884d8"
                      name="Temperature (°C)"
                    />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#82ca9d"
                      name="Humidity (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="table" className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2 text-left">Date</th>
                      <th className="border px-4 py-2 text-left">
                        Temperature (°C)
                      </th>
                      <th className="border px-4 py-2 text-left">
                        Humidity (%)
                      </th>
                      <th className="border px-4 py-2 text-left">Conditions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cityHistory.map((entry, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-muted/50" : ""}
                      >
                        <td className="border px-4 py-2">{entry.date}</td>
                        <td className="border px-4 py-2">
                          {entry.temperature}
                        </td>
                        <td className="border px-4 py-2">{entry.humidity}</td>
                        <td className="border px-4 py-2">{entry.conditions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
