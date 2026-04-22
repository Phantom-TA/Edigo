"use client"
import React, { useEffect, useState } from 'react'
import Header from "./_components/Header"
import BrowseCourses from './dashboard/_components/BrowseCourses'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HiSparkles, HiAcademicCap, HiUserGroup, HiLightningBolt } from 'react-icons/hi'

export default function Home(){
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState<'TEACHER' | 'STUDENT' | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/user/role');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const handleCreateClick = () => {
    if (userRole === 'STUDENT') {
      router.push('/dashboard/create-learning-plan');
    } else {
      router.push('/create-course-simple');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-violet-100 selection:text-violet-900">
      <Header/>

      <main className="relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-violet-200/40 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[40%] bg-indigo-200/30 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24">
          {!isLoaded ? (
            <div className="glass rounded-3xl p-20 flex items-center justify-center animate-in fade-in zoom-in duration-500">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-violet-600 font-medium animate-pulse">Initializing Edigo...</p>
              </div>
            </div>
          ) : !user ? (
            /* Hero Section for Guest Users */
            <div className="relative">
              <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-sm font-semibold mb-8 shadow-sm">
                  <HiSparkles className="animate-pulse" />
                  <span>The Future of AI-Powered Learning</span>
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black tracking-tight text-gray-900 mb-8 leading-[1.1]">
                  Master Anything with <br />
                  <span className="gradient-text animate-gradient">Artificial Intelligence</span>
                </h1>
                
                <p className="max-w-3xl mx-auto text-xl text-gray-600 mb-12 leading-relaxed">
                  Connect. Learn. Grow. Edigo is where students and teachers harness 
                  the power of AI to unlock personalized, high-impact learning experiences.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/sign-up">
                    <Button className="h-16 px-10 text-lg font-bold rounded-2xl bg-gray-900 text-white hover:bg-black transition-all shadow-xl hover:shadow-gray-200 hover:-translate-y-1">
                      Start Learning Free
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button variant="outline" className="h-16 px-10 text-lg font-bold rounded-2xl border-2 border-gray-200 hover:border-violet-600 hover:text-violet-600 transition-all">
                      Existing Member
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                {[
                  { icon: <HiAcademicCap />, title: "AI Courses", desc: "Generate full structured courses in seconds with our advanced AI engine." },
                  { icon: <HiLightningBolt />, title: "Learning Plans", desc: "Personalized roadmap tailored exactly to your goals and pace." },
                  { icon: <HiUserGroup />, title: "Active Community", desc: "Collaborate with other learners and experts in real-time chat rooms." }
                ].map((feature, i) => (
                  <div key={i} className="glass p-8 rounded-[2.5rem] hover:border-violet-300 transition-all group cursor-default">
                    <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Welcome Section for Enrolled Users */
            <div className="glass rounded-[3rem] p-10 md:p-16 mb-20 relative overflow-hidden animate-in zoom-in-95 duration-500">
               {/* Decorative Gradient Inner */}
               <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-violet-100/50 to-transparent pointer-events-none" />
               
               <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                    Welcome back, <span className="gradient-text uppercase">{user?.fullName || user?.username}</span>
                  </h2>
                  <p className="text-lg text-gray-600 max-w-xl font-medium">
                    Your journey continues. Ready to conquer your next learning objective with AI?
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="h-14 px-8 text-base font-bold rounded-2xl bg-gray-900 text-white hover:bg-black transition-all shadow-lg hover:-translate-y-1"
                  >
                    View Dashboard
                  </Button>
                  <Button
                    onClick={handleCreateClick}
                    className="h-14 px-8 text-base font-bold rounded-2xl bg-white text-violet-600 border-2 border-violet-200 hover:border-violet-600 transition-all shadow-md hover:-translate-y-1"
                  >
                    {userRole === 'STUDENT' ? '+ New Learning Plan' : '+ New AI Course'}
                  </Button>
                </div>
               </div>
            </div>
          )}

          {/* Browse Section */}
          <section className="animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-gray-200" />
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Discover Courses</h2>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <BrowseCourses />
          </section>
        </div>
      </main>

      <footer className="border-t border-gray-100 h-24 flex items-center justify-center bg-white">
        <p className="text-gray-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} Edigo Learning. Empowered by AI.
        </p>
      </footer>
    </div>
  )
}

