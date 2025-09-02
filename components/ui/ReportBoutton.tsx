'use client';

import { useState } from 'react';
import { Flag, MoreVertical } from 'lucide-react';
import ReportModal from './ReportModal';

interface ReportButtonProps {
  type: 'user' | 'message' | 'room';
  targetId: string;
  targetName: string;
  targetContent?: string;
  variant?: 'icon' | 'button' | 'menu';
  className?: string;
}

export default function ReportButton({
  type,
  targetId,
  targetName,
  targetContent,
  variant = 'icon',
  className = ''
}: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleReport = () => {
    setShowModal(true);
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'user':
        return 'utilisateur';
      case 'message':
        return 'message';
      case 'room':
        return 'salle';
    }
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleReport}
          className={`p-1 text-gray-400 hover:text-red-500 transition-colors ${className}`}
          title={`Signaler ce ${getTypeLabel()}`}
        >
          <Flag className="w-4 h-4" />
        </button>
        <ReportModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          type={type}
          targetId={targetId}
          targetName={targetName}
          targetContent={targetContent}
        />
      </>
    );
  }

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleReport}
          className={`inline-flex items-center px-3 py-1 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors ${className}`}
        >
          <Flag className="w-4 h-4 mr-1" />
          Signaler
        </button>
        <ReportModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          type={type}
          targetId={targetId}
          targetName={targetName}
          targetContent={targetContent}
        />
      </>
    );
  }

  if (variant === 'menu') {
    return (
      <>
        <button
          onClick={handleReport}
          className={`flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors ${className}`}
        >
          <Flag className="w-4 h-4 mr-3" />
          Signaler ce {getTypeLabel()}
        </button>
        <ReportModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          type={type}
          targetId={targetId}
          targetName={targetName}
          targetContent={targetContent}
        />
      </>
    );
  }

  return null;
}