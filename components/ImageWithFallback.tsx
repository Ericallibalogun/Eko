import React, { useState } from 'react';
import { ImageIcon } from './Icons';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string; // Applied to wrapper/img
  fallbackClassName?: string; // Applied to fallback container
  iconClassName?: string; // Specific class for the icon svg
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt, className, fallbackClassName, iconClassName }) => {
  const [error, setError] = useState(false);

  // If the src is invalid or fails to load, show the fallback icon
  if (error || !src) {
    return (
      <div className={`${className} ${fallbackClassName} flex items-center justify-center bg-gray-700 overflow-hidden`}>
        <ImageIcon className={`text-gray-500 w-1/2 h-1/2 ${iconClassName}`} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};

export default ImageWithFallback;
