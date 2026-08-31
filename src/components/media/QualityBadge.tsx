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
  const getBadgeStyle = () => {
    if (type.includes("4K") || type.includes("超高清") || type.includes("原画")) {
      return "from-amber-500/15 via-orange-500/10 to-amber-500/5 text-amber-600 dark:text-amber-300 border-amber-500/40 hover:border-amber-500/60";
    }
    if (type.includes("1080")) {
      return "from-indigo-500/15 via-violet-500/10 to-indigo-500/5 text-indigo-600 dark:text-indigo-300 border-indigo-500/40 hover:border-indigo-500/60";
    }
    if (type.includes("720")) {
      return "from-sky-500/15 via-blue-500/10 to-sky-500/5 text-sky-600 dark:text-sky-300 border-sky-500/40 hover:border-sky-500/60";
    }
    return "from-slate-500/10 to-zinc-500/5 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400";
  };

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none transition-all flex items-center gap-1.5 bg-gradient-to-r ${getBadgeStyle()} ${
        selected
          ? "ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-md shadow-indigo-500/20 font-bold scale-[1.02]"
          : "opacity-85 hover:opacity-100"
      }`}
    >
      <span>{type}</span>
      {sizeText && (
        <span className="text-[10px] font-mono tabular-nums opacity-75 font-normal">
          ({sizeText})
        </span>
      )}
    </button>
  );
};
