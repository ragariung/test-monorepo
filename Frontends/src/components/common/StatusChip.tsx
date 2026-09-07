import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Archive, 
  Send 
} from 'lucide-react';
import { ApplicationStatus, ProductStatus } from '../../types';

interface StatusChipProps {
  status: ApplicationStatus | ProductStatus | string;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs font-medium gap-1.5';

  switch (status) {
    // Application statuses
    case 'Submitted':
      return (
        <span 
          id={`status-chip-${status.toLowerCase()}`}
          className={`inline-flex items-center rounded-full border border-blue-200 bg-blue-50 text-blue-800 whitespace-nowrap ${sizeClasses}`}
        >
          <Send className={isSm ? 'w-3 h-3 text-blue-600' : 'w-3.5 h-3.5 text-blue-600'} aria-hidden="true" />
          <span>Baru Masuk</span>
        </span>
      );

    case 'Under Review':
      return (
        <span 
          id={`status-chip-${status.toLowerCase().replace(' ', '-')}`}
          className={`inline-flex items-center rounded-full border border-amber-300 bg-amber-50 text-amber-900 whitespace-nowrap ${sizeClasses}`}
        >
          <Clock className={isSm ? 'w-3 h-3 text-amber-700' : 'w-3.5 h-3.5 text-amber-700'} aria-hidden="true" />
          <span>Sedang Ditinjau</span>
        </span>
      );

    case 'Approved':
      return (
        <span 
          id={`status-chip-${status.toLowerCase()}`}
          className={`inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 text-emerald-900 whitespace-nowrap ${sizeClasses}`}
        >
          <CheckCircle2 className={isSm ? 'w-3 h-3 text-emerald-700' : 'w-3.5 h-3.5 text-emerald-700'} aria-hidden="true" />
          <span>Disetujui</span>
        </span>
      );

    case 'Rejected':
      return (
        <span 
          id={`status-chip-${status.toLowerCase()}`}
          className={`inline-flex items-center rounded-full border border-rose-300 bg-rose-50 text-rose-900 whitespace-nowrap ${sizeClasses}`}
        >
          <XCircle className={isSm ? 'w-3 h-3 text-rose-700' : 'w-3.5 h-3.5 text-rose-700'} aria-hidden="true" />
          <span>Ditolak</span>
        </span>
      );

    // Product CMS statuses
    case 'Published':
      return (
        <span 
          id={`status-chip-${status.toLowerCase()}`}
          className={`inline-flex items-center rounded-full border border-teal-300 bg-teal-50 text-teal-900 whitespace-nowrap ${sizeClasses}`}
        >
          <CheckCircle2 className={isSm ? 'w-3 h-3 text-teal-700' : 'w-3.5 h-3.5 text-teal-700'} aria-hidden="true" />
          <span>Published</span>
        </span>
      );

    case 'Draft':
      return (
        <span 
          id={`status-chip-${status.toLowerCase()}`}
          className={`inline-flex items-center rounded-full border border-slate-300 bg-slate-100 text-slate-800 whitespace-nowrap ${sizeClasses}`}
        >
          <FileText className={isSm ? 'w-3 h-3 text-slate-600' : 'w-3.5 h-3.5 text-slate-600'} aria-hidden="true" />
          <span>Draft</span>
        </span>
      );

    case 'Archived':
      return (
        <span 
          id={`status-chip-${status.toLowerCase()}`}
          className={`inline-flex items-center rounded-full border border-zinc-300 bg-zinc-100 text-zinc-700 whitespace-nowrap ${sizeClasses}`}
        >
          <Archive className={isSm ? 'w-3 h-3 text-zinc-500' : 'w-3.5 h-3.5 text-zinc-500'} aria-hidden="true" />
          <span>Archived</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 whitespace-nowrap ${sizeClasses}`}>
          <span>{status}</span>
        </span>
      );
  }
};
