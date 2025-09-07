
import React from 'react';

interface MicrosoftIconProps {
  className?: string;
}

export const MicrosoftIcon: React.FC<MicrosoftIconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 23 23"
      className={className}
      fill="none"
    >
      <path fill="#f1511b" d="M1 1h10v10H1z" />
      <path fill="#80cc28" d="M12 1h10v10H12z" />
      <path fill="#00adef" d="M1 12h10v10H1z" />
      <path fill="#fbbc09" d="M12 12h10v10H12z" />
    </svg>
  );
};
