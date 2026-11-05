/**
 * Live Bangladesh Time (BST - UTC+6) and Date utilities
 */

export const getBangladeshDateTime = () => {
  const now = new Date();

  // 12-hour time with seconds in Asia/Dhaka timezone
  const timeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now);

  // Full English Date in Asia/Dhaka
  const englishDateStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(now);

  // Full Bengali Date in Asia/Dhaka
  const bengaliDateStr = new Intl.DateTimeFormat('bn-BD', {
    timeZone: 'Asia/Dhaka',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  // Current ISO Date YYYY-MM-DD in Asia/Dhaka
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now); // en-CA outputs YYYY-MM-DD

  return {
    timeStr,
    englishDateStr,
    bengaliDateStr,
    isoDate: parts,
  };
};
