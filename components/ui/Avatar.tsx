'use client';

import { useState } from 'react';
import NextImage from 'next/image';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
  fallback?: string;
}

export default function Avatar({ 
  src, 
  alt, 
  size = 40, 
  className = "", 
  fallback 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Si pas d'image ou erreur, afficher les initiales
  if (!src || imageError) {
    const initials = fallback || alt.charAt(0).toUpperCase();
    return (
      <div 
        className={`flex items-center justify-center bg-purple-500 rounded-full text-white font-semibold ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.4 }}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <NextImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="rounded-full object-cover"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        style={{ opacity: imageLoading ? 0 : 1 }}
      />
      {imageLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 rounded-full animate-pulse"
          style={{ width: size, height: size }}
        />
      )}
    </div>
  );
}
