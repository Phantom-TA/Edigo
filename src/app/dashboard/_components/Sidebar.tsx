"use client"
import Image from 'next/image'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { HiFolderOpen, HiHome, HiOutlineGift, HiOutlineXCircle, HiAcademicCap, HiDocumentText, HiHeart } from "react-icons/hi";
import { Progress } from "@/components/ui/progress"
import { useUserCourseList } from '../../_context/UserCourseListContext';
import { useUser } from '@clerk/nextjs';

interface SidebarProps {
    onNavigate?: () => void;
}

const Sidebar = ({ onNavigate }: SidebarProps) => {
    const { user } = useUser();
    const { userCourseList } = useUserCourseList();
    const [userRole, setUserRole] = useState<'TEACHER' | 'STUDENT' | null>(null);
    const path = usePathname();
    const maxCourses = 5;
    const progressValue = Math.min((userCourseList.length / maxCourses) * 100, 100);

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

    const teacherMenu = [
        {
            id: 1,
            name: 'Home',
            icon: <HiHome />,
            path: '/'
        },
        {
            id: 2,
            name: 'My Courses',
            icon: <HiFolderOpen />,
            path: '/dashboard'
        },
        {
            id: 4,
            name: 'AI Chat',
            icon: <HiDocumentText />,
            path: '/dashboard/ai-chat'
        },
        {
            id: 5,
            name: 'Wellness',
            icon: <HiHeart />,
            path: '/dashboard/wellness'
        },
        {
            id: 7,
            name: 'Logout',
            icon: <HiOutlineXCircle />,
            path: '/dashboard/logout'
        },
    ];

    const studentMenu = [
        {
            id: 1,
            name: 'Home',
            icon: <HiHome />,
            path: '/'
        },
        {
            id: 2,
            name: 'My Enrolled Courses',
            icon: <HiAcademicCap />,
            path: '/dashboard/my-courses'
        },
        {
            id: 4,
            name: 'AI Chat',
            icon: <HiDocumentText />,
            path: '/dashboard/ai-chat'
        },
        {
            id: 5,
            name: 'Wellness',
            icon: <HiHeart />,
            path: '/dashboard/wellness'
        },
        {
            id: 7,
            name: 'Logout',
            icon: <HiOutlineXCircle />,
            path: '/dashboard/logout'
        },
    ];

    const Menu = userRole === 'STUDENT' ? studentMenu : teacherMenu;
    return (
        <div className='h-full w-64 p-5 shadow-md bg-white'>
            <Link href="/" onClick={onNavigate}>
                <Image src="/edigo-logo.svg" alt='Edigo Logo' width={50} height={60} className="cursor-pointer" />
            </Link>
            <hr className='my-5'></hr>
            <ul>
                {Menu.map((item) => (
                    <Link href={item.path} key={item.path} onClick={onNavigate}>
                        <li
                            className={`flex items-center gap-6 text-gray-500 p-3 cursor-pointer hover:bg-gray-300 hover:text-black rounded ${item.path === path ? 'bg-gray-200 text-black' : ''}`}
                        >
                            <div className="text-3xl">{item.icon}</div>
                            <h2>{item.name}</h2>
                        </li>
                    </Link>
                ))}
            </ul>
            {/* Removed course progress and upgrade message section */}

        </div>
    )
}

export default Sidebar