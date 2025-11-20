'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, FileText, AlertCircle, Check } from 'lucide-react';
import { filesApi, FileUploadType, FileUploadConfig, UploadedFile } from '@/lib/api/files';

interface FileUploadProps {
  uploadType: FileUploadType;
  value?: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
  autoResize?: boolean;
  disabled?: boolean;
  label?: string;
  helpText?: string;
}

export default function FileUpload({
  uploadType,
  value,
  onChange,
  autoResize = false,
  disabled = false,
  label,
  helpText,
}: FileUploadProps) {
  const [config, setConfig] = useState<FileUploadConfig | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 업로드 설정 가져오기
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const uploadConfig = await filesApi.getUploadConfig(uploadType);
        setConfig(uploadConfig);
      } catch (err) {
        console.error('Failed to fetch upload config:', err);
      }
    };
    fetchConfig();
  }, [uploadType]);

  // 이미지 미리보기 설정
  useEffect(() => {
    if (value?.url) {
      setPreview(value.url);
    } else {
      setPreview('');
    }
  }, [value]);

  const handleFile = async (file: File) => {
    if (!config) return;

    setError('');

    // 파일 검증
    const validation = filesApi.validateFile(file, config);
    if (!validation.valid) {
      setError(validation.error || '파일 검증 실패');
      return;
    }

    try {
      setUploading(true);

      // 이미지 파일인 경우 미리보기 생성
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }

      // 파일 업로드
      const uploadedFile = await filesApi.uploadFile(file, uploadType, autoResize);
      onChange(uploadedFile);
    } catch (err: any) {
      console.error('File upload error:', err);
      setError(err.response?.data?.message || '파일 업로드에 실패했습니다.');
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = async () => {
    if (value) {
      try {
        await filesApi.deleteFile(value.id);
        onChange(null);
        setPreview('');
        setError('');
      } catch (err) {
        console.error('File delete error:', err);
      }
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  if (!config) {
    return <div className="text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all ${
          dragActive
            ? 'border-moa-primary bg-moa-primary/5'
            : error
            ? 'border-red-300 bg-red-50'
            : value
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 bg-gray-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-moa-primary'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={config.allowedMimeTypes.join(',')}
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="hidden"
        />

        <div className="p-6">
          {/* Preview or Upload Icon */}
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              {!uploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moa-primary mb-3"></div>
                  <p className="text-sm text-gray-600">업로드 중...</p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    파일을 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-xs text-gray-500">{config.description}</p>
                </>
              )}
            </div>
          )}

          {/* Success Message */}
          {value && !uploading && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
              <Check className="w-4 h-4" />
              <span>파일이 업로드되었습니다.</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Help Text */}
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}

      {/* File Info */}
      {value && (
        <div className="text-xs text-gray-500">
          <div>파일명: {value.originalName}</div>
          <div>크기: {filesApi.formatFileSize(value.size)}</div>
        </div>
      )}
    </div>
  );
}
