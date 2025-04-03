"use client";

import { useAppSelector } from "@/redux/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function NewsSection() {
  const { data, loading, error } = useAppSelector((state) => state.news);

  if (loading) {
    return <div className="text-center py-8">Loading news data...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load news data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {data.slice(0, 5).map((article, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">{article.title}</CardTitle>
            <CardDescription>
              {new Date(article.publishedAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-muted-foreground mb-2">
              {article.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Source: {article.source.name}
              </span>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  Read More <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
