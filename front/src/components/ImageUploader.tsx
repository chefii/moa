'use client';

import { useState, useRef, ChangeEvent, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';
import apiClient from '@/lib/api/client';
import { getImageUrl } from '@/lib/utils/imageUrl';

interface ImageUploaderProps {
  value?: string | null;
  onChange: (fileId: string | null) => void;
  uploadType?: 'profile' | 'gathering' | 'post' | 'event' | 'banner' | 'popup';
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
}

export default function ImageUploader({
  value,
  onChange,
  uploadType = 'gathering',
  maxSizeMB = 10,
  className = '',
  disabled = false,
  placeholder = '이미지를 업로드하세요',
  aspectRatio = 'video',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop states
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const aspectRatioMap = {
    square: 1,
    video: 16 / 9,
    wide: 21 / 9,
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
  };

  // Update preview when value changes (for edit mode)
  useEffect(() => {
    if (value && value !== preview) {
      setPreview(value);
    } else if (!value && preview) {
      setPreview(null);
    }
  }, [value]);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // 파일 크기 검증
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`);
      return;
    }

    setError(null);

    // 이미지를 읽어서 크롭 모달 열기
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    setUploading(true);
    setShowCropModal(false);

    try {
      // 크롭된 이미지 blob 생성
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);

      // 미리보기 생성
      const previewUrl = URL.createObjectURL(croppedBlob);
      setPreview(previewUrl);

      // 파일 업로드 (새 파일 업로드 시스템 사용)
      const formData = new FormData();
      formData.append('file', croppedBlob, 'cropped-image.jpg');

      const response = await apiClient.post<any>(`/api/files/upload/${uploadType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const { id, url } = response.data.data;
        onChange(id);
        setPreview(url);
        // blob URL 정리
        URL.revokeObjectURL(previewUrl);
      } else {
        throw new Error(response.data.message || '업로드에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || '업로드 중 오류가 발생했습니다.');
      setPreview(null);
      onChange(null);
    } finally {
      setUploading(false);
      setImageToCrop(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {!preview ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || uploading}
          className={`
            w-full ${aspectRatioClasses[aspectRatio]}
            border-2 border-dashed border-gray-300 rounded-xl
            flex flex-col items-center justify-center gap-3
            hover:border-moa-primary hover:bg-moa-primary/5
            transition-colors cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-moa-primary animate-spin" />
              <p className="text-sm font-medium text-gray-600">업로드 중...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">{placeholder}</p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF (최대 {maxSizeMB}MB)
                </p>
              </div>
            </>
          )}
        </button>
      ) : (
        <div className={`relative w-full ${aspectRatioClasses[aspectRatio]} rounded-xl overflow-hidden group`}>
          <img
            src={getImageUrl(preview)}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleClick}
                className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-red-600" />
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Crop Modal */}
      {showCropModal && imageToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-2xl mx-4 bg-white rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">이미지 크롭</h3>
              <button
                onClick={handleCropCancel}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Crop Area */}
            <div className="relative w-full h-96 bg-gray-900">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatioMap[aspectRatio]}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom Control */}
            <div className="px-6 py-4 border-b border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                확대/축소
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Actions */}
            <div className="px-6 py-4 flex gap-3">
              <button
                onClick={handleCropCancel}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCropConfirm}
                className="flex-1 py-3 bg-moa-primary text-white rounded-xl font-semibold hover:bg-moa-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
