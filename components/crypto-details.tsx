import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingDown, TrendingUp, DollarSign, BarChart3, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import ChartClient from "./ChartClient";

// Types from the Redux slice
interface CryptoCurrency {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  ath: number;
  ath_date: string;
  price_change_percentage_7d_in_currency?: number;
}

interface PriceHistoryEntry {
  date: string;
  price: number;
}

// Server-side data fetching function
async function getCryptoData(id: string) {
  try {
    const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";
    
    // Get coin details
    const detailsResponse = await fetch(`${COINGECKO_API_URL}/coins/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!detailsResponse.ok) {
      throw new Error(`Failed to fetch details for ${id}: ${detailsResponse.status}`);
    }

    const detailsData = await detailsResponse.json();

    // Get market chart data
    const chartResponse = await fetch(
      `${COINGECKO_API_URL}/coins/${id}/market_chart?vs_currency=usd&days=30&interval=daily`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 }, // Revalidate every 5 minutes
      }
    );

    if (!chartResponse.ok) {
      throw new Error(`Failed to fetch chart data for ${id}: ${chartResponse.status}`);
    }

    const chartData = await chartResponse.json();

    // Transform the API responses to our data format
    const currentCrypto = {
      id: detailsData.id,
      name: detailsData.name,
      symbol: detailsData.symbol,
      image: detailsData.image.large,
      current_price: detailsData.market_data.current_price.usd,
      market_cap: detailsData.market_data.market_cap.usd,
      market_cap_rank: detailsData.market_cap_rank,
      total_volume: detailsData.market_data.total_volume.usd,
      price_change_24h: detailsData.market_data.price_change_24h,
      price_change_percentage_24h: detailsData.market_data.price_change_percentage_24h,
      circulating_supply: detailsData.market_data.circulating_supply,
      total_supply: detailsData.market_data.total_supply,
      ath: detailsData.market_data.ath.usd,
      ath_date: detailsData.market_data.ath_date.usd,
      price_change_percentage_7d_in_currency: detailsData.market_data.price_change_percentage_7d_in_currency?.usd,
    };

    // Transform price history data
    const history = chartData.prices.map((item: [number, number]) => {
      const [timestamp, price] = item;
      const date = new Date(timestamp);
      return {
        date: date.toLocaleDateString(),
        price: price,
      };
    });

    return { currentCrypto, history, error: null };
  } catch (error) {
    console.error("Crypto details API error:", error);
    return { currentCrypto: null, history: [], error: (error as Error).message };
  }
}

export async function CryptoDetails({ id }: { id: string }) {
  const { currentCrypto, history: cryptoHistory, error } = await getCryptoData(id);

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load cryptocurrency details. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!currentCrypto) {
    return (
      <Alert className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Cryptocurrency not found</AlertTitle>
        <AlertDescription>Could not find data for {id}.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={currentCrypto.image || "/placeholder.svg"}
                  alt={currentCrypto.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardTitle>
                {currentCrypto.name} ({currentCrypto.symbol.toUpperCase()})
              </CardTitle>
            </div>
            <CardDescription>
              Rank #{currentCrypto.market_cap_rank} • Last updated:{" "}
              {new Date().toLocaleTimeString()}
            </CardDescription>
          </div>
          <div
            className={`flex items-center space-x-1 ${
              currentCrypto.price_change_percentage_24h >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {currentCrypto.price_change_percentage_24h >= 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            <span className="font-bold">
              {Math.abs(currentCrypto.price_change_percentage_24h).toFixed(2)}%
              (24h)
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Current Price
                </p>
                <p className="text-3xl font-bold">
                  {formatCurrency(currentCrypto.current_price)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Market Cap
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(currentCrypto.market_cap)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    24h Volume
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(currentCrypto.total_volume)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Circulating Supply
                  </p>
                  <p className="text-lg font-semibold">
                    {currentCrypto.circulating_supply.toLocaleString()}{" "}
                    {currentCrypto.symbol.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Supply
                  </p>
                  <p className="text-lg font-semibold">
                    {currentCrypto.total_supply
                      ? currentCrypto.total_supply.toLocaleString()
                      : "∞"}{" "}
                    {currentCrypto.symbol.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <p className="font-medium">Price Change (24h)</p>
                </div>
                <p
                  className={
                    currentCrypto.price_change_24h >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {formatCurrency(currentCrypto.price_change_24h)}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <p className="font-medium">All-time High</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(currentCrypto.ath)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(currentCrypto.ath_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <p className="font-medium">Price Change (7d)</p>
                </div>
                {currentCrypto.price_change_percentage_7d_in_currency !==
                  undefined && (
                  <p
                    className={
                      currentCrypto.price_change_percentage_7d_in_currency >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {currentCrypto.price_change_percentage_7d_in_currency.toFixed(
                      2
                    )}
                    %
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
          <CardDescription>Price trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mt-4">
            <ChartClient data={cryptoHistory} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}