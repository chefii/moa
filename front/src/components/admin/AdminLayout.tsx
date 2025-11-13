'use client';

import { useState, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Users,
  Image,
  MessageSquare,
  Calendar,
  Tag,
  AlertCircle,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Code,
  ChevronDown,
  ChevronUp,
  Settings2,
  UserCircle2,
  Calendar as CalendarIcon,
  FileText,
  LucideIcon,
  User,
  Search,
} from 'lucide-react';
import { menuCategoriesApi, MenuCategory as DBMenuCategory } from '@/lib/api/admin/menu';
import * as LucideIcons from 'lucide-react';
import { useMenuStore } from '@/store/menuStore';
import { useBadgeStore } from '@/store/badgeStore';
import AdminFooter from './AdminFooter';
import { notificationsApi } from '@/lib/api/notifications';

interface AdminLayoutProps {
  children: ReactNode;
}

interface MenuItemType {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

interface MenuCategoryType {
  name: string;
  icon: React.ElementType;
  items: MenuItemType[];
}

// Icon mapper utility
const getIconComponent = (iconName?: string): React.ElementType => {
  if (!iconName) return FileText;

  // @ts-ignore
  const IconComponent = LucideIcons[iconName];
  return IconComponent || FileText;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { refreshTrigger } = useMenuStore();
  const { reportBadgeCount, refreshReportBadge } = useBadgeStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['회원 관리', '콘텐츠 관리']);
  const [menuCategories, setMenuCategories] = useState<MenuCategoryType[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Check if user has required role
  const hasRequiredRole = (requiredRoles: string[]): boolean => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!user?.role) return false;
    return requiredRoles.includes(user.role);
  };

  // Load menu from DB
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const dbCategories = await menuCategoriesApi.getMenuCategories(false);

        // Transform DB data to component format with role-based filtering
        const transformedCategories: MenuCategoryType[] = dbCategories
          .filter((category) => hasRequiredRole(category.requiredRoles))
          .map((category) => ({
            name: category.name,
            icon: getIconComponent(category.icon),
            items: (category.menuItems || [])
              .filter((item) => hasRequiredRole(item.requiredRoles))
              .map((item) => ({
                name: item.name,
                path: item.path,
                icon: getIconComponent(item.icon),
                badge: item.badge,
              })),
          }))
          .filter((category) => category.items.length > 0);

        setMenuCategories(transformedCategories);
      } catch (error) {
        console.error('Failed to load menu from database:', error);
        setMenuCategories([]);
      } finally {
        setMenuLoading(false);
      }
    };

    loadMenu();
  }, [user?.role, refreshTrigger]);

  // Load unread notifications count
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await notificationsApi.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to load unread count:', error);
      }
    };

    loadUnreadCount();

    // Refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load notifications when dropdown opens
  const loadNotifications = async () => {
    try {
      const response = await notificationsApi.getNotifications(1, 10);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // Toggle notifications dropdown
  const toggleNotifications = async () => {
    if (!showNotifications) {
      await loadNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      // Refresh notifications and unread count
      await loadNotifications();
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      // Refresh notifications and unread count
      await loadNotifications();
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Load report badge count
  useEffect(() => {
    refreshReportBadge();
  }, [pathname, refreshReportBadge]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // 사이드바가 collapse되어 있으면 모든 카테고리를 펼치기
  useEffect(() => {
    if (sidebarCollapsed) {
      setExpandedCategories([]);
    } else {
      setExpandedCategories(['회원 관리', '콘텐츠 관리']);
    }
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header - 전체 너비 */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
        {/* Left: Mobile menu button + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo - visible on all screens */}
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/moa-logo.svg" alt="MOA Logo" className="w-full h-full" />
            </div>
            <span className="font-black text-xl text-moa-primary">
              모아 Admin
            </span>
          </Link>
        </div>

        {/* Right: Notifications, Search, User Profile */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="검색">
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors"
              title="알림"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[500px] flex flex-col">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">알림</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-moa-primary hover:text-moa-primary-dark font-semibold"
                      >
                        모두 읽음
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">알림이 없습니다</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => {
                              if (!notification.isRead) {
                                markAsRead(notification.id);
                              }
                              if (notification.link) {
                                window.location.href = notification.link;
                              }
                            }}
                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                              !notification.isRead ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {notification.type === 'SYSTEM' && (
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Bell className="w-4 h-4 text-blue-600" />
                                  </div>
                                )}
                                {notification.type === 'REPORT' && (
                                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                  </div>
                                )}
                                {notification.type === 'GATHERING' && (
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-green-600" />
                                  </div>
                                )}
                                {!['SYSTEM', 'REPORT', 'GATHERING'].includes(notification.type) && (
                                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Bell className="w-4 h-4 text-gray-600" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {notification.title}
                                  </p>
                                  {!notification.isRead && (
                                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.content}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.createdAt).toLocaleString('ko-KR', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          window.location.href = '/admin/notifications';
                        }}
                        className="w-full text-center text-sm text-moa-primary hover:text-moa-primary-dark font-semibold py-2"
                      >
                        모든 알림 보기
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* User Profile Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-moa-primary to-moa-accent rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-moa-primary/10 text-moa-primary text-xs font-medium rounded">
                  {user?.role}
                </span>
              </div>
              <div className="py-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  내 프로필
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  설정
                </Link>
              </div>
              <div className="border-t border-gray-100 py-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden min-h-[calc(100vh-4rem)]">
        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:relative h-screen lg:h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 flex flex-col
            ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
        {/* Mobile close button */}
        <div className="lg:hidden h-16 flex items-center justify-end px-4 border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 pt-6">
          {/* Dashboard */}
          <Link
            href="/admin"
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-4
              ${
                pathname === '/admin'
                  ? 'bg-moa-primary text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <LayoutDashboard className={`w-5 h-5 ${sidebarCollapsed ? 'mx-auto' : ''}`} />
            {!sidebarCollapsed && <span className="flex-1 font-medium">대시보드</span>}
          </Link>

          {/* Categories */}
          <div className="space-y-2">
            {menuLoading ? (
              // Loading skeleton
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : menuCategories.length === 0 ? (
              // No menu available
              !sidebarCollapsed && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 mb-2">메뉴가 없습니다</p>
                  <p className="text-xs text-gray-400">관리자에게 문의하세요</p>
                </div>
              )
            ) : (
              menuCategories.map((category) => {
              const CategoryIcon = category.icon;
              const isExpanded = expandedCategories.includes(category.name);

              return (
                <div key={category.name}>
                  {/* Category Header */}
                  {!sidebarCollapsed ? (
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <CategoryIcon className="w-4 h-4" />
                      <span className="flex-1 text-left text-sm font-semibold">
                        {category.name}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <div className="px-3 py-2 flex justify-center">
                      <CategoryIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  )}

                  {/* Category Items */}
                  {(!sidebarCollapsed && isExpanded) || sidebarCollapsed ? (
                    <ul className={`space-y-1 ${!sidebarCollapsed ? 'ml-4 mt-1' : ''}`}>
                      {category.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        // Use dynamic badge count for reports
                        const badgeCount = item.path === '/admin/reports'
                          ? reportBadgeCount
                          : item.badge;

                        return (
                          <li key={item.path}>
                            <Link
                              href={item.path}
                              className={`
                                flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative
                                ${
                                  active
                                    ? 'bg-moa-primary text-white shadow-lg'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }
                              `}
                              title={sidebarCollapsed ? item.name : undefined}
                            >
                              <Icon className={`w-4 h-4 ${sidebarCollapsed ? 'mx-auto' : ''}`} />
                              {!sidebarCollapsed && (
                                <>
                                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                                  {badgeCount > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                                      {badgeCount}
                                    </span>
                                  )}
                                </>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            })
            )}
          </div>
        </nav>


          {/* Toggle button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>

      {/* Footer - 전체 너비 */}
      <AdminFooter />
    </div>
  );
}
