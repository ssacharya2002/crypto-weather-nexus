"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useRef } from "react"
import { useAppDispatch } from "@/redux/hooks"
import { fetchWeatherData } from "@/redux/features/weatherSlice"
import WeatherSection from "./weather-section"

export default function DashboardTabs() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Initial data fetch
    dispatch(fetchWeatherData())
    // Periodic data refresh (every 60 seconds)
    const intervalId = setInterval(() => {
      dispatch(fetchWeatherData())
    }, 60000)

    return () => {
      clearInterval(intervalId)
    }
  }, [dispatch])

  return (
    <Tabs defaultValue="weather" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="weather">Weather</TabsTrigger>
        <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
        <TabsTrigger value="news">News</TabsTrigger>
      </TabsList>
      <TabsContent value="weather">
        <WeatherSection />
      </TabsContent>
      <TabsContent value="crypto">
        {/* <CryptoSection /> */}
      </TabsContent>
      <TabsContent value="news">
        {/* <NewsSection /> */}
      </TabsContent>
    </Tabs>
  )
}

