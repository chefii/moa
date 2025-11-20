/**
 * 이미지 URL을 절대 경로로 변환
 * 상대 경로일 경우 API_URL과 결합
 * 절대 URL일 경우 그대로 반환
 */
export function getImageUrl(url: string | undefined | null): string {
  if (!url) {
    return '';
  }

  // 이미 절대 URL인 경우 그대로 반환
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // 상대 경로인 경우 API_URL과 결합
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // URL이 /로 시작하지 않으면 추가
  const path = url.startsWith('/') ? url : `/${url}`;

  return `${apiUrl}${path}`;
}

/**
 * 여러 이미지 URL을 절대 경로로 변환
 */
export function getImageUrls(urls: (string | undefined | null)[]): string[] {
  return urls.map(getImageUrl).filter(Boolean);
}
