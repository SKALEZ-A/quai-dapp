/**
 * Format timestamp to professional relative time format
 * Removes seconds for cleaner, more professional appearance
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const postDate = new Date(date);
  const seconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
  
  // Just now (< 1 minute)
  if (seconds < 60) {
    return 'Just now';
  }
  
  // Minutes ago (< 1 hour)
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  }
  
  // Hours ago (< 24 hours)
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h ago`;
  }
  
  // Days ago (< 7 days)
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days}d ago`;
  }
  
  // Older posts: Show date (e.g., "Nov 12")
  return postDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Format timestamp for detailed post view
 * Shows full date and time without seconds
 */
export function formatDetailedTime(date: Date | string): string {
  const postDate = new Date(date);
  
  return postDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
