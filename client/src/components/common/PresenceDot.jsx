export function PresenceDot({ isOnline }) {
  if (!isOnline) return null;
  return <span className="presence-dot" />;
}
