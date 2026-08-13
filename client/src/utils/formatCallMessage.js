import { formatBubbleTime, formatDuration } from './formatTime.js';

export function parseCallPayload(message) {
  try {
    return JSON.parse(message.content || '{}');
  } catch {
    return {};
  }
}

export function formatCallPreview(message, { isOwn } = {}) {
  const { callType, status } = parseCallPayload(message);
  const kind = callType === 'video' ? 'Video qo‘ng‘iroq' : 'Qo‘ng‘iroq';

  if (status === 'completed') {
    const duration = message.mediaDuration ? ` · ${formatDuration(message.mediaDuration)}` : '';
    return isOwn ? `Chiquvchi ${kind.toLowerCase()}${duration}` : `Kiruvchi ${kind.toLowerCase()}${duration}`;
  }
  if (status === 'missed') {
    return isOwn ? 'Javobsiz qo‘ng‘iroq' : 'O‘tkazib yuborilgan qo‘ng‘iroq';
  }
  if (status === 'rejected') {
    return isOwn ? 'Rad etildi' : 'Rad etilgan qo‘ng‘iroq';
  }
  if (status === 'busy') {
    return isOwn ? 'Band' : 'Band edi';
  }
  return kind;
}

export function formatCallDetails(message, { isOwn } = {}) {
  const payload = parseCallPayload(message);
  const kind = payload.callType === 'video' ? 'Video qo‘ng‘iroq' : 'Audio qo‘ng‘iroq';
  const startedAt = payload.startedAt || message.createdAt;
  const timeLabel = formatBubbleTime(startedAt);

  let title;
  let subtitle = timeLabel;
  let variant = 'neutral';

  if (payload.status === 'completed') {
    title = isOwn ? `Chiquvchi ${kind.toLowerCase()}` : `Kiruvchi ${kind.toLowerCase()}`;
    if (message.mediaDuration) {
      subtitle = `${timeLabel} · ${formatDuration(message.mediaDuration)}`;
    }
    variant = 'success';
  } else if (payload.status === 'missed') {
    title = isOwn ? 'Javobsiz qo‘ng‘iroq' : 'O‘tkazib yuborilgan qo‘ng‘iroq';
    subtitle = `${kind} · ${timeLabel}`;
    variant = isOwn ? 'neutral' : 'danger';
  } else if (payload.status === 'rejected') {
    title = isOwn ? 'Rad etildi' : 'Rad etilgan qo‘ng‘iroq';
    subtitle = `${kind} · ${timeLabel}`;
    variant = 'danger';
  } else if (payload.status === 'busy') {
    title = isOwn ? 'Band' : 'Band edi';
    subtitle = `${kind} · ${timeLabel}`;
    variant = 'neutral';
  } else {
    title = kind;
    subtitle = timeLabel;
  }

  return { title, subtitle, variant, isVideo: payload.callType === 'video' };
}
