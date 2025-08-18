import React from 'react';

export const TrophyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M16.5 3.75a.75.75 0 01.75.75v14.25a.75.75 0 01-1.5 0V4.5a.75.75 0 01.75-.75zM8.25 3.75a.75.75 0 01.75.75v14.25a.75.75 0 01-1.5 0V4.5a.75.75 0 01.75-.75zM12.75 2.25a.75.75 0 00-1.5 0v18a.75.75 0 001.5 0v-18z" clipRule="evenodd" />
        <path d="M11.25 4.533A9.006 9.006 0 006.75 2.25a.75.75 0 00-1.5 0v1.5A9.006 9.006 0 009.75 6.033v-1.5zM12.75 4.533V6.033A9.006 9.006 0 0117.25 3.75v-1.5a.75.75 0 00-1.5 0 9.006 9.006 0 00-3-1.517z" />
    </svg>
);


export const FireIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.071l9 9a.75.75 0 001.071-1.071l-9-9zM12 3a9 9 0 100 18 9 9 0 000-18zM3.75 12a8.25 8.25 0 1116.5 0 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
  </svg>
);

export const ChartBarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3 13.75a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v6.5a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75v-6.5zM9.75 8.5a.75.75 0 00-.75.75v11a.75.75 0 00.75.75h3a.75.75 0 00.75-.75v-11a.75.75 0 00-.75-.75h-3zM16.5 3a.75.75 0 00-.75.75v17.5a.75.75 0 00.75.75h3a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-3z" />
    </svg>
);

export const CalendarDaysIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zM5.25 6.75c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h13.5c.621 0 1.125-.504 1.125-1.125V7.875c0-.621-.504-1.125-1.125-1.125H5.25z" clipRule="evenodd" />
    </svg>
);
