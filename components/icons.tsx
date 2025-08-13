import React from 'react';

export const TrophyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm4.125 3a2.625 2.625 0 115.25 0 2.625 2.625 0 01-5.25 0zM8.25 12a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5z" clipRule="evenodd" />
    </svg>
);


export const FireIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2.25c.338 0 .67.019.998.055 2.115.151 3.86 1.897 4.012 4.012.036.328.055.66.055.998 0 3.86-1.897 7.213-4.565 9.565a.75.75 0 01-1.06 0C9.147 14.478 7.25 11.123 7.25 7.25c0-.338.019-.67.055-.998.151-2.115 1.897-3.86 4.012-4.012A9.702 9.702 0 0112 2.25z" />
  </svg>
);