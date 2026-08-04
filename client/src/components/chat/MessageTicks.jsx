export function MessageTicks({ status, pending }) {
  if (pending) {
    return (
      <svg className="ticks ticks--pending" viewBox="0 0 16 16" width="15" height="15">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="28" strokeDashoffset="10" />
      </svg>
    );
  }

  if (status === 'READ') {
    return (
      <svg className="ticks ticks--read" viewBox="0 0 24 16" width="18" height="12">
        <path d="M1 8l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 8l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (status === 'DELIVERED') {
    return (
      <svg className="ticks ticks--delivered" viewBox="0 0 24 16" width="18" height="12">
        <path d="M1 8l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 8l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg className="ticks ticks--sent" viewBox="0 0 24 16" width="18" height="12">
      <path d="M4 8l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
