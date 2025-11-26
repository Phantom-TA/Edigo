"use client"
import { ReactNode, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Sidebar from './_components/Sidebar';
import Header from './_components/Header';
import { UserCourseListProvider } from '../_context/UserCourseListContext';

function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, isLoaded } = useUser();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <UserCourseListProvider>
            <div>
                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={closeSidebar}
                    />
                )}

                {/* Sidebar - Desktop: always visible, Mobile: slide from left */}
                {isLoaded && user && (
                    <div
                        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
                            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        } md:block`}
                    >
                        <Sidebar onNavigate={closeSidebar} />
                    </div>
                )}

                <div className={isLoaded && user ? 'md:ml-64' : ''}>
                    <Header onMenuClick={toggleSidebar} />
                    <div className='p-5 '>
                        {children}
                    </div>
                </div>
            </div>
        </UserCourseListProvider>
    )
}
export default DashboardLayout