# CryptoWeather Nexus

A multi-page dashboard combining real-time weather data, cryptocurrency information, and WebSocket notifications.

## Demo

[Live Demo](https://crypto-weather-nexus-five.vercel.app/)

## Features

- **Weather Dashboard:** Display of current conditions for multiple cities with temperature, humidity, and forecast
- **Cryptocurrency Tracking:** Real-time price updates via WebSocket for Bitcoin, Ethereum, and more
- **News Feed:** Latest crypto news headlines
- **User Preferences:** Favorite cities and cryptocurrencies with persistent storage
- **Real-Time Notifications:** WebSocket alerts for significant price changes and weather events
- **Detailed Views:** In-depth pages for both weather locations and cryptocurrencies

## Tech Stack

- **Framework:** Next.js 13+ with file-based routing
- **State Management:** Redux with Thunk middleware
- **Styling:** Tailwind CSS, shadcn UI library
- **Real-Time Data:** WebSocket integration with CoinCap API
- **External APIs:**
  - Weather: OpenWeatherMap
  - Crypto: CoinGecko/CoinCap
  - News: NewsData.io

## Installation

```bash
# Clone repository
git clone https://github.com/ssacharya2002/crypto-weather-nexus

# Install dependencies
cd crypto-weather-nexus
npm install

# Set up environment variables
# create .env file and add your API keys
NEWSDATA_API_KEY=
OPENWEATHER_API_KEY=

# Run development server
npm run dev
```

## Design Decisions

- **File-based Routing:** Leveraged Next.js for optimized navigation and page transitions
- **API routes:** Utilized Next.js API routes for efficient data fetching and protecting API keys
- **Data Refresh Strategy:** 60-second intervals for API data with fallback UI for partial failures
- **WebSocket Implementation:** Direct connection to CoinCap for real-time price data
- **State Management:** Centralized Redux store for global state and user preferences
- **Responsive Approach:** Mobile-first design with Tailwind breakpoints

## Challenges and Solutions

- **API Rate Limiting:** Implemented caching strategies to avoid exceeding free tier limits
- **WebSocket Reliability:** Added reconnection logic and status indicators
