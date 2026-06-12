import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export interface Suggestion {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface SuggestionGridProps {
  suggestions: Suggestion[];
  onSelect: (title: string) => void;
}

export default function SuggestionGrid({ suggestions, onSelect }: SuggestionGridProps) {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      {suggestions.map(({ icon: Icon, title, description }, idx) => (
        <motion.button
          key={title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          onClick={() => onSelect(title)}
          className="group flex flex-col items-start rounded-xl border border-gray-200 bg-white p-4 text-left shadow-ambient transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-elevated"
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary-50 text-secondary-600">
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary-700">{title}</p>
          <p className="mt-0.5 text-xs text-gray-400">{description}</p>
        </motion.button>
      ))}
    </div>
  );
}
