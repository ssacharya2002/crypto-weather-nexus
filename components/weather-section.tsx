"use client"

import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Cloud, Droplets, Thermometer, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { toggleFavoriteCity } from "@/redux/features/userPreferencesSlice"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { WeatherCardsSkeleton } from "./WeatherCardsSkeleton"

export default function WeatherSection() {
  const { data, loading, error } = useAppSelector((state) => state.weather)
  const { favoriteCities } = useAppSelector((state) => state.userPreferences)
  const dispatch = useAppDispatch()

  if (loading) {
    return <WeatherCardsSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load weather data. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  // Display favorite cities first
  const sortedCities = [...data].sort((a, b) => {
    const aIsFavorite = favoriteCities.includes(a.name)
    const bIsFavorite = favoriteCities.includes(b.name)
    if (aIsFavorite && !bIsFavorite) return -1
    if (!aIsFavorite && bIsFavorite) return 1
    return 0
  })

  return (
    <div className="space-y-4">
      {favoriteCities.length > 0 && <div className="text-sm text-muted-foreground">Showing favorite cities first</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedCities.map((city) => (
          <Card key={city.name} className={favoriteCities.includes(city.name) ? "border-primary" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">{city.name}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleFavoriteCity(city.name))}
                aria-label={favoriteCities.includes(city.name) ? "Remove from favorites" : "Add to favorites"}
              >
                <Star
                  className={`h-5 w-5 ${
                    favoriteCities.includes(city.name) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  }`}
                />
              </Button>
            </CardHeader>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5 text-red-500" />
                  <span className="text-2xl font-bold">{city.temperature}°C</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center space-x-1">
                    <Cloud className="h-4 w-4 text-blue-500" />
                    <span>{city.conditions}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Droplets className="h-3 w-3" />
                    <span>{city.humidity}% humidity</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/weather/${encodeURIComponent(city.name)}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

