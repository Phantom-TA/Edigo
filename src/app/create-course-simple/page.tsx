"use client"
import React, { useState, useEffect } from 'react'
import Header from '../dashboard/_components/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { GenerateAndSaveCourse } from './action'

const CreateCourseSimple = () => {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    importantTopics: '',
    markingScheme: '',
    referenceMaterial: null as File | null
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({
        ...prev,
        referenceMaterial: file
      }))
    }
  }

  // Redirect to home if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  const handleGenerate = async () => {
    if (!formData.title || !formData.duration) {
      alert('Please fill in at least the title and duration fields')
      return
    }

    setLoading(true)
    try {
      const result = await GenerateAndSaveCourse({
        formData: {
          title: formData.title,
          duration: formData.duration,
          importantTopics: formData.importantTopics,
          markingScheme: formData.markingScheme,
        },
        user: {
          email: user?.primaryEmailAddress?.emailAddress || "",
          fullName: user?.fullName || "",
          imageUrl: user?.imageUrl || ""
        },
      })

      if (result.success && result.courseId) {
        router.push(`/course/${result.courseId}/roadmap`)
      } else {
        alert('Failed to generate course. Please try again.')
      }
    } catch (error) {
      console.error('Error generating course:', error)
      alert('An error occurred while generating the course')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-violet-700 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Enter Course Details</h1>

        <div className="space-y-6">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter course title"
              className="border-gray-300 focus:border-gray-500"
            />
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Duration</label>
            <Input
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              placeholder="e.g., 4 weeks, 10 hours"
              className="border-gray-300 focus:border-gray-500"
            />
          </div>

          {/* Important Topics */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Important Topics</label>
            <Textarea
              value={formData.importantTopics}
              onChange={(e) => handleInputChange('importantTopics', e.target.value)}
              placeholder="Enter important topics to cover"
              className="border-gray-300 focus:border-gray-500 min-h-[100px]"
            />
          </div>

          {/* Marking Scheme */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Marking Scheme</label>
            <Textarea
              value={formData.markingScheme}
              onChange={(e) => handleInputChange('markingScheme', e.target.value)}
              placeholder="Enter marking scheme details"
              className="border-gray-300 focus:border-gray-500 min-h-[100px]"
            />
          </div>

          {/* Course Reference Material */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Course Reference Material</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="pdf-upload"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="pdf-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  {formData.referenceMaterial
                    ? formData.referenceMaterial.name
                    : 'Upload PDF'}
                </span>
                <span className="text-xs text-gray-400">
                  Click to browse or drag and drop
                </span>
              </label>
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-4">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-6 text-base disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateCourseSimple
