"use client"

import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { toggleFavoriteCrypto } from "@/redux/features/userPreferencesSlice"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatCurrency } from "@/lib/utils"

export default function CryptoSection() {
  const { data, loading, error } = useAppSelector((state) => state.crypto)
  const { favoriteCryptos } = useAppSelector((state) => state.userPreferences)
  const dispatch = useAppDispatch()

  if (loading) {
    return <div className="text-center py-8">Loading cryptocurrency data...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load cryptocurrency data. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  // Display favorite cryptos first
  const sortedCryptos = [...data].sort((a, b) => {
    const aIsFavorite = favoriteCryptos.includes(a.id)
    const bIsFavorite = favoriteCryptos.includes(b.id)
    if (aIsFavorite && !bIsFavorite) return -1
    if (!aIsFavorite && bIsFavorite) return 1
    return 0
  })

  return (
    <div className="space-y-4">
      {favoriteCryptos.length > 0 && (
        <div className="text-sm text-muted-foreground">Showing favorite cryptocurrencies first</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedCryptos.map((crypto) => (
          <Card key={crypto.id} className={favoriteCryptos.includes(crypto.id) ? "border-primary" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src={crypto.image || "/placeholder.svg"}
                    alt={crypto.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-xl font-bold">{crypto.name}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleFavoriteCrypto(crypto.id))}
                aria-label={favoriteCryptos.includes(crypto.id) ? "Remove from favorites" : "Add to favorites"}
              >
                <Star
                  className={`h-5 w-5 ${
                    favoriteCryptos.includes(crypto.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  }`}
                />
              </Button>
            </CardHeader>
            <CardContent className="py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{formatCurrency(crypto.current_price)}</span>
                  <div
                    className={`flex items-center space-x-1 ${
                      crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {crypto.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Market Cap: {formatCurrency(crypto.market_cap)}</div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/crypto/${crypto.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

