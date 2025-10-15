import React, { useState } from 'react';
import { UserIcon } from './Icons';

interface AvatarProps {
  src: string;
  alt: string;
  className?: string; // Applied to wrapper/img
  iconClassName?: string; // Specific class for the icon svg
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, className, iconClassName }) => {
  const [error, setError] = useState(false);

  // If the src is invalid or fails to load, show the fallback icon
  if (error || !src) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-700 overflow-hidden`}>
        <UserIcon className={`text-gray-400 w-3/4 h-3/4 ${iconClassName}`} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

export default Avatar;
