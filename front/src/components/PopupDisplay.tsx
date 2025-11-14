'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { PublicPopup, publicPopupsApi } from '@/lib/api/popups';

interface PopupDisplayProps {
  popup: PublicPopup;
  onClose: () => void;
}

export default function PopupDisplay({ popup, onClose }: PopupDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleDontShowAgain = async () => {
    if (popup.showOnce) {
      // Try to record view to server first
      try {
        await publicPopupsApi.recordPopupView(popup.id);
      } catch (error) {
        console.error('Failed to record popup view:', error);
      }

      // Also save to localStorage as fallback (for non-authenticated users)
      localStorage.setItem(`popup_dismissed_${popup.id}`, 'true');
    }
    handleClose();
  };

  const handleLinkClick = () => {
    if (popup.linkUrl) {
      window.open(popup.linkUrl, '_blank');
    }
    handleClose();
  };

  // Modal type popup
  if (popup.type === 'MODAL') {
    return (
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleClose}
        />

        {/* Modal */}
        <div
          className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image */}
          {popup.imageUrl && (
            <div className="w-full h-48 rounded-t-2xl overflow-hidden">
              <img
                src={popup.imageUrl}
                alt={popup.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {popup.title}
            </h2>
            <div
              className="text-gray-600 mb-6 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: popup.content }}
            />

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {popup.linkUrl && (
                <button
                  onClick={handleLinkClick}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-moa-primary text-white rounded-xl hover:bg-moa-primary/90 transition-colors font-semibold"
                >
                  {popup.buttonText || '자세히 보기'}
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
              <div className="flex gap-2">
                {popup.showOnce && (
                  <button
                    onClick={handleDontShowAgain}
                    className="flex-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    다시 보지 않기
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Bottom sheet type popup
  if (popup.type === 'BOTTOM_SHEET') {
    return (
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleClose}
        />

        {/* Bottom Sheet */}
        <div
          className={`fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ${
            isVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {popup.imageUrl && (
              <div className="w-full h-40 rounded-xl overflow-hidden mb-4">
                <img
                  src={popup.imageUrl}
                  alt={popup.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {popup.title}
            </h3>
            <div
              className="text-gray-600 mb-6 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: popup.content }}
            />

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {popup.linkUrl && (
                <button
                  onClick={handleLinkClick}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-moa-primary text-white rounded-xl hover:bg-moa-primary/90 transition-colors font-semibold"
                >
                  {popup.buttonText || '자세히 보기'}
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
              <div className="flex gap-2">
                {popup.showOnce && (
                  <button
                    onClick={handleDontShowAgain}
                    className="flex-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    다시 보지 않기
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Toast type popup
  if (popup.type === 'TOAST') {
    return (
      <div
        className={`fixed top-4 right-4 z-50 w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200 transition-all duration-300 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {popup.imageUrl && (
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={popup.imageUrl}
                  alt={popup.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 mb-1">
                {popup.title}
              </h4>
              <div
                className="text-sm text-gray-600 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: popup.content }}
              />
              {popup.linkUrl && (
                <button
                  onClick={handleLinkClick}
                  className="text-sm text-moa-primary hover:text-moa-primary/80 font-medium mt-2 inline-flex items-center gap-1"
                >
                  {popup.buttonText || '자세히 보기'}
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {popup.showOnce && (
            <button
              onClick={handleDontShowAgain}
              className="text-xs text-gray-500 hover:text-gray-700 mt-2"
            >
              다시 보지 않기
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
