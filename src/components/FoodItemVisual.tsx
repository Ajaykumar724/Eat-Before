import React, { useState } from 'react';
import { FoodCategory } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface FoodItemVisualProps {
  category: FoodCategory;
  image?: string;
  alt: string;
  className?: string;
}

export const FoodItemVisual: React.FC<FoodItemVisualProps> = ({
  category,
  image,
  alt,
  className = '',
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden border border-[#E2E8F0] bg-white ${className}`}
    >
      {image && !imageFailed ? (
        <img
          src={image}
          alt={alt}
          className="h-full w-full object-contain p-1"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <CategoryIcon category={category} className="h-full w-full rounded-none" />
      )}
    </div>
  );
};
