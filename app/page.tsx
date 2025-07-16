'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // إعادة توجيه إلى الصفحة الرئيسية
    window.location.href = '/sports-academy.html';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg">جاري تحميل أكاديمية النجوم الرياضية...</p>
      </div>
    </div>
  );
}