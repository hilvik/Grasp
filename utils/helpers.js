export function calculateReadingTime(text) {
  const wordsPerMinute = 200; // Average reading speed
  const words = text.trim().split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(words / wordsPerMinute);
  return readingTimeMinutes;
}
