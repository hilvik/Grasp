export function calculateReadingTime(text) {
  if (!text) return 1; // Default to 1 minute if no text
  
  const wordsPerMinute = 200; // Average reading speed
  const words = text.trim().split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, readingTimeMinutes); // Minimum 1 minute
}

export function formatDate(date) {
  const now = new Date();
  const articleDate = new Date(date);
  const diffInHours = (now - articleDate) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return articleDate.toLocaleDateString();
  }
}

export function truncateText(text, maxLength = 150) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getImageUrl(url) {
  if (!url) return null;
  
  // Handle relative URLs
  if (url.startsWith('/')) {
    return `${process.env.NEXT_PUBLIC_BASE_URL || ''}${url}`;
  }
  
  // Ensure HTTPS
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  return url;
}