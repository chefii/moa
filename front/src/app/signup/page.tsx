'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { categoriesApi, Category } from '@/lib/api/categories';
import { commonCodesApi, Region, CommonCode } from '@/lib/api/common-codes';
import { termsApi, Terms } from '@/lib/api/terms';
import { useAuthStore, UserRole } from '@/store/authStore';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Mail,
  Lock,
  User,
  AtSign,
  MapPin,
  Heart,
  Sparkles,
  Users,
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [step, setStep] = useState(1);
  const totalSteps = 9;

  // 브라우저 뒤로가기 방지 및 단계 이동 처리
  useEffect(() => {
    // 현재 URL에 step 정보 추가
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('step', step.toString());
    window.history.replaceState({ step }, '', currentUrl);

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.step) {
        // 저장된 step으로 이동
        setStep(event.state.step);
      } else if (step > 1) {
        // step 1이 아니면 이전 단계로
        event.preventDefault();
        setStep((prev) => Math.max(1, prev - 1));
      } else {
        // step 1이면 로그인 페이지로
        router.push('/login');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [step, router]);

  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCityCode, setSelectedCityCode] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // API data
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [genders, setGenders] = useState<CommonCode[]>([]);
  const [terms, setTerms] = useState<Terms[]>([]);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  // Terms agreement
  const [agreedTerms, setAgreedTerms] = useState<Record<string, boolean>>({});
  const [allAgreed, setAllAgreed] = useState(false);
  const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>({});
  const [marketingAgreed, setMarketingAgreed] = useState(false);

  // Nickname validation
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [nicknameMessage, setNicknameMessage] = useState('');

  // Load categories, regions, genders, and terms on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true);
        const [categoriesData, regionsData, genderData, termsData] = await Promise.all([
          categoriesApi.getCategories(),
          commonCodesApi.getRegions(),
          commonCodesApi.getCommonCodes('GENDER'),
          termsApi.getAllTerms(),
        ]);
        setCategories(categoriesData);
        setRegions(regionsData);
        setGenders(genderData);
        setTerms(termsData);

        // 저장된 step 복원 (약관 상세 페이지에서 돌아온 경우)
        const savedStep = sessionStorage.getItem('signup_current_step');
        if (savedStep) {
          const stepNum = parseInt(savedStep);
          setStep(stepNum);
          // step 복원 후 sessionStorage에서 제거
          sessionStorage.removeItem('signup_current_step');
          // 히스토리 업데이트
          window.history.replaceState({ step: stepNum }, '', `?step=${stepNum}`);
        }

        // 저장된 폼 데이터 복원
        const savedFormData = sessionStorage.getItem('signup_form_data');
        if (savedFormData) {
          const formData = JSON.parse(savedFormData);
          setEmail(formData.email || '');
          setPassword(formData.password || '');
          setName(formData.name || '');
          setNickname(formData.nickname || '');
          setGender(formData.gender || '');
          setAge(formData.age || '');
          setSelectedInterests(formData.selectedInterests || []);
          setSelectedCity(formData.selectedCity || '');
          setSelectedCityCode(formData.selectedCityCode || '');
          setSelectedDistrict(formData.selectedDistrict || '');
        }

        // 저장된 약관 동의 상태 복원
        const savedAgreedTerms = sessionStorage.getItem('signup_agreed_terms');
        const savedMarketingAgreed = sessionStorage.getItem('signup_marketing_agreed');

        if (savedAgreedTerms) {
          const parsedAgreedTerms = JSON.parse(savedAgreedTerms);
          setAgreedTerms(parsedAgreedTerms);

          // 모든 약관에 동의했는지 확인
          const allChecked = termsData.every((t) => parsedAgreedTerms[t.id]);
          setAllAgreed(allChecked);
        }

        if (savedMarketingAgreed) {
          setMarketingAgreed(JSON.parse(savedMarketingAgreed));
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  // Check nickname availability
  useEffect(() => {
    const checkNickname = async () => {
      if (nickname.length < 2) {
        setNicknameAvailable(null);
        setNicknameMessage('');
        return;
      }

      setNicknameChecking(true);
      try {
        const response = await authApi.checkNickname(nickname);
        setNicknameAvailable(response.available);
        setNicknameMessage(response.message);
      } catch (error) {
        console.error('Failed to check nickname:', error);
        setNicknameAvailable(null);
        setNicknameMessage('');
      } finally {
        setNicknameChecking(false);
      }
    };

    const timeout = setTimeout(checkNickname, 500);
    return () => clearTimeout(timeout);
  }, [nickname]);

  // Load districts when city is selected
  useEffect(() => {
    const loadDistricts = async () => {
      if (!selectedCityCode) {
        setDistricts([]);
        return;
      }

      try {
        const districtsData = await commonCodesApi.getDistricts(selectedCityCode);
        setDistricts(districtsData);
      } catch (error) {
        console.error('Failed to load districts:', error);
      }
    };

    loadDistricts();
  }, [selectedCityCode]);

  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    setError('');

    // Validation
    if (step === 1 && !email.includes('@')) {
      setError('올바른 이메일을 입력해주세요');
      return;
    }
    if (step === 2 && password.length < 2) {
      setError('비밀번호는 최소 3자 이상이어야 합니다');
      return;
    }
    if (step === 3 && name.trim().length < 2) {
      setError('이름을 입력해주세요');
      return;
    }
    if (step === 4 && (nickname.trim().length < 2 || !nicknameAvailable)) {
      setError(nicknameAvailable === false ? '다른 닉네임을 사용해주세요' : '닉네임은 최소 2자 이상이어야 합니다');
      return;
    }
    if (step === 5 && !gender) {
      setError('성별을 선택해주세요');
      return;
    }
    if (step === 6 && !age) {
      setError('나이를 입력해주세요');
      return;
    }
    if (step === 7 && selectedInterests.length < 1) {
      setError('최소 1개 이상의 관심사를 선택해주세요');
      return;
    }
    if (step === 8 && (!selectedCity || !selectedDistrict)) {
      setError('지역을 선택해주세요');
      return;
    }
    if (step === 9) {
      const requiredTerms = terms.filter((t) => t.isRequired);
      const allRequiredAgreed = requiredTerms.every((t) => agreedTerms[t.id]);
      if (!allRequiredAgreed) {
        setError('필수 약관에 모두 동의해주세요');
        return;
      }
    }

    if (step < totalSteps) {
      const nextStep = step + 1;
      setStep(nextStep);
      // 히스토리에 다음 단계 추가
      window.history.pushState({ step: nextStep }, '', `?step=${nextStep}`);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      // 브라우저 뒤로가기 사용
      window.history.back();
      setError('');
    } else {
      // step 1이면 로그인 페이지로
      router.push('/login');
    }
  };

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleAllAgree = (checked: boolean) => {
    setAllAgreed(checked);
    const newAgreedTerms: Record<string, boolean> = {};
    const newExpandedTerms: Record<string, boolean> = {};

    terms.forEach((term) => {
      newAgreedTerms[term.id] = checked;
      // 전체 동의 클릭 시 모든 약관 펼치기
      if (checked) {
        newExpandedTerms[term.id] = true;
      }
    });

    setAgreedTerms(newAgreedTerms);
    if (checked) {
      setExpandedTerms(newExpandedTerms);
    }

    // 마케팅 약관 동의 여부 업데이트
    const marketingTerm = terms.find((t) => t.type === 'MARKETING');
    if (marketingTerm) {
      setMarketingAgreed(checked);
    }
  };

  const handleTermAgree = (termId: string, checked: boolean) => {
    const newAgreedTerms = { ...agreedTerms, [termId]: checked };
    setAgreedTerms(newAgreedTerms);

    // 마케팅 약관 동의 여부 업데이트
    const term = terms.find((t) => t.id === termId);
    if (term?.type === 'MARKETING') {
      setMarketingAgreed(checked);
    }

    // 모든 약관에 동의했는지 확인
    const allChecked = terms.every((t) => newAgreedTerms[t.id]);
    setAllAgreed(allChecked);
  };

  const toggleTermExpand = (termId: string) => {
    setExpandedTerms((prev) => ({ ...prev, [termId]: !prev[termId] }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // 동의한 약관 ID 목록 생성
      const agreedTermsIds = Object.entries(agreedTerms)
        .filter(([_, agreed]) => agreed)
        .map(([termId, _]) => termId);

      const response = await authApi.register({
        email,
        password,
        name,
        role: UserRole.USER,
        nickname,
        gender,
        age: age ? parseInt(age) : undefined,
        location: `${selectedCity} ${selectedDistrict}`,
        interests: selectedInterests,
        marketingAgreed,
        agreedTermsIds, // 동의한 약관 ID 배열 추가
      });

      login({
        ...response.user,
        token: response.token,
        refreshToken: response.refreshToken,
      });

      // 회원가입 완료 시 저장된 모든 임시 데이터 삭제
      sessionStorage.removeItem('signup_agreed_terms');
      sessionStorage.removeItem('signup_marketing_agreed');
      sessionStorage.removeItem('signup_current_step');
      sessionStorage.removeItem('signup_form_data');

      router.push('/profile');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50 flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-moa-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Back Button */}
      {step > 1 && (
        <button
          onClick={handleBack}
          className="fixed top-4 left-4 z-40 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Step 1: Email */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-moa-primary to-moa-accent rounded-3xl mb-4 shadow-lg">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">이메일을 입력해주세요</h1>
                <p className="text-gray-600">모아에서 사용할 이메일 주소예요</p>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                placeholder="hello@example.com"
                className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-moa-primary/30 focus:border-moa-primary focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400"
                autoFocus
              />
            </div>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-moa-primary to-moa-accent rounded-3xl mb-4 shadow-lg">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">비밀번호를 만들어주세요</h1>
                <p className="text-gray-600">안전하게 보관할게요</p>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                placeholder="최소 6자 이상"
                className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-moa-primary/30 focus:border-moa-primary focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400"
                autoFocus
              />
            </div>
          )}

          {/* Step 3: Name */}
          {step === 3 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-moa-primary to-moa-accent rounded-3xl mb-4 shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">이름을 알려주세요</h1>
                <p className="text-gray-600">실명으로 입력해주세요</p>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                placeholder="홍길동"
                className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-moa-primary/30 focus:border-moa-primary focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400"
                autoFocus
              />
            </div>
          )}

          {/* Step 4: Nickname */}
          {step === 4 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-moa-primary to-moa-accent rounded-3xl mb-4 shadow-lg">
                  <AtSign className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">닉네임을 만들어주세요</h1>
                <p className="text-gray-600">모아에서 사용할 별명이에요</p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && nicknameAvailable && handleNext()}
                  placeholder="귀여운펭귄"
                  className={`w-full px-6 py-4 text-lg rounded-2xl border-2 focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400 ${
                    nicknameAvailable === null
                      ? 'border-moa-primary/30 focus:border-moa-primary'
                      : nicknameAvailable
                      ? 'border-green-500 focus:border-green-500'
                      : 'border-red-500 focus:border-red-500'
                  }`}
                  autoFocus
                />
                {nickname.length >= 2 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {nicknameChecking ? (
                      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                    ) : nicknameAvailable ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {nicknameMessage && (
                <div
                  className={`mt-3 text-sm text-center ${
                    nicknameAvailable ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {nicknameMessage}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Gender */}
          {step === 5 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-moa-primary to-moa-accent rounded-3xl mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">성별을 선택해주세요</h1>
                <p className="text-gray-600">선택 안함도 가능해요</p>
              </div>
              {dataLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moa-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {genders.map((genderOption) => {
                    const isSelected = gender === genderOption.code;
                    return (
                      <button
                        key={genderOption.code}
                        onClick={() => setGender(genderOption.code)}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? 'border-moa-primary bg-gradient-to-br from-moa-primary/10 to-moa-accent/10 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-moa-primary/40'
                        }`}
                      >
                        <div className="font-bold text-lg text-gray-900">{genderOption.name}</div>
                        {isSelected && (
                          <div className="mt-2">
                            <Check className="w-5 h-5 text-moa-primary mx-auto" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 6: Age */}
          {step === 6 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-moa-primary to-moa-accent rounded-3xl mb-4 shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">나이를 알려주세요</h1>
                <p className="text-gray-600">연령대별 모임을 추천해드릴게요</p>
              </div>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                placeholder="25"
                min="14"
                max="120"
                className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-moa-primary/30 focus:border-moa-primary focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400"
                autoFocus
              />
            </div>
          )}

          {/* Step 7: Interests */}
          {step === 7 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-moa-primary to-moa-accent rounded-3xl mb-4 shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">관심사를 선택해주세요</h1>
                <p className="text-gray-600">원하는 만큼 골라주세요 ✨</p>
              </div>
              {dataLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moa-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
                  {categories.map((category) => {
                    const isSelected = selectedInterests.includes(category.id);
                    return (
                      <button
                        key={category.id}
                        onClick={() => toggleInterest(category.id)}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? 'border-moa-primary bg-gradient-to-br from-moa-primary/10 to-moa-accent/10 shadow-lg scale-95'
                            : 'border-gray-200 bg-white hover:border-moa-primary/40'
                        }`}
                      >
                        <div className="text-4xl mb-2">{category.icon}</div>
                        <div className="font-semibold text-sm text-gray-900">{category.name}</div>
                        {isSelected && (
                          <div className="mt-2">
                            <Check className="w-5 h-5 text-moa-primary mx-auto" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedInterests.length > 0 && (
                <div className="mt-4 text-center text-sm text-moa-primary font-semibold">
                  {selectedInterests.length}개 선택됨
                </div>
              )}
            </div>
          )}

          {/* Step 9: Terms Agreement */}
          {step === 9 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-moa-primary to-moa-accent rounded-full mb-4 shadow-xl shadow-moa-primary/20">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-3 bg-gradient-to-r from-moa-primary to-moa-accent bg-clip-text text-transparent">
                  거의 다 왔어요!
                </h1>
                <p className="text-lg text-gray-600">약관에 동의하고 모아를 시작해보세요</p>
              </div>

              {dataLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moa-primary"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* All Agree - Compact & Clean */}
                  <div className="bg-white rounded-2xl p-5 border-2 border-gray-200">
                    <label
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAllAgree(!allAgreed);
                      }}
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        allAgreed
                          ? 'bg-moa-primary border-moa-primary'
                          : 'border-gray-300 group-hover:border-moa-primary'
                      }`}>
                        {allAgreed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-base font-bold text-gray-900 group-hover:text-moa-primary transition-colors">
                        모두 동의합니다
                      </span>
                    </label>
                  </div>

                  {/* Divider */}
                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                  </div>

                  {/* Individual Terms - Modern Compact Style */}
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {terms.map((term) => {
                      const isAgreed = agreedTerms[term.id] || false;

                      return (
                        <div
                          key={term.id}
                          className={`group rounded-2xl overflow-hidden transition-all duration-300 ${
                            isAgreed
                              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-moa-primary/20'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() => handleTermAgree(term.id, !isAgreed)}
                                className="flex-shrink-0 cursor-pointer"
                              >
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  isAgreed
                                    ? 'bg-moa-primary border-moa-primary'
                                    : 'border-gray-300 hover:border-moa-primary'
                                }`}>
                                  {isAgreed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                </div>
                              </div>

                              <div
                                onClick={() => handleTermAgree(term.id, !isAgreed)}
                                className="flex-1 cursor-pointer"
                              >
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                                    term.isRequired
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {term.isRequired ? '필수' : '선택'}
                                  </span>
                                  <span className="font-semibold text-gray-900 text-sm">
                                    {term.title}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  // 약관 상세 페이지로 이동하면서 현재 상태 저장
                                  sessionStorage.setItem('signup_agreed_terms', JSON.stringify(agreedTerms));
                                  sessionStorage.setItem('signup_marketing_agreed', JSON.stringify(marketingAgreed));
                                  sessionStorage.setItem('signup_current_step', '9'); // 현재 step 저장

                                  // 폼 데이터 저장
                                  const formData = {
                                    email,
                                    password,
                                    name,
                                    nickname,
                                    gender,
                                    age,
                                    selectedInterests,
                                    selectedCity,
                                    selectedCityCode,
                                    selectedDistrict,
                                  };
                                  sessionStorage.setItem('signup_form_data', JSON.stringify(formData));

                                  router.push(`/signup/terms?id=${term.id}`);
                                }}
                                className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-moa-primary hover:bg-moa-primary/10 rounded-lg transition-all"
                              >
                                내용보기
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 8: Location */}
          {step === 8 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-moa-primary to-moa-accent rounded-3xl mb-4 shadow-lg">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">어디에 계신가요?</h1>
                <p className="text-gray-600">가까운 모임을 추천해드릴게요</p>
              </div>

              {dataLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moa-primary"></div>
                </div>
              ) : (
                <>
                  {/* City Selection */}
                  {!selectedCity ? (
                    <div className="grid grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
                      {regions.map((region) => (
                        <button
                          key={region.code}
                          onClick={() => {
                            setSelectedCity(region.name);
                            setSelectedCityCode(region.code);
                          }}
                          className="p-4 rounded-2xl border-2 border-gray-200 bg-white hover:border-moa-primary hover:bg-moa-primary/10 transition-all"
                        >
                          <div className="font-bold text-gray-900">{region.name}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="text-lg font-bold text-gray-900">{selectedCity}</div>
                        <button
                          onClick={() => {
                            setSelectedCity('');
                            setSelectedCityCode('');
                            setSelectedDistrict('');
                          }}
                          className="text-sm text-moa-primary font-semibold"
                        >
                          변경
                        </button>
                      </div>
                      {districts.length === 0 ? (
                        <div className="flex justify-center items-center py-10">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moa-primary"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                          {districts.map((district) => {
                            const isSelected = selectedDistrict === district.name;
                            return (
                              <button
                                key={district.code}
                                onClick={() => setSelectedDistrict(district.name)}
                                className={`p-4 rounded-2xl border-2 transition-all ${
                                  isSelected
                                    ? 'border-moa-primary bg-gradient-to-br from-moa-primary/10 to-moa-accent/10 shadow-lg'
                                    : 'border-gray-200 bg-white hover:border-moa-primary/40'
                                }`}
                              >
                                <div className="font-semibold text-gray-900">{district.name}</div>
                                {isSelected && (
                                  <div className="mt-2">
                                    <Check className="w-5 h-5 text-moa-primary mx-auto" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full mt-8 py-4 bg-moa-primary text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <>
                {step === totalSteps ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    시작하기
                  </>
                ) : (
                  <>
                    다음
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </>
            )}
          </button>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index + 1 === step
                    ? 'w-8 bg-moa-primary'
                    : index + 1 < step
                    ? 'w-2 bg-moa-primary-light'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
