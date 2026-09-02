'use client';
import React, { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => { setVisible(window.scrollY > 400); };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={'scroll-to-top' + (visible ? ' show' : '')}
      aria-label='Retour en haut'
      title='Retour en haut'
    >
      <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
        <line x1='12' y1='19' x2='12' y2='5'></line>
        <polyline points='5 12 12 5 19 12'></polyline>
      </svg>
    </button>
  );
}
