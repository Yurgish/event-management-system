import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TAG_COLOR_CLASSES: Record<string, string> = {
  slate:
    'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-500/25 dark:bg-slate-500/15 dark:text-slate-300',
  indigo:
    'border-indigo-200 bg-indigo-100 text-indigo-700 dark:border-indigo-500/25 dark:bg-indigo-500/15 dark:text-indigo-300',
  blue: 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/15 dark:text-blue-300',
  sky: 'border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-300',
  cyan: 'border-cyan-200 bg-cyan-100 text-cyan-700 dark:border-cyan-500/25 dark:bg-cyan-500/15 dark:text-cyan-300',
  teal: 'border-teal-200 bg-teal-100 text-teal-700 dark:border-teal-500/25 dark:bg-teal-500/15 dark:text-teal-300',
  emerald:
    'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300',
  lime: 'border-lime-200 bg-lime-100 text-lime-700 dark:border-lime-500/25 dark:bg-lime-500/15 dark:text-lime-300',
  purple:
    'border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-500/25 dark:bg-purple-500/15 dark:text-purple-300',
  pink: 'border-pink-200 bg-pink-100 text-pink-700 dark:border-pink-500/25 dark:bg-pink-500/15 dark:text-pink-300',
  rose: 'border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/15 dark:text-rose-300',
  red: 'border-red-200 bg-red-100 text-red-700 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-300',
  orange:
    'border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-500/25 dark:bg-orange-500/15 dark:text-orange-300',
  amber:
    'border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300',
  green:
    'border-green-200 bg-green-100 text-green-700 dark:border-green-500/25 dark:bg-green-500/15 dark:text-green-300',
  yellow:
    'border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-500/25 dark:bg-yellow-500/15 dark:text-yellow-300',
};

const FALLBACK_COLOR_CLASSES =
  'border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-500/25 dark:bg-zinc-500/15 dark:text-zinc-300';

export function getTagColorClasses(color?: string | null) {
  return (color && TAG_COLOR_CLASSES[color]) || FALLBACK_COLOR_CLASSES;
}

export interface EventTagBadgeData {
  id: string;
  slug: string;
  label: string;
  color: string;
}

interface TagBadgeProps {
  label: string;
  color?: string | null;
  className?: string;
}

function TagBadge({ label, color, className }: TagBadgeProps) {
  const colorClasses = getTagColorClasses(color);

  return (
    <Badge
      variant="outline"
      className={cn('rounded-full px-2.5 py-0.5', colorClasses, className)}
    >
      {label}
    </Badge>
  );
}

export default TagBadge;
