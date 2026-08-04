export function formatBubbleTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatListTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Kecha';
  }

  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function formatLastSeen(dateString, isOnline) {
  if (isOnline) return 'online';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'hozirgina online edi';
  if (diffMin < 60) return `${diffMin} daqiqa oldin online edi`;

  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return `bugun ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} da online edi`;
  }

  return `${date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })} da online edi`;
}

export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds || 0));
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
