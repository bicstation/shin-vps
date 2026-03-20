/* shared/components/atoms/SafeImage.tsx */
'use client';

import React, { useState } from 'react';

interface SafeImageProps {
    src: string;
    alt: string;
    className?: string;
    fallback?: string;
}

export default function SafeImage({ src, alt, className, fallback = '/no-image.jpg' }: SafeImageProps) {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <img 
            src={imgSrc} 
            alt={alt} 
            className={className} 
            onError={() => setImgSrc(fallback)} 
        />
    );
}