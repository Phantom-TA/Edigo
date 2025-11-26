'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Header from '@/app/dashboard/_components/Header';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';

interface Topic {
  topicName: string;
  description: string;
  videoSearchQuery: string;
  resources?: string[];
  estimatedHours?: string;
  completed?: boolean;
}

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
}

interface Resource {
  title: string;
  url: string;
  description: string;
}

interface Week {
  weekNumber: number;
  weekTitle: string;
  topics: Topic[];
}

interface LearningPlan {
  planTitle: string;
  description: string;
  totalDuration: string;
  estimatedWeeks: number;
  weeks: Week[];
  learningGoals?: string[];
  prerequisites?: string[] | string;
}

interface LearningPlanData {
  id: number;
  planTitle: string;
  domain: string;
  duration: number;
  planOutput: LearningPlan;
  createdAt: Date;
}

export default function LearningPlanPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const planId = params.planId as string;

  const [planData, setPlanData] = useState<LearningPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([]);
  const [topicVideos, setTopicVideos] = useState<{ [key: string]: YouTubeVideo[] }>({});
  const [topicResources, setTopicResources] = useState<{ [key: string]: Resource[] }>({});
  const [loadingVideos, setLoadingVideos] = useState<{ [key: string]: boolean }>({});
  const [loadingResources, setLoadingResources] = useState<{ [key: string]: boolean }>({});
  const [showVideos, setShowVideos] = useState<{ [key: string]: boolean }>({});
  const [showResources, setShowResources] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  useEffect(() => {
    console.log('State updated:', {
      topicVideos,
      topicResources,
      showVideos,
      showResources,
      loadingVideos,
      loadingResources
    });
  }, [topicVideos, topicResources, showVideos, showResources, loadingVideos, loadingResources]);

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/learning-plans/${planId}`);
      if (response.ok) {
        const data = await response.json();
        setPlanData(data);
        // Expand first week by default
        setExpandedWeeks([1]);
      } else {
        alert('Learning plan not found');
        router.push('/dashboard/my-courses');
      }
    } catch (error) {
      console.error('Error fetching learning plan:', error);
      alert('Failed to load learning plan');
    } finally {
      setLoading(false);
    }
  };

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks(prev =>
      prev.includes(weekNumber)
        ? prev.filter(w => w !== weekNumber)
        : [...prev, weekNumber]
    );
  };

  const fetchYouTubeVideos = async (topicKey: string, searchQuery: string) => {
    console.log('fetchYouTubeVideos called:', { topicKey, searchQuery });

    // If already fetched, just toggle visibility
    if (topicVideos[topicKey]) {
      console.log('Videos already fetched, toggling visibility');
      setShowVideos(prev => ({ ...prev, [topicKey]: !prev[topicKey] }));
      return;
    }

    setLoadingVideos(prev => ({ ...prev, [topicKey]: true }));
    setShowVideos(prev => ({ ...prev, [topicKey]: true }));

    try {
      console.log('Fetching YouTube videos...');
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      console.log('YouTube API response:', data);

      if (data.videos && data.videos.length > 0) {
        console.log('Setting videos:', data.videos);
        setTopicVideos(prev => ({ ...prev, [topicKey]: data.videos }));
      } else if (data.searchUrl) {
        console.log('No videos found, opening search URL');
        window.open(data.searchUrl, '_blank');
        setShowVideos(prev => ({ ...prev, [topicKey]: false }));
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
      window.open(searchUrl, '_blank');
      setShowVideos(prev => ({ ...prev, [topicKey]: false }));
    } finally {
      setLoadingVideos(prev => ({ ...prev, [topicKey]: false }));
    }
  };

  const fetchResources = async (topicKey: string, topicName: string, domain: string) => {
    console.log('fetchResources called:', { topicKey, topicName, domain });

    // If already fetched, just toggle visibility
    if (topicResources[topicKey]) {
      console.log('Resources already fetched, toggling visibility');
      setShowResources(prev => ({ ...prev, [topicKey]: !prev[topicKey] }));
      return;
    }

    setLoadingResources(prev => ({ ...prev, [topicKey]: true }));
    setShowResources(prev => ({ ...prev, [topicKey]: true }));

    try {
      const searchQuery = `${domain} ${topicName} tutorial guide`;
      console.log('Fetching resources with query:', searchQuery);
      const response = await fetch(`/api/web-search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      console.log('Web search API response:', data);

      if (data.resources && data.resources.length > 0) {
        console.log('Setting resources:', data.resources);
        setTopicResources(prev => ({ ...prev, [topicKey]: data.resources }));
      } else {
        console.log('No resources returned from API');
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoadingResources(prev => ({ ...prev, [topicKey]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-12">
          <p className="text-gray-600">Learning plan not found</p>
        </div>
      </div>
    );
  }

  const plan = planData.planOutput;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/my-courses')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors font-semibold"
        >
          <ArrowLeft size={20} />
          Back to My Courses
        </button>

        {/* Plan Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{plan.planTitle}</h1>
              <p className="text-gray-600 mb-4">{plan.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
                  <Clock className="text-purple-600" size={18} />
                  <span className="font-semibold text-gray-700">
                    Duration: {plan.totalDuration}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold text-gray-700">
                    {plan.estimatedWeeks} Weeks
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="font-semibold text-gray-700">
                    {planData.domain}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Goals */}
          {plan.learningGoals && plan.learningGoals.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircle className="text-purple-600" size={20} />
                Learning Goals
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {plan.learningGoals.map((goal, index) => (
                  <li key={index}>{goal}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Weekly Breakdown */}
        <div className="space-y-4">
          {plan.weeks.map((week) => (
            <div key={week.weekNumber} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Week Header */}
              <button
                onClick={() => toggleWeek(week.weekNumber)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold">
                    {week.weekNumber}
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-gray-900">{week.weekTitle}</h2>
                    <p className="text-sm text-gray-600">{week.topics.length} Topics</p>
                  </div>
                </div>
                <svg
                  className={`w-6 h-6 text-gray-600 transition-transform ${
                    expandedWeeks.includes(week.weekNumber) ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Topics */}
              {expandedWeeks.includes(week.weekNumber) && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 space-y-4">
                  {week.topics.map((topic, topicIndex) => {
                    const topicKey = `week_${week.weekNumber}_topic_${topicIndex}`;
                    return (
                      <div key={topicIndex} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">{topic.topicName}</h3>
                            <p className="text-sm text-gray-600 mb-3">{topic.description}</p>

                            {topic.estimatedHours && (
                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <Clock size={16} />
                                <span>{topic.estimatedHours}</span>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 mb-3">
                              <button
                                onClick={() => fetchYouTubeVideos(topicKey, topic.videoSearchQuery)}
                                disabled={loadingVideos[topicKey]}
                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                                {loadingVideos[topicKey] ? 'Loading...' : showVideos[topicKey] ? 'Hide Videos' : 'Watch Videos'}
                              </button>

                              <button
                                onClick={() => fetchResources(topicKey, topic.topicName, planData?.domain || '')}
                                disabled={loadingResources[topicKey]}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                {loadingResources[topicKey] ? 'Loading...' : showResources[topicKey] ? 'Hide Resources' : 'Resources'}
                              </button>
                            </div>

                            {/* Embedded Videos */}
                            {showVideos[topicKey] && topicVideos[topicKey] && topicVideos[topicKey].length > 0 && (
                              <div className="mt-4 space-y-4">
                                <h4 className="text-sm font-semibold text-gray-700">Recommended Videos:</h4>
                                <div className="grid grid-cols-1 gap-4">
                                  {topicVideos[topicKey].map((video) => (
                                    <div key={video.videoId} className="border border-gray-200 rounded-lg overflow-hidden">
                                      {/* YouTube Embed */}
                                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                        <iframe
                                          className="absolute top-0 left-0 w-full h-full"
                                          src={`https://www.youtube.com/embed/${video.videoId}`}
                                          title={video.title}
                                          frameBorder="0"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                        />
                                      </div>
                                      {/* Video Info */}
                                      <div className="p-3 bg-gray-50">
                                        <h5 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
                                          {video.title}
                                        </h5>
                                        <p className="text-xs text-gray-600">{video.channelTitle}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Resources List */}
                            {showResources[topicKey] && topicResources[topicKey] && topicResources[topicKey].length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Learning Resources:</h4>
                                <ul className="space-y-2">
                                  {topicResources[topicKey].map((resource, idx) => (
                                    <li key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                      <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block hover:bg-blue-100 transition-colors"
                                      >
                                        <div className="flex items-start gap-2">
                                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                          <div className="flex-1">
                                            <h5 className="text-sm font-semibold text-blue-900 hover:underline">
                                              {resource.title}
                                            </h5>
                                            {resource.description && (
                                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                {resource.description}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
