import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CryptoCardsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <CardTitle>
                  <Skeleton className="h-6 w-24" />
                </CardTitle>
              </div>
              <Skeleton className="w-5 h-5 rounded-full" />
            </CardHeader>
            <CardContent className="py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-24" />
                  <div className="flex items-center space-x-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </div>
                <Skeleton className="h-4 w-40" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}