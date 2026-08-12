import { Check, CheckCheck, Clock } from 'lucide-react';

export function MessageTicks({ status, pending }) {
  if (pending) {
    return <Clock className="ticks ticks--pending" size={13} strokeWidth={2} />;
  }

  if (status === 'READ') {
    return <CheckCheck className="ticks ticks--read" size={15} strokeWidth={2} />;
  }

  if (status === 'DELIVERED') {
    return <CheckCheck className="ticks ticks--delivered" size={15} strokeWidth={2} />;
  }

  return <Check className="ticks ticks--sent" size={15} strokeWidth={2} />;
}
