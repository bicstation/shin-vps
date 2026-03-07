import React from 'react';

interface SectionHeaderProps {
  title: string;
  subTitle?: string;
}

export default function SectionHeader({ title, subTitle }: SectionHeaderProps) {
  return (
    <div className="mb-8 border-b-2 border-gray-100 dark:border-gray-800 pb-5">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter italic">
        {title}
      </h1>
      {subTitle && (
        <p className="text-sm font-medium text-pink-500 dark:text-pink-400">
          ▶ {subTitle}
        </p>
      )}
    </div>
  );
}