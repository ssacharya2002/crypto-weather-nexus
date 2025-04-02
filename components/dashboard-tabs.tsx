"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { fetchWeatherData } from "@/redux/features/weatherSlice";
import WeatherSection from "./weather-section";
import { fetchCryptoData } from "@/redux/features/cryptoSlice";
import { setupWebSocket, closeWebSocket } from "@/redux/features/websocketSlice";
import CryptoSection from "./crypto-section";

export default function DashboardTabs() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initial data fetch
    dispatch(fetchWeatherData());
    dispatch(fetchCryptoData());

    // Setup WebSocket connection
    dispatch(setupWebSocket());

    // Periodic data refresh (every 60 seconds)
    const intervalId = setInterval(() => {
      dispatch(fetchWeatherData());
      dispatch(fetchCryptoData());
    }, 60000);

    return () => {
      clearInterval(intervalId);
      // Clean up WebSocket connection
      dispatch(closeWebSocket());
    };
  }, [dispatch]);

  return (
    <Tabs defaultValue="weather" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger className="cursor-pointer" value="weather">
          Weather
        </TabsTrigger>
        <TabsTrigger className="cursor-pointer" value="crypto">
          Cryptocurrency
        </TabsTrigger>
        <TabsTrigger className="cursor-pointer" value="news">
          News
        </TabsTrigger>
      </TabsList>
      <TabsContent value="weather">
        <WeatherSection />
      </TabsContent>
      <TabsContent value="crypto">
        <CryptoSection />
      </TabsContent>
      <TabsContent value="news">{/* <NewsSection /> */}</TabsContent>
    </Tabs>
  );
}
