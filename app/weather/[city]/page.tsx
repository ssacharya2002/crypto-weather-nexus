import { Suspense } from "react"
import { CityWeatherDetails } from "@/components/city-weather-details"
import { WeatherDetailsSkeleton } from "@/components/weather-details-skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const cityName = (await params).city
  const decodedCity  = decodeURIComponent(cityName)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{decodedCity } Weather</h1>
      </div>

      <Suspense fallback={<WeatherDetailsSkeleton />}>
        <CityWeatherDetails city={decodedCity } />
      </Suspense>
    </div>
  )
}

