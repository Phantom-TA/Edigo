import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Use a combination of approaches to get resources
    // For now, we'll create curated results based on the query
    // In a production environment, you could use Google Custom Search API or other search services

    const resources = await fetchWebResources(query);

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Error fetching web resources:', error);
    return NextResponse.json({ resources: [] });
  }
}

async function fetchWebResources(query: string): Promise<Array<{ title: string; url: string; description: string }>> {
  // This is a simplified version. In production, you would:
  // 1. Use Google Custom Search API
  // 2. Use Bing Search API
  // 3. Use a web scraping service
  // 4. Use an aggregation service like SerpAPI

  // For now, we'll return curated educational resources based on common learning domains
  const resources: Array<{ title: string; url: string; description: string }> = [];

  // Extract domain and topic from query
  const lowerQuery = query.toLowerCase();

  // Common educational platforms
  const platforms = [
    {
      name: 'MDN Web Docs',
      baseUrl: 'https://developer.mozilla.org/en-US/search?q=',
      domains: ['web', 'javascript', 'html', 'css', 'react', 'frontend'],
      description: 'Comprehensive web development documentation'
    },
    {
      name: 'freeCodeCamp',
      baseUrl: 'https://www.freecodecamp.org/news/search/?query=',
      domains: ['programming', 'web', 'javascript', 'python', 'data'],
      description: 'Free coding tutorials and articles'
    },
    {
      name: 'GeeksforGeeks',
      baseUrl: 'https://www.geeksforgeeks.org/',
      domains: ['algorithm', 'data structure', 'programming', 'java', 'python', 'c++'],
      description: 'Computer science and programming tutorials'
    },
    {
      name: 'W3Schools',
      baseUrl: 'https://www.w3schools.com/',
      domains: ['web', 'html', 'css', 'javascript', 'sql', 'php'],
      description: 'Web development tutorials and references'
    },
  ];

  // Add relevant platform resources
  let addedCount = 0;
  for (const platform of platforms) {
    if (addedCount >= 4) break;

    // Check if query matches platform domains
    const matches = platform.domains.some(domain => lowerQuery.includes(domain));

    if (matches) {
      resources.push({
        title: `${platform.name} - ${query}`,
        url: platform.baseUrl + encodeURIComponent(query),
        description: platform.description
      });
      addedCount++;
    }
  }

  // If we don't have enough resources, add generic helpful links
  if (resources.length < 3) {
    // Add tutorial search
    resources.push({
      title: `${query} - Tutorial and Guide`,
      url: `https://www.google.com/search?q=${encodeURIComponent(query + ' tutorial guide')}`,
      description: 'Comprehensive tutorials and learning guides'
    });

    // Add YouTube search
    resources.push({
      title: `${query} - Video Tutorials`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' tutorial')}`,
      description: 'Video tutorials and walkthroughs'
    });

    // Add Stack Overflow
    resources.push({
      title: `${query} - Stack Overflow Discussions`,
      url: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
      description: 'Community Q&A and problem-solving discussions'
    });

    // Add GitHub
    resources.push({
      title: `${query} - GitHub Projects`,
      url: `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories`,
      description: 'Open source projects and code examples'
    });
  }

  // Return up to 4 resources
  return resources.slice(0, 4);
}
