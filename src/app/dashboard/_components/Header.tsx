"use client"
import { UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Menu } from 'lucide-react'

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, isLoaded } = useUser();

  return (
    <div className='flex justify-between p-5 shadow-sm items-center'>
      <div className="flex items-center gap-3">
        {/* Hamburger Menu - Only show when user is logged in */}
        {user && onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
        )}
        {/* Logo removed as requested */}
      </div>

      <div className='flex items-center gap-3'>
        {!isLoaded ? (
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
        ) : user ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <div className="flex gap-3">
            <Link href="/sign-in">
              <Button variant="outline" className="font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-violet-600 hover:bg-violet-700 font-semibold">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Header