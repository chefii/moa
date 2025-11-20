'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  AlertCircle,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { usersApi } from '@/lib/api/users';
import { reportsApi } from '@/lib/api/admin/reports';
import { gatheringsApi } from '@/lib/api/gatherings';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    businessAccounts: 0,
    activeGatherings: 0,
    pendingReports: 0,
    totalUsersChange: 0,
    businessAccountsChange: 0,
    activeGatheringsChange: 0,
    pendingReportsChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const fetchStats = async () => {
    try {
      // Fetch user stats, report stats, and gathering stats in parallel
      const [userStats, reportStats, gatheringStats] = await Promise.all([
        usersApi.getUserStats(),
        reportsApi.getReportStats().catch(() => ({
          totalReports: 0,
          pendingReports: 0,
          reviewingReports: 0,
          resolvedReports: 0,
          rejectedReports: 0,
        })),
        gatheringsApi.getGatheringStats().catch(() => ({
          totalGatherings: 0,
          activeGatherings: 0,
          completedGatherings: 0,
        })),
      ]);

      const currentTotalUsers = userStats.totalUsers;
      const currentBusinessAccounts = (userStats.roleStats.ROLE_BUSINESS_USER || 0) +
                                      (userStats.roleStats.ROLE_BUSINESS_MANAGER || 0) +
                                      (userStats.roleStats.ROLE_BUSINESS_PENDING || 0);

      // Calculate previous week's users (those who joined more than 7 days ago)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // For now, we'll estimate 7-day growth
      // In a real scenario, you'd have an API endpoint that returns historical data
      const recentUsersCount = userStats.recentUsers || 0;
      const previousTotalUsers = currentTotalUsers - recentUsersCount;

      // Calculate percentage changes
      const totalUsersChange = calculatePercentageChange(currentTotalUsers, previousTotalUsers);

      // Calculate pending reports (PENDING + REVIEWING)
      const pendingReportsCount = reportStats.pendingReports + reportStats.reviewingReports;

      setStats({
        totalUsers: currentTotalUsers,
        businessAccounts: currentBusinessAccounts,
        activeGatherings: gatheringStats.activeGatherings,
        pendingReports: pendingReportsCount,
        totalUsersChange,
        businessAccountsChange: 0, // Would need historical data
        activeGatheringsChange: 0, // Would need historical data
        pendingReportsChange: 0, // Would need historical data
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPercentageChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const statCards = [
    {
      title: '총 사용자',
      value: stats.totalUsers,
      change: stats.totalUsersChange !== 0 ? formatPercentageChange(stats.totalUsersChange) : '0%',
      trend: stats.totalUsersChange >= 0 ? 'up' : 'down',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      tooltip: '지난 7일간 가입자 대비 증가율',
    },
    {
      title: '진행중인 모임',
      value: stats.activeGatherings,
      change: '데이터 없음',
      trend: 'up',
      icon: Calendar,
      color: 'from-moa-primary to-moa-accent',
      tooltip: '지난 주 대비 증가율',
    },
    {
      title: '비즈니스 계정',
      value: stats.businessAccounts,
      change: '데이터 없음',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      tooltip: '지난 주 대비 증가율',
    },
    {
      title: '대기중인 신고',
      value: stats.pendingReports,
      change: '데이터 없음',
      trend: 'up',
      icon: AlertCircle,
      color: 'from-orange-500 to-red-500',
      tooltip: '지난 주 대비 증감률',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">대시보드</h1>
        <p className="text-gray-600">플랫폼 주요 지표를 한눈에 확인하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.change === '데이터 없음' ? (
                  <div className="flex items-center gap-1 text-sm font-semibold text-gray-400">
                    {stat.change}
                  </div>
                ) : (
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
              <p className="text-3xl font-black text-gray-900">
                {loading ? '-' : stat.value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">빠른 액션</h2>
          <div className="space-y-2">
            <button className="w-full px-4 py-3 bg-moa-primary text-white font-semibold rounded-xl hover:shadow-lg transition-shadow">
              새 배너 등록
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
              공지사항 작성
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
              이벤트 만들기
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">최근 활동</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-gray-600 flex-1">새로운 사용자가 가입했습니다</p>
              <span className="text-xs text-gray-400">방금 전</span>
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-gray-600 flex-1">새 모임이 등록되었습니다</p>
              <span className="text-xs text-gray-400">5분 전</span>
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <p className="text-sm text-gray-600 flex-1">신고가 접수되었습니다</p>
              <span className="text-xs text-gray-400">10분 전</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
