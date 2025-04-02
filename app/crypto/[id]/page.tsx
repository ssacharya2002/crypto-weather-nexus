import { Suspense } from "react"
import { CryptoDetails } from "@/components/crypto-details"
import { CryptoDetailsSkeleton } from "@/components/crypto-details-skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function CryptoPage({ params }: { params: Promise<{ id: string }> }) {
  const cryptoId = (await params).id

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight capitalize">{cryptoId.replace(/-/g, " ")} Details</h1>
      </div>

      <Suspense fallback={<CryptoDetailsSkeleton />}>
        <CryptoDetails id={cryptoId} />
      </Suspense>
    </div>
  )
}

