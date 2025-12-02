export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(
  date: Date | string,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return formatDate(dateObj);
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    meals: '🍽️',
    travel: '✈️',
    supplies: '📦',
    tools: '🔧',
    software: '💻',
    lodging: '🏨',
    transportation: '🚗',
    other: '📋',
  };
  return icons[category] || '📋';
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    meals: 'Meals & Dining',
    travel: 'Travel',
    supplies: 'Office Supplies',
    tools: 'Tools',
    software: 'Software',
    lodging: 'Lodging',
    transportation: 'Transportation',
    other: 'Other',
  };
  return labels[category] || category;
}
