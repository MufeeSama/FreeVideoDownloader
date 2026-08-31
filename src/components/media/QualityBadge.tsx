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
      return "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-400/40";
    }
    if (type.includes("1080")) {
      return "from-violet-500/20 to-indigo-500/20 text-violet-600 dark:text-violet-400 border-violet-400/40";
    }
    if (type.includes("720")) {
      return "from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400 border-blue-400/40";
    }
    return "from-slate-500/20 to-zinc-500/20 text-slate-600 dark:text-slate-400 border-slate-400/40";
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 bg-gradient-to-r ${getBadgeStyle()} ${
        selected
          ? "ring-2 ring-violet-500 scale-105 shadow-md shadow-violet-500/25 font-bold"
          : "hover:scale-[1.02]"
      }`}
    >
      <span>{type}</span>
      {sizeText && (
        <span className="text-[10px] font-mono opacity-80 font-normal">
          ({sizeText})
        </span>
      )}
    </button>
  );
};
