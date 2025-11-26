import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q');
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      // Fallback: return search URL if API key not configured
      return NextResponse.json({
        videos: [],
        searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
      });
    }

    // Call YouTube Data API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=2&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('YouTube API request failed');
    }

    const data = await response.json();

    const videos = data.items?.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
    })) || [];

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);

    // Return fallback search URL
    const query = req.nextUrl.searchParams.get('q');
    return NextResponse.json({
      videos: [],
      searchUrl: query ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` : null
    });
  }
}
