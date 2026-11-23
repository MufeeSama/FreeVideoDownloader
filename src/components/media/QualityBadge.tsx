import React from "react";

interface QualityBadgeProps {
  type: string;
  sizeText?: string;
  selected?: boolean;
  onClick?: () => void;
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({
  type,
  sizeText,
  selected = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-xs border transition-colors flex items-center gap-1.5 focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:outline-none ${
        selected
          ? "border-amber-500 dark:border-amber-400 bg-[var(--card-bg)] text-amber-700 dark:text-amber-400 font-medium"
          : "border-[var(--card-border)] bg-[var(--raised-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]"
      }`}
    >
      <span>{type}</span>
      {sizeText && (
        <span className="text-[10px] font-mono tabular-nums opacity-75">
          {sizeText}
        </span>
      )}
    </button>
  );
};
