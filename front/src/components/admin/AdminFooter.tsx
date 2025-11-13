'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, Clock, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { settingsApi, FooterLink as APIFooterLink } from '@/lib/api/settings';
import { commonCodesApi } from '@/lib/api/common-codes';

interface CompanyInfo {
  company_name: string;
  company_ceo: string;
  company_business_number: string;
  company_ecommerce_number: string;
  company_address: string;
  contact_email: string;
  contact_phone: string;
  contact_working_hours: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_youtube?: string;
}

export default function AdminFooter() {
  const [footerLinks, setFooterLinks] = useState<APIFooterLink[]>([]);
  const [companyInfo, setCompanyInfo] = useState<Partial<CompanyInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFooterData();
  }, []);

  const loadFooterData = async () => {
    try {
      setLoading(true);

      // Load footer links
      const links = await settingsApi.getFooterLinks('terms', false);
      setFooterLinks(links);

      // Load company info from common codes
      const companyCodes = await commonCodesApi.getCodesByGroup('COMPANY_INFO');

      // Transform common codes to CompanyInfo format
      const companyData: Partial<CompanyInfo> = {};
      companyCodes.forEach((code) => {
        // Extract the actual key from the code (e.g., COMPANY_INFO_COMPANY_NAME -> company_name)
        const keyMatch = code.code.match(/COMPANY_INFO_(.+)/);
        if (keyMatch) {
          const key = keyMatch[1].toLowerCase();
          companyData[key as keyof CompanyInfo] = code.value || '';
        }
      });

      setCompanyInfo(companyData);
    } catch (error) {
      console.error('Failed to load footer data:', error);

      // Fallback to default values
      setFooterLinks([
        {
          id: '1',
          title: '이용약관',
          url: '/terms/service',
          order: 0,
          isExternal: false,
          isActive: true,
          category: 'terms',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: '개인정보처리방침',
          url: '/terms/privacy',
          order: 1,
          isExternal: false,
          isActive: true,
          category: 'terms',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* 회사 정보 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              {companyInfo.company_name || '모아 (MOA)'}
            </h3>
            <div className="space-y-2 text-sm">
              {!loading && companyInfo && (
                <>
                  {companyInfo.company_ceo && (
                    <p className="text-gray-400">대표: {companyInfo.company_ceo}</p>
                  )}
                  {companyInfo.company_business_number && (
                    <p className="text-gray-400">
                      사업자등록번호: {companyInfo.company_business_number}
                    </p>
                  )}
                  {companyInfo.company_ecommerce_number && (
                    <p className="text-gray-400">
                      통신판매업신고: {companyInfo.company_ecommerce_number}
                    </p>
                  )}
                  {companyInfo.company_address && (
                    <p className="text-gray-400 leading-relaxed">{companyInfo.company_address}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 고객센터 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">고객센터</h3>
            <div className="space-y-3 text-sm">
              {!loading && companyInfo && (
                <>
                  {companyInfo.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-moa-primary-light" />
                      <a
                        href={`mailto:${companyInfo.contact_email}`}
                        className="hover:text-white transition-colors"
                      >
                        {companyInfo.contact_email}
                      </a>
                    </div>
                  )}
                  {companyInfo.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-moa-primary-light" />
                      <a
                        href={`tel:${companyInfo.contact_phone}`}
                        className="hover:text-white transition-colors"
                      >
                        {companyInfo.contact_phone}
                      </a>
                    </div>
                  )}
                  {companyInfo.contact_working_hours && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-moa-primary-light mt-0.5" />
                      <p className="text-gray-400">{companyInfo.contact_working_hours}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 이용안내 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">이용안내</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/admin/faq" className="hover:text-white transition-colors">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="/admin/inquiries" className="hover:text-white transition-colors">
                  1:1 문의
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-white transition-colors">
                  이용 가이드
                </Link>
              </li>
              <li>
                <Link href="/admin/notices" className="hover:text-white transition-colors">
                  공지사항
                </Link>
              </li>
            </ul>
          </div>

          {/* 소셜 미디어 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">소셜 미디어</h3>
            <div className="flex gap-3">
              {companyInfo.social_facebook && (
                <a
                  href={companyInfo.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-moa-primary transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {companyInfo.social_instagram && (
                <a
                  href={companyInfo.social_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-moa-primary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {companyInfo.social_twitter && (
                <a
                  href={companyInfo.social_twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-moa-primary transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {companyInfo.social_youtube && (
                <a
                  href={companyInfo.social_youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-moa-primary transition-colors"
                  aria-label="Youtube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 약관 링크 */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <div className="flex flex-wrap gap-4 text-sm">
            {footerLinks.map((link) => (
              <Link
                key={link.id}
                href={link.url}
                className={`hover:text-white transition-colors ${
                  link.title === '개인정보처리방침' ? 'text-white font-semibold' : ''
                }`}
                target={link.isExternal ? '_blank' : undefined}
                rel={link.isExternal ? 'noopener noreferrer' : undefined}
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>

        {/* 저작권 */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {currentYear} MOA. All rights reserved.</p>
            <p className="text-xs">
              모든 권리는 회사에 있으며, 무단 전재 및 재배포를 금지합니다.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
