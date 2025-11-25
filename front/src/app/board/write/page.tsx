'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, ChevronDown } from 'lucide-react';
import MobileLayout from '@/components/MobileLayout';
import MobileHeader from '@/components/MobileHeader';
import { categoriesApi, Category } from '@/lib/api/categories';
import { boardApi } from '@/lib/api/board';
import { filesApi } from '@/lib/api/files';
import { useAuthStore } from '@/store/authStore';
import Toast, { ToastType } from '@/components/Toast';

export default function BoardWritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  const editId = searchParams.get('id');
  const fromCategory = searchParams.get('from') || 'all';
  const fromSort = searchParams.get('sort') || 'recent';
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    imageId: '',
    isAnonymous: false,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    // Load categories
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getCategories({ type: 'BOARD' });
        setCategories(data);

        // 수정 모드가 아닐 때만 카테고리 자동 선택
        if (data.length > 0 && !formData.categoryId && !editId) {
          // URL의 from 파라미터로 전달된 카테고리 ID가 있으면 해당 카테고리 선택
          if (fromCategory && fromCategory !== 'all') {
            const categoryExists = data.find((c) => c.id === fromCategory);
            if (categoryExists) {
              setFormData((prev) => ({ ...prev, categoryId: fromCategory }));
            } else {
              // 카테고리가 없으면 첫 번째 카테고리 선택
              setFormData((prev) => ({ ...prev, categoryId: data[0].id }));
            }
          } else {
            // from 파라미터가 없거나 'all'이면 첫 번째 카테고리 선택
            setFormData((prev) => ({ ...prev, categoryId: data[0].id }));
          }
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    loadCategories();

    // Load existing post if editing
    if (editId) {
      const loadPost = async () => {
        try {
          const post = await boardApi.getPostById(editId);
          setFormData({
            title: post.title,
            content: post.content,
            categoryId: post.categoryId,
            imageId: post.imageId || '',
            isAnonymous: post.isAnonymous,
          });
          if (post.image) {
            setImagePreview(post.image.url);
          }
        } catch (error) {
          console.error('Failed to load post:', error);
          alert('게시글을 불러올 수 없습니다');
          router.push('/board');
        }
      };

      loadPost();
    }
  }, [editId, isAuthenticated, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, imageId: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setToast({ message: '제목을 입력해주세요', type: 'error' });
      return;
    }

    if (!formData.content.trim()) {
      setToast({ message: '내용을 입력해주세요', type: 'error' });
      return;
    }

    if (!formData.categoryId) {
      setToast({ message: '카테고리를 선택해주세요', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      let imageId = formData.imageId;

      // Upload image if selected
      if (imageFile) {
        const uploadedImage = await filesApi.uploadFile(imageFile);
        imageId = uploadedImage.id;
      }

      const postData = {
        title: formData.title,
        content: formData.content,
        categoryId: formData.categoryId,
        imageId: imageId || undefined,
        isAnonymous: formData.isAnonymous,
      };

      if (editId) {
        // Update existing post
        await boardApi.updatePost(editId, postData);
        setToast({ message: '게시글이 수정되었습니다', type: 'success' });

        // Toast 표시 후 이동
        setTimeout(() => {
          const params = new URLSearchParams();
          if (fromCategory !== 'all') params.set('from', fromCategory);
          if (fromSort !== 'recent') params.set('sort', fromSort);
          const url = params.toString() ? `/board/${editId}?${params.toString()}` : `/board/${editId}`;
          router.push(url);
        }, 1000);
      } else {
        // Create new post
        const post = await boardApi.createPost(postData);
        setToast({ message: '게시글이 작성되었습니다', type: 'success' });

        // Toast 표시 후 이동
        setTimeout(() => {
          const params = new URLSearchParams();
          if (fromCategory !== 'all') params.set('from', fromCategory);
          if (fromSort !== 'recent') params.set('sort', fromSort);
          const url = params.toString() ? `/board/${post.id}?${params.toString()}` : `/board/${post.id}`;
          router.push(url);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to submit post:', error);
      setToast({ message: '게시글 작성 중 오류가 발생했습니다', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <MobileLayout>
      <MobileHeader />
      <div className="px-4 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 mt-4">
          <Link
            href={(() => {
              if (editId) {
                // 수정 중이면 해당 게시글 상세로
                const params = new URLSearchParams();
                if (fromCategory !== 'all') params.set('from', fromCategory);
                if (fromSort !== 'recent') params.set('sort', fromSort);
                return params.toString() ? `/board/${editId}?${params.toString()}` : `/board/${editId}`;
              } else {
                // 새 글 작성이면 목록으로
                const params = new URLSearchParams();
                if (fromCategory !== 'all') params.set('category', fromCategory);
                if (fromSort !== 'recent') params.set('sort', fromSort);
                return params.toString() ? `/board?${params.toString()}` : '/board';
              }
            })()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            취소
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            {editId ? '게시글 수정' : '게시글 작성'}
          </h1>
          <div className="w-16" /> {/* Spacer for center alignment */}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6">
          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className={formData.categoryId ? 'text-gray-900' : 'text-gray-500'}>
                  {formData.categoryId
                    ? categories.find((c) => c.id === formData.categoryId)?.displayName ||
                      categories.find((c) => c.id === formData.categoryId)?.name
                    : '카테고리 선택'}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isCategoryDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isCategoryDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsCategoryDropdownOpen(false)}
                  />
                  <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, categoryId: category.id }));
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                          formData.categoryId === category.id
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        <p className="font-medium">{category.displayName || category.name}</p>
                        {category.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="제목을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="내용을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={15}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지
            </label>

            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full max-h-64 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  클릭하여 이미지 업로드
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Anonymous */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isAnonymous: e.target.checked }))
                }
                className="rounded"
              />
              익명으로 작성
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Link
              href={(() => {
                if (editId) {
                  // 수정 중이면 해당 게시글 상세로
                  const params = new URLSearchParams();
                  if (fromCategory !== 'all') params.set('from', fromCategory);
                  if (fromSort !== 'recent') params.set('sort', fromSort);
                  return params.toString() ? `/board/${editId}?${params.toString()}` : `/board/${editId}`;
                } else {
                  // 새 글 작성이면 목록으로
                  const params = new URLSearchParams();
                  if (fromCategory !== 'all') params.set('category', fromCategory);
                  if (fromSort !== 'recent') params.set('sort', fromSort);
                  return params.toString() ? `/board?${params.toString()}` : '/board';
                }
              })()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-center"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '처리 중...' : editId ? '수정하기' : '작성하기'}
            </button>
          </div>
        </form>
      </div>

      {/* Toast */}
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
