'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Tag,
  DollarSign,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import MobileLayout from '@/components/MobileLayout';
import ImageUploader from '@/components/ImageUploader';
import Toast, { ToastType } from '@/components/Toast';
import { gatheringsApi, GatheringType, CreateGatheringDto } from '@/lib/api/gatherings';
import apiClient from '@/lib/api/client';

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export default function CreateGatheringPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateGatheringDto>({
    title: '',
    description: '',
    categoryId: '',
    imageId: '',
    gatheringType: 'FREE',
    locationAddress: '',
    locationDetail: '',
    scheduledAt: '',
    durationMinutes: 120,
    maxParticipants: 10,
    price: 0,
    depositAmount: 0,
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get<any>('/api/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '모임 제목을 입력해주세요';
    }

    if (!formData.description.trim()) {
      newErrors.description = '모임 설명을 입력해주세요';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = '카테고리를 선택해주세요';
    }

    if (!formData.locationAddress.trim()) {
      newErrors.locationAddress = '모임 장소를 입력해주세요';
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = '모임 일시를 선택해주세요';
    } else {
      const scheduledDate = new Date(formData.scheduledAt);
      if (scheduledDate < new Date()) {
        newErrors.scheduledAt = '과거 날짜는 선택할 수 없습니다';
      }
    }

    if (formData.maxParticipants < 2) {
      newErrors.maxParticipants = '최소 2명 이상이어야 합니다';
    }

    if (formData.gatheringType === 'PAID_CLASS' && formData.price <= 0) {
      newErrors.price = '유료 클래스는 참가비를 입력해주세요';
    }

    if (formData.gatheringType === 'DEPOSIT' && formData.depositAmount <= 0) {
      newErrors.depositAmount = '보증금을 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await gatheringsApi.createGathering(formData);
      setToast({ message: '모임이 생성되었습니다!', type: 'success' });
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error: any) {
      console.error('Failed to create gathering:', error);
      setToast({
        message: error.response?.data?.message || '모임 생성에 실패했습니다.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && formData.tags && formData.tags.length < 5) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleTagRemove = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((_, i) => i !== index) || [],
    });
  };

  const gatheringTypes = [
    { value: 'FREE', label: '무료 모임', description: '참가비가 없는 모임' },
    { value: 'PAID_CLASS', label: '유료 클래스', description: '참가비를 받는 모임' },
    { value: 'DEPOSIT', label: '보증금', description: '노쇼 방지 보증금' },
  ];

  return (
    <MobileLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-lg font-black text-gray-900">모임 만들기</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 pb-20">
        {/* Image Upload */}
        <section className="px-5 py-6 bg-white border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-900 mb-3">
            모임 이미지 <span className="text-gray-400 font-normal">(선택)</span>
          </h2>
          <ImageUploader
            value={formData.imageId}
            onChange={(fileId) => setFormData({ ...formData, imageId: fileId || '' })}
            uploadType="gathering"
            placeholder="모임을 대표하는 이미지를 등록하세요"
            aspectRatio="video"
          />
        </section>

        {/* Basic Info */}
        <section className="px-5 py-6 bg-white border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-900 mb-4">기본 정보</h2>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              모임 제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="예) 홍대 근처에서 함께 러닝하실 분"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={50}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">{formData.title.length}/50</p>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              카테고리 *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, categoryId: category.id })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.categoryId === category.id
                      ? 'border-moa-primary bg-moa-primary/10'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <p className="text-sm font-bold text-gray-900">{category.name}</p>
                </button>
              ))}
            </div>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.categoryId}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              모임 설명 *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="모임에 대해 자세히 설명해주세요"
              rows={5}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={500}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">{formData.description.length}/500</p>
          </div>
        </section>

        {/* Location & Time */}
        <section className="px-5 py-6 bg-white border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-900 mb-4">장소 및 일시</h2>

          {/* Location */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              장소 *
            </label>
            <input
              type="text"
              value={formData.locationAddress}
              onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
              placeholder="예) 홍대입구역 8번 출구"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary ${
                errors.locationAddress ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.locationAddress && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.locationAddress}
              </p>
            )}
          </div>

          {/* Location Detail */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              상세 장소 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <input
              type="text"
              value={formData.locationDetail}
              onChange={(e) => setFormData({ ...formData, locationDetail: e.target.value })}
              placeholder="예) 스타벅스 홍대점 2층"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary"
            />
          </div>

          {/* Scheduled Date & Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              모임 일시 *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  value={formData.scheduledAt ? formData.scheduledAt.split('T')[0] : ''}
                  onChange={(e) => {
                    const time = formData.scheduledAt ? formData.scheduledAt.split('T')[1] : '10:00';
                    setFormData({ ...formData, scheduledAt: `${e.target.value}T${time}` });
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary ${
                    errors.scheduledAt ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <input
                  type="time"
                  value={formData.scheduledAt ? formData.scheduledAt.split('T')[1] || '10:00' : '10:00'}
                  onChange={(e) => {
                    const date = formData.scheduledAt ? formData.scheduledAt.split('T')[0] : '';
                    setFormData({ ...formData, scheduledAt: `${date}T${e.target.value}` });
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary ${
                    errors.scheduledAt ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            {errors.scheduledAt && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.scheduledAt}
              </p>
            )}
          </div>
        </section>

        {/* Participants & Payment */}
        <section className="px-5 py-6 bg-white border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-900 mb-4">참가 설정</h2>

          {/* Max Participants */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              최대 참가자 수 *
            </label>
            <input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 0 })}
              min={2}
              max={100}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary ${
                errors.maxParticipants ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.maxParticipants && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.maxParticipants}
              </p>
            )}
          </div>

          {/* Gathering Type */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              모임 타입
            </label>
            <div className="space-y-2">
              {gatheringTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, gatheringType: type.value as GatheringType })}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    formData.gatheringType === type.value
                      ? 'border-moa-primary bg-moa-primary/5'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{type.label}</p>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </div>
                    {formData.gatheringType === type.value && (
                      <Check className="w-5 h-5 text-moa-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          {formData.gatheringType === 'PAID_CLASS' && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                참가비 *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                min={0}
                placeholder="0"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.price}
                </p>
              )}
            </div>
          )}

          {/* Deposit */}
          {formData.gatheringType === 'DEPOSIT' && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                보증금 *
              </label>
              <input
                type="number"
                value={formData.depositAmount}
                onChange={(e) => setFormData({ ...formData, depositAmount: parseInt(e.target.value) || 0 })}
                min={0}
                placeholder="0"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary ${
                  errors.depositAmount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.depositAmount && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.depositAmount}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                참석 완료 시 보증금이 반환됩니다
              </p>
            </div>
          )}
        </section>

        {/* Tags */}
        <section className="px-5 py-6 bg-white">
          <h2 className="text-sm font-bold text-gray-900 mb-4">
            <Tag className="w-4 h-4 inline mr-1" />
            태그 <span className="text-gray-400 font-normal">(최대 5개)</span>
          </h2>

          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-moa-primary/10 text-moa-primary rounded-full text-sm font-semibold"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(index)}
                    className="hover:bg-moa-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
              placeholder="태그 입력 후 추가 버튼 클릭"
              disabled={formData.tags && formData.tags.length >= 5}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary disabled:bg-gray-100"
              maxLength={10}
            />
            <button
              type="button"
              onClick={handleTagAdd}
              disabled={!tagInput.trim() || (formData.tags && formData.tags.length >= 5)}
              className="px-6 py-3 bg-moa-primary text-white font-bold rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              추가
            </button>
          </div>
        </section>
      </form>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="max-w-[480px] mx-auto px-5 py-3">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 bg-moa-primary text-white font-bold text-base rounded-xl active:scale-98 transition-transform disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? '생성 중...' : '모임 만들기'}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </MobileLayout>
  );
}
