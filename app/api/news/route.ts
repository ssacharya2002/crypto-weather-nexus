
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {

    const apiKey = process.env.NEWSDATA_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { message: "API key is not configured" },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${apiKey}&q=cryptocurrency&language=en&category=business`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error("News API returned an error")
    }

    const data = await response.json()

    // Transform the API response to data format
    const articles = data.results.slice(0, 5).map((article: any) => ({
      source: {
        id: article.source_id || null,
        name: article.source_name || "Unknown",
      },
      author: article.creator ? article.creator[0] : null,
      title: article.title,
      description: article.description || (article.content ? article.content.substring(0, 100) + "..." : "No description available"),
      url: article.link,
      urlToImage: article.image_url,
      publishedAt: article.pubDate,
      content: article.content,
    }))

    return NextResponse.json(articles)
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      { message: "Failed to fetch news data" },
      { status: 500 }
    )
  }
}