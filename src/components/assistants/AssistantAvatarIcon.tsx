import React from "react";
import {
  Bot,
  Code2,
  PenTool,
  BarChart3,
  Palette,
  FlaskConical,
  Scale,
  Activity,
  Sparkles,
  Brain,
  Target,
  Globe,
  LucideIcon,
} from "lucide-react";

export const ASSISTANT_ICONS: { id: string; name: string; Icon: LucideIcon }[] = [
  { id: "bot", name: "AI Assistant", Icon: Bot },
  { id: "code", name: "Developer", Icon: Code2 },
  { id: "pen", name: "Writer", Icon: PenTool },
  { id: "chart", name: "Analyst", Icon: BarChart3 },
  { id: "palette", name: "Designer", Icon: Palette },
  { id: "flask", name: "Scientist", Icon: FlaskConical },
  { id: "scale", name: "Legal", Icon: Scale },
  { id: "activity", name: "Health", Icon: Activity },
  { id: "sparkles", name: "Creative", Icon: Sparkles },
  { id: "brain", name: "Strategist", Icon: Brain },
  { id: "target", name: "Productivity", Icon: Target },
  { id: "globe", name: "Translator", Icon: Globe },
];

export function AssistantAvatarIcon({
  iconId,
  className = "h-6 w-6 text-sky-400",
}: {
  iconId?: string;
  className?: string;
}) {
  const found = ASSISTANT_ICONS.find((item) => item.id === iconId);
  const IconComponent = found ? found.Icon : Bot;

  return <IconComponent className={className} />;
}
