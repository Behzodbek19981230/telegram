function breaksGroup(message) {
  if (!message) return true;
  if (message.type === 'CALL') return true;
  return Boolean(message.replyToId || message.replyTo || message.forwardedFromName);
}

function isSameGroup(a, b) {
  if (!a || !b) return false;
  if (a.senderId !== b.senderId) return false;
  if (breaksGroup(a) || breaksGroup(b)) return false;
  return true;
}

/** @returns {'single' | 'first' | 'middle' | 'last'} */
export function getMessageGroupPosition(messages, index) {
  const current = messages[index];
  const prev = messages[index - 1];
  const next = messages[index + 1];

  const withPrev = isSameGroup(prev, current);
  const withNext = isSameGroup(current, next);

  if (!withPrev && !withNext) return 'single';
  if (!withPrev && withNext) return 'first';
  if (withPrev && withNext) return 'middle';
  return 'last';
}
