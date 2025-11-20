'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Search, Bell, Menu, X } from 'lucide-react';

export default function MobileHeader() {
  const { user, isAuthenticated } = useAuthStore();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Main Header */}
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/moa-logo.svg" alt="MOA Logo" className="w-full h-full" />
          </div>
          <span className="font-black text-xl text-moa-primary">모아</span>
        </Link>

        {/* Right Icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {isAuthenticated && user ? (
            <>
              <button className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <Link href="/profile" className="p-1">
                <div className="w-8 h-8 bg-gradient-to-br from-moa-primary to-moa-accent rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm font-semibold text-white bg-moa-primary rounded-lg"
            >
              로그인
            </Link>
          )}
        </div>
      </div>

      {/* Search Bar (Expandable) */}
      {showSearch && (
        <div className="px-4 pb-3 border-t border-gray-100 pt-3 animate-slideDown">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="모임, 키워드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moa-primary focus:border-moa-primary outline-none"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
