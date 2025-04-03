import { NextRequest, NextResponse } from 'next/server'

type WeatherCity = {
  name: string
  temperature: number
  humidity: number
  conditions: string
  windSpeed: number
}

type WeatherHistoryEntry = {
  date: string
  temperature: number
  humidity: number
  conditions: string
}

type WeatherResponse = {
  data?: WeatherCity[]
  currentCity?: WeatherCity
  history?: WeatherHistoryEntry[]
  error?: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action')
  const city = searchParams.get('city')

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenWeather API key not configured' }, 
      { status: 500 }
    )
  }

  try {
    // Route for getting all cities data
    if (action === 'all') {
      const cities = ["New York", "London", "Tokyo"]
      
      const responses = await Promise.all(
        cities.map((city) =>
          fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
            .then(async (response) => {
              if (!response.ok) {
                throw new Error(`Failed to fetch weather for ${city}`)
              }
              return response.json()
            })
        )
      )

      // Transform the API response
      const data = responses.map((data) => ({
        name: data.name,
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        conditions: data.weather[0].main,
        windSpeed: data.wind.speed,
      }))

      return NextResponse.json({ data })
    }
    
    // Route for getting city history
    else if (action === 'city' && city) {
      // Get current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
        { cache: 'no-store' }
      )

      if (!currentResponse.ok) {
        return NextResponse.json(
          { error: `Failed to fetch current weather for ${city}` }, 
          { status: 404 }
        )
      }

      const currentData = await currentResponse.json()
      const currentCity = {
        name: currentData.name,
        temperature: Math.round(currentData.main.temp),
        humidity: currentData.main.humidity,
        conditions: currentData.weather[0].main,
        windSpeed: currentData.wind.speed,
      }

      // Get coordinates
      const lat = currentData.coord.lat
      const lon = currentData.coord.lon
      
      let history: WeatherHistoryEntry[] = []
      
      try {
        // Try OneCall API first
        const oneCallResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${apiKey}&units=metric`,
          { cache: 'no-store' }
        )
        
        if (oneCallResponse.ok) {
          const oneCallData = await oneCallResponse.json()
          
          history = oneCallData.daily.slice(0, 7).map((day: any) => ({
            date: new Date(day.dt * 1000).toLocaleDateString(),
            temperature: Math.round(day.temp.day),
            humidity: day.humidity,
            conditions: day.weather[0].main,
          }))
        } else {
          throw new Error("One Call API failed")  
        }
      } catch (oneCallError) {
        // Fall back to 5-day forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
          { cache: 'no-store' }
        )
        
        if (!forecastResponse.ok) {
          return NextResponse.json(
            { error: `Failed to fetch forecast for ${city}` }, 
            { status: 500 }
          )
        }
        
        const forecastData = await forecastResponse.json()
        
        // Get one data point per day
        const uniqueDays = new Map()
        forecastData.list.forEach((item: any) => {
          const date = new Date(item.dt * 1000).toLocaleDateString()
          if (!uniqueDays.has(date)) {
            uniqueDays.set(date, {
              date,
              temperature: Math.round(item.main.temp),
              humidity: item.main.humidity,
              conditions: item.weather[0].main,
            })
          }
        })
        
        history = Array.from(uniqueDays.values())
      }

      return NextResponse.json({ currentCity, history })
    } 
    
    else {
      return NextResponse.json(
        { error: 'Invalid request parameters' }, 
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch weather data' }, 
      { status: 500 }
    )
  }
}