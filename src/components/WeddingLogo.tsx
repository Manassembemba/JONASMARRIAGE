import React, { useState, useEffect } from 'react';

interface WeddingLogoProps {
  src?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  fallbackVariant?: 'gold' | 'white' | 'dark';
}

/**
 * Robust Wedding Monogram / Logo Component for Jonas & Flora
 * - Displays the custom uploaded monogram or the pristine royal gold vector crest
 * - Automatically falls back to the embedded SVG if an external URL expires, 404s, or fails
 * - Prevents broken image icons from ever showing
 */
export const WeddingLogo: React.FC<WeddingLogoProps> = ({
  src,
  alt = 'Monogramme Jonas & Flora',
  className = 'w-10 h-10',
  imgClassName = 'w-full h-full object-contain',
  fallbackVariant = 'gold',
}) => {
  const [hasError, setHasError] = useState(false);

  // If the src changes, reset error state
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // Clean effective source: if it's the broken Google link or empty, use local SVG
  const effectiveSrc =
    !src ||
    src.trim() === '' ||
    src.includes('googleusercontent.com/aida/') ||
    hasError
      ? '/assets/monogram_jf.svg'
      : src;

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <img
        src={effectiveSrc}
        alt={alt}
        className={`${imgClassName} ${fallbackVariant === 'white' ? 'filter brightness-0 invert' : ''}`}
        onError={() => {
          if (!hasError) {
            console.warn('[WeddingLogo] Image failed to load, switching to royal vector monogram');
            setHasError(true);
          }
        }}
        loading="eager"
      />
    </div>
  );
};
