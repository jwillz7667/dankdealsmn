import {
  Candy,
  Cigarette,
  Disc3,
  Droplet,
  Flower2,
  Hexagon,
  Leaf,
  type LucideIcon,
  Sparkles,
  Wind,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  flower: Flower2,
  joint: Cigarette,
  gummy: Candy,
  vape: Wind,
  concentrate: Hexagon,
  dropper: Droplet,
  balm: Sparkles,
  grinder: Disc3,
};

export function CategoryIcon({
  iconKey,
  size = 26,
  className,
}: {
  iconKey: string | null;
  size?: number;
  className?: string;
}) {
  const Icon = (iconKey && ICONS[iconKey]) || Leaf;
  return <Icon size={size} className={className} aria-hidden="true" />;
}
