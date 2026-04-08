'use client';

import { useEffect } from 'react';

export default function CustomerFonts() {
  useEffect(() => {
    if (document.getElementById('cx-fonts')) return;
    const link = document.createElement('link');
    link.id = 'cx-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Unbounded:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  return null;
}
