'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { authApi } from '@/lib/api/auth';
import { usersApi } from '@/lib/api/users';
import { commonCodesApi, Region, CommonCode } from '@/lib/api/common-codes';
import { useAuthStore } from '@/store/authStore';
import MobileLayout from '@/components/MobileLayout';
import {
  ArrowLeft,
  Camera,
  User,
  AtSign,
  Phone,
  MapPin,
  MessageSquare,
  Calendar,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  Save,
  Lock,
  X,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, login } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const ageScrollRef = useRef<HTMLDivElement>(null);

  // Form data
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCityCode, setSelectedCityCode] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');

  // Background images
  const [backgroundImages, setBackgroundImages] = useState<{ id: string; url: string; order: number }[]>([]);
  const [backgroundImageFiles, setBackgroundImageFiles] = useState<File[]>([]);
  const [backgroundImagePreviews, setBackgroundImagePreviews] = useState<string[]>([]);

  // API data
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [genderCodes, setGenderCodes] = useState<CommonCode[]>([]);

  // Nickname validation
  const [originalNickname, setOriginalNickname] = useState('');
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(true);
  const [nicknameMessage, setNicknameMessage] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAgePicker, setShowAgePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCityCode) {
      loadDistricts(selectedCityCode);
    }
  }, [selectedCityCode]);

  // Nickname validation debounce
  useEffect(() => {
    if (!nickname || nickname === originalNickname) {
      setNicknameAvailable(true);
      setNicknameMessage('');
      return;
    }

    const timer = setTimeout(() => {
      checkNickname();
    }, 500);

    return () => clearTimeout(timer);
  }, [nickname]);

  // Auto-scroll to age 30 when age picker opens
  useEffect(() => {
    if (showAgePicker && ageScrollRef.current) {
      setTimeout(() => {
        const element = ageScrollRef.current?.querySelector('[data-age="30"]');
        if (element) {
          element.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }, 100);
    }
  }, [showAgePicker]);

  const loadData = async () => {
    try {
      setDataLoading(true);

      // Load current user data
      const userData = await authApi.me();
      setCurrentUser(userData);
      setName(userData.name || '');
      setNickname(userData.nickname || '');
      setOriginalNickname(userData.nickname || '');
      setPhone(userData.phone || '');
      setBio(userData.bio || '');
      setGender(userData.gender || '');
      setAge(userData.age?.toString() || '');
      setProfileImage(userData.profileImage?.url || '');

      // Parse location
      if (userData.location) {
        const [city, district] = userData.location.split(' ');
        setSelectedCity(city || '');
        setSelectedDistrict(district || '');
      }

      // Load regions
      const regionsData = await commonCodesApi.getRegions();
      setRegions(regionsData);

      // Load gender codes
      const genderData = await commonCodesApi.getByGroup('GENDER');
      setGenderCodes(genderData);

      // Load background images
      const bgImages = await usersApi.getBackgroundImages();
      setBackgroundImages(bgImages);

    } catch (error) {
      console.error('Failed to load data:', error);
      setError('데이터를 불러오는데 실패했습니다.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDataLoading(false);
    }
  };

  const loadDistricts = async (regionCode: string) => {
    try {
      const districtsData = await commonCodesApi.getDistricts(regionCode);
      setDistricts(districtsData);
    } catch (error) {
      console.error('Failed to load districts:', error);
    }
  };

  const checkNickname = async () => {
    try {
      setNicknameChecking(true);
      const response = await authApi.checkNickname(nickname);
      setNicknameAvailable(response.available);
      setNicknameMessage(response.available ? '사용 가능한 닉네임입니다' : '이미 사용중인 닉네임입니다');
    } catch (error) {
      console.error('Nickname check error:', error);
      setNicknameAvailable(false);
      setNicknameMessage('닉네임 확인 중 오류가 발생했습니다');
    } finally {
      setNicknameChecking(false);
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Validate image format (JPG, PNG only)
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validFormats.includes(file.type)) {
      setError('JPG 또는 PNG 이미지만 업로드 가능합니다.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      // 이미지 압축 옵션
      const options = {
        maxSizeMB: 0.24, // 250KB 이하로 압축
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: file.type,
      };

      console.log('원본 파일 크기:', (file.size / 1024).toFixed(2), 'KB');
      const compressedBlob = await imageCompression(file, options);
      console.log('압축된 파일 크기:', (compressedBlob.size / 1024).toFixed(2), 'KB');

      // 압축된 Blob을 원본 파일명으로 File 객체 생성
      const compressedFile = new File([compressedBlob], file.name, {
        type: file.type,
        lastModified: Date.now(),
      });

      setProfileImageFile(compressedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('이미지 압축 실패:', error);
      setError('이미지 처리 중 오류가 발생했습니다.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBackgroundImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError('');

    // 최대 10개 체크
    const totalCount = backgroundImages.length + backgroundImageFiles.length + files.length;
    if (totalCount > 10) {
      setError(`최대 10개까지 업로드 가능합니다. 현재 ${backgroundImages.length + backgroundImageFiles.length}개가 선택되어 있습니다.`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const compressedFiles: File[] = [];
      const previews: string[] = [];

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          continue;
        }

        // Validate image format
        const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validFormats.includes(file.type)) {
          continue;
        }

        // 이미지 압축
        const options = {
          maxSizeMB: 0.48, // 500KB 이하로 압축
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          fileType: file.type,
        };

        const compressedBlob = await imageCompression(file, options);

        // 압축된 Blob을 원본 파일명으로 File 객체 생성
        const compressedFile = new File([compressedBlob], file.name, {
          type: file.type,
          lastModified: Date.now(),
        });

        compressedFiles.push(compressedFile);

        // 미리보기 생성
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          if (previews.length === compressedFiles.length) {
            setBackgroundImageFiles(prev => [...prev, ...compressedFiles]);
            setBackgroundImagePreviews(prev => [...prev, ...previews]);
          }
        };
        reader.readAsDataURL(compressedFile);
      }
    } catch (error) {
      console.error('배경 이미지 처리 실패:', error);
      setError('이미지 처리 중 오류가 발생했습니다.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const removeBackgroundImage = async (id: string) => {
    try {
      await usersApi.deleteBackgroundImage(id);
      setBackgroundImages(prev => prev.filter(img => img.id !== id));
      setSuccess('배경 이미지가 삭제되었습니다.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to delete background image:', error);
      setError('배경 이미지 삭제에 실패했습니다.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const removeBackgroundPreview = (index: number) => {
    setBackgroundImageFiles(prev => prev.filter((_, i) => i !== index));
    setBackgroundImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (nickname.trim().length < 2) {
      setError('닉네임은 최소 2자 이상이어야 합니다');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (nickname !== originalNickname && !nicknameAvailable) {
      setError('다른 닉네임을 사용해주세요');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);

    try {
      // Upload profile image if changed
      if (profileImageFile) {
        try {
          const uploadResult = await usersApi.uploadProfileImage(profileImageFile);
          setProfileImage(uploadResult.url);
        } catch (error) {
          console.error('Failed to upload profile image:', error);
          setError('프로필 이미지 업로드에 실패했습니다.');
          setTimeout(() => setError(''), 3000);
          setLoading(false);
          return;
        }
      }

      // Upload background images if any
      if (backgroundImageFiles.length > 0) {
        try {
          const uploadedImages = await usersApi.uploadBackgroundImages(backgroundImageFiles);
          setBackgroundImages(prev => [...prev, ...uploadedImages]);
          setBackgroundImageFiles([]);
          setBackgroundImagePreviews([]);
        } catch (error) {
          console.error('Failed to upload background images:', error);
          setError('배경 이미지 업로드에 실패했습니다.');
          setTimeout(() => setError(''), 3000);
        }
      }

      // Update profile
      const updatedUser = await usersApi.updateProfile({
        nickname,
        location: selectedCity && selectedDistrict ? `${selectedCity} ${selectedDistrict}` : undefined,
        bio: bio || undefined,
        gender: gender || undefined,
        age: age ? parseInt(age) : undefined,
      });

      // Update auth store
      if (user) {
        login({
          ...user,
          nickname: updatedUser.nickname,
          location: updatedUser.location,
          bio: updatedUser.bio,
          gender: updatedUser.gender,
          age: updatedUser.age,
          avatar: updatedUser.avatar,
        });
      }

      setSuccess('프로필이 성공적으로 업데이트되었습니다!');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || '프로필 업데이트에 실패했습니다.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <MobileLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moa-primary mx-auto mb-3"></div>
            <p className="text-gray-600 font-semibold">프로필 불러오는 중...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="px-5 py-4 flex items-center justify-between">
            <button onClick={() => router.back()} className="text-gray-700">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">프로필 수정</h1>
            <div className="w-6" />
          </div>
        </div>

        {/* Profile Image Section */}
        <div className="bg-white px-5 py-6 mb-2">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {profileImagePreview || profileImage ? (
                  <img
                    src={profileImagePreview || profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-moa-primary text-white p-2 rounded-full shadow-lg hover:bg-moa-primary/90"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleProfileImageChange}
                className="hidden"
              />
            </div>
            <p className="mt-3 text-sm text-gray-500">프로필 사진 변경</p>

            {/* Account Type Badge */}
            <div className="mt-4 flex items-center gap-2 flex-wrap justify-center">
              {currentUser?.userSso?.some((sso: any) => sso.provider === 'KAKAO') ? (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#FEE500] rounded-full">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 208 191" fill="none">
                    <path d="M104 0C46.5604 0 0 35.4609 0 79.1978C0 104.869 17.8395 127.403 44.4186 140.182L35.456 172.745C34.9023 174.694 37.2558 176.319 38.9767 175.076L77.9256 149.097C86.3674 150.643 95.0651 151.461 104 151.395C161.44 151.395 208 115.934 208 72.1978C208 28.4609 161.44 0 104 0Z" fill="#3C1E1E"/>
                  </svg>
                </div>
              ) : (
                <span className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                  일반가입
                </span>
              )}
              <span className="text-gray-900 font-semibold">{currentUser?.name}</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">{currentUser?.phone}</span>
            </div>
          </div>
        </div>

        {/* Background Images Section */}
        <div className="bg-white px-5 py-6 mb-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">배경 사진</h2>
            <span className="text-sm text-gray-500">
              {backgroundImages.length + backgroundImageFiles.length}/10
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Existing background images */}
            {backgroundImages.map((img) => (
              <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img src={img.url} alt="Background" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeBackgroundImage(img.id)}
                  className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Preview new background images */}
            {backgroundImagePreviews.map((preview, index) => (
              <div key={`preview-${index}`} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeBackgroundPreview(index)}
                  className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add button */}
            {backgroundImages.length + backgroundImageFiles.length < 10 && (
              <button
                onClick={() => backgroundInputRef.current?.click()}
                className="aspect-video rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="w-6 h-6 mb-1" />
                <span className="text-xs">추가</span>
              </button>
            )}
            <input
              ref={backgroundInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleBackgroundImagesChange}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">최대 10개까지 업로드 가능 (JPG, PNG, WEBP)</p>
        </div>

        {/* Form Fields */}
        <div className="bg-white px-5 py-6 mb-2 space-y-5">
          {/* Nickname */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <AtSign className="w-4 h-4" />
                닉네임
              </div>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary focus:border-transparent"
              placeholder="닉네임을 입력하세요"
            />
            {nickname && nickname !== originalNickname && (
              <div className="mt-2">
                {nicknameChecking ? (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    확인 중...
                  </p>
                ) : (
                  <p className={`text-sm ${nicknameAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {nicknameMessage}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                성별
              </div>
            </label>
            <button
              onClick={() => setShowGenderPicker(true)}
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-left bg-white hover:bg-gray-50 transition-colors"
            >
              <span className={gender ? 'text-gray-900' : 'text-gray-400'}>
                {gender ? genderCodes.find(g => g.code === gender)?.name : '성별을 선택하세요'}
              </span>
            </button>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                나이
              </div>
            </label>
            <button
              onClick={() => setShowAgePicker(true)}
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-left bg-white hover:bg-gray-50 transition-colors"
            >
              <span className={age ? 'text-gray-900' : 'text-gray-400'}>
                {age ? `${age}세` : '나이를 선택하세요'}
              </span>
            </button>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                지역
              </div>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCityPicker(true)}
                className="px-4 py-3.5 border border-gray-300 rounded-xl text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className={selectedCity ? 'text-gray-900' : 'text-gray-400'}>
                  {selectedCity || '시/도'}
                </span>
              </button>
              <button
                onClick={() => {
                  if (!selectedCityCode) {
                    setShowCityPicker(true);
                  } else {
                    setShowDistrictPicker(true);
                  }
                }}
                className="px-4 py-3.5 border border-gray-300 rounded-xl text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className={selectedDistrict ? 'text-gray-900' : 'text-gray-400'}>
                  {selectedDistrict || '구/군'}
                </span>
              </button>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                소개
              </div>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-primary focus:border-transparent resize-none"
              rows={4}
              placeholder="자기소개를 입력하세요"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="px-5">
          <button
            onClick={handleSubmit}
            disabled={loading || !nicknameAvailable}
            className="w-full py-4 bg-moa-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                저장하기
              </>
            )}
          </button>
        </div>
      </div>

      {/* Gender Picker Modal */}
      {showGenderPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 animate-fadeIn" onClick={() => setShowGenderPicker(false)}>
          <div
            className="bg-white rounded-3xl w-full max-w-sm max-h-[60vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">성별 선택</h3>
            </div>
            <div className="overflow-y-auto flex-1">
              {genderCodes.map((genderCode) => (
                <button
                  key={genderCode.code}
                  onClick={() => {
                    setGender(genderCode.code);
                    setShowGenderPicker(false);
                  }}
                  className={`w-full py-4 text-center transition-colors ${
                    gender === genderCode.code
                      ? 'bg-moa-primary/10 text-moa-primary font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {genderCode.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Age Picker Modal */}
      {showAgePicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 animate-fadeIn" onClick={() => setShowAgePicker(false)}>
          <div
            className="bg-white rounded-3xl w-full max-w-sm max-h-[60vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">나이 선택</h3>
            </div>
            <div ref={ageScrollRef} className="overflow-y-auto flex-1">
              {Array.from({ length: 83 }, (_, i) => i + 14).map((ageNum) => (
                <button
                  key={ageNum}
                  data-age={ageNum}
                  onClick={() => {
                    setAge(ageNum.toString());
                    setShowAgePicker(false);
                  }}
                  className={`w-full py-4 text-center transition-colors ${
                    age === ageNum.toString()
                      ? 'bg-moa-primary/10 text-moa-primary font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {ageNum}세
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* City Picker Modal */}
      {showCityPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 animate-fadeIn" onClick={() => setShowCityPicker(false)}>
          <div
            className="bg-white rounded-3xl w-full max-w-sm max-h-[60vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button
                onClick={() => setShowCityPicker(false)}
                className="text-gray-500 font-semibold"
              >
                취소
              </button>
              <h3 className="font-bold text-gray-900">시/도 선택</h3>
              <button
                onClick={() => setShowCityPicker(false)}
                className="text-moa-primary font-semibold"
              >
                완료
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {regions.map((region) => (
                <button
                  key={region.code}
                  onClick={() => {
                    setSelectedCityCode(region.code);
                    setSelectedCity(region.name);
                    setSelectedDistrict('');
                    setShowCityPicker(false);
                  }}
                  className={`w-full py-4 text-center transition-colors ${
                    selectedCityCode === region.code
                      ? 'bg-moa-primary/10 text-moa-primary font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* District Picker Modal */}
      {showDistrictPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 animate-fadeIn" onClick={() => setShowDistrictPicker(false)}>
          <div
            className="bg-white rounded-3xl w-full max-w-sm max-h-[60vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button
                onClick={() => setShowDistrictPicker(false)}
                className="text-gray-500 font-semibold"
              >
                취소
              </button>
              <h3 className="font-bold text-gray-900">구/군 선택</h3>
              <button
                onClick={() => setShowDistrictPicker(false)}
                className="text-moa-primary font-semibold"
              >
                완료
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {districts.map((district) => (
                <button
                  key={district.code}
                  onClick={() => {
                    setSelectedDistrict(district.name);
                    setShowDistrictPicker(false);
                  }}
                  className={`w-full py-4 text-center transition-colors ${
                    selectedDistrict === district.name
                      ? 'bg-moa-primary/10 text-moa-primary font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {district.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
          <div className="bg-red-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {success && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">{success}</span>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
