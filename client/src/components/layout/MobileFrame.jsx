export function MobileFrame({ children }) {
  return (
    <div className="app-backdrop">
      <div className="mobile-frame">{children}</div>
    </div>
  );
}
