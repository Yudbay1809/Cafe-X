'use client';

import { useEffect } from 'react';

export default function CustomerFonts() {
  useEffect(() => {
    if (document.getElementById('cx-fonts')) return;
    const link = document.createElement('link');
    link.id = 'cx-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Karla:wght@400;500;700;800&family=Playfair+Display+SC:wght@400;700;900&display=swap';
    document.head.appendChild(link);
  }, []);

  return null;
}
