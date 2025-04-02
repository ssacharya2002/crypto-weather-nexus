import { Suspense } from "react";
import DashboardSkeleton from "@/components/dashboard-skeleton";
import DashboardTabs from "@/components/dashboard-tabs";

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          CryptoWeather Nexus
        </h1>
        <p className="text-muted-foreground">
          Your dashboard for weather, cryptocurrency, and news updates.
        </p>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardTabs />
      </Suspense>
    </div>
  );
}
