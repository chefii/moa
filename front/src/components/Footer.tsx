'use client';

import Link from 'next/link';
import { Instagram, Facebook, Youtube, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/moa-logo.svg" alt="MOA Logo" className="w-full h-full" />
              </div>
              <span className="font-black text-xl text-moa-primary">모아</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              관심사로 모이는 사람들,<br />
              함께 만드는 즐거운 모임 플랫폼입니다.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-moa-primary hover:border-moa-primary hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-moa-primary hover:border-moa-primary hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-moa-primary hover:border-moa-primary hover:text-white transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@moa.com"
                className="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-moa-primary hover:border-moa-primary hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">서비스</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/gatherings" className="text-gray-600 hover:text-moa-primary text-sm transition-colors">
                  모임 둘러보기
                </Link>
              </li>
              <li>
                <Link href="/create-gathering" className="text-gray-600 hover:text-moa-primary text-sm transition-colors">
                  모임 만들기
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-600 hover:text-moa-primary text-sm transition-colors">
                  이용방법
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-moa-primary text-sm transition-colors">
                  자주 묻는 질문
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">회사</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-moa-primary text-sm transition-colors">
                  회사 소개
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-moa-primary text-sm transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-moa-primary text-sm transition-colors">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-moa-primary text-sm transition-colors">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} MOA All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="text-sm text-gray-500 hover:text-moa-primary transition-colors">
                이용약관
              </Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-moa-primary transition-colors">
                개인정보처리방침
              </Link>
              <Link href="/admin" className="text-sm text-gray-500 hover:text-moa-primary transition-colors">
                관리자
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
