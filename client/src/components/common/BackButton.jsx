import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function BackButton({ to, onClick }) {
  const navigate = useNavigate();
  return (
    <button
      className="icon-button"
      onClick={onClick || (() => (to ? navigate(to) : navigate(-1)))}
      aria-label="Orqaga"
    >
      <ArrowLeft size={22} strokeWidth={2} />
    </button>
  );
}
