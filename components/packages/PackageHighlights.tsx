import { Hotel, UtensilsCrossed, Bus, UserCheck, Camera, CheckCircle2 } from "lucide-react";

interface PackageHighlightsProps {
  highlights: string[];
}

const highlightIcons = [Hotel, UtensilsCrossed, Bus, UserCheck, Camera, CheckCircle2];

export default function PackageHighlights({ highlights }: PackageHighlightsProps) {
  return (
    <div className="bg-surface rounded-2xl p-6">
      <h3 className="font-heading font-semibold text-ink text-lg mb-4">
        Package Highlights
      </h3>
      <ul className="space-y-3">
        {highlights.map((highlight, index) => {
          const Icon = highlightIcons[index % highlightIcons.length];
          return (
            <li key={index} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-ink/80 text-sm leading-relaxed pt-1">
                {highlight}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
