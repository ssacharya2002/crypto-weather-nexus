"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchNewsData } from "@/redux/features/newsSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";

export default function NewsSection() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.news);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => dispatch(fetchNewsData())}>Retry</Button>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No news articles available.</p>
        <Button onClick={() => dispatch(fetchNewsData())} className="mt-4">
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((article) => (
        <Card key={article.url} className="flex flex-col">
          {article.urlToImage && (
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
              <Image
                src={article.urlToImage}
                alt={article.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
                loading="lazy"
                width={500}
                height={300}
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="line-clamp-2">{article.title}</CardTitle>
            <CardDescription>
              {article.source.name} •{" "}
              {new Date(article.publishedAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {article.description}
            </p>
          </CardContent>
          <CardContent className="pt-0">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(article.url, "_blank")}
            >
              Read More <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
