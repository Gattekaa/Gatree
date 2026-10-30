import { SOCIAL_BRAND_ICONS } from "@/components/shared/social-brand-icons";
import type { ComponentType } from "react";
import {
    BookOpen,
    Briefcase,
    Calendar,
    Camera,
    Coffee,
    ExternalLink,
    FileText,
    Globe,
    Headphones,
    Heart,
    Link,
    Mail,
    MapPin,
    Mic,
    Music,
    Phone,
    Play,
    Podcast,
    Rocket,
    ShoppingBag,
    Star,
    Users,
    Video,
    Zap,
} from "lucide-react";

export const ICON_COMPONENT_MAP: Record<string, ComponentType<{ className?: string }>> = {

  ...SOCIAL_BRAND_ICONS,
  x: SOCIAL_BRAND_ICONS.twitter,

  globe: Globe,
  mail: Mail,
  "shopping-bag": ShoppingBag,
  music: Music,
  video: Video,
  "file-text": FileText,
  calendar: Calendar,
  "map-pin": MapPin,
  link: Link,
  "external-link": ExternalLink,
  heart: Heart,
  star: Star,
  zap: Zap,
  "book-open": BookOpen,
  briefcase: Briefcase,
  camera: Camera,
  coffee: Coffee,
  headphones: Headphones,
  mic: Mic,
  phone: Phone,
  play: Play,
  podcast: Podcast,
  rocket: Rocket,
  users: Users,
};

export function getIconComponent(
  name: string | null | undefined
): ComponentType<{ className?: string }> | undefined {
  if (!name) return undefined;
  return ICON_COMPONENT_MAP[name];
}
