import React from "react";

import {
  Compass,
  EyeOff,
  Plus,
  Smartphone,
  Sparkles,
  Upload,
} from "lucide-react";

export default function EmptyLibraryState(): React.ReactElement {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-160 rounded-xl border border-border bg-surface-lowest p-8 sm:p-10">
        {/* Hero image */}
        <div className="relative mx-auto mb-8 w-65 h-65">
          <div className="w-full h-full rounded-lg flex items-center justify-center overflow-hidden bg-linear-to-b from-surface-high to-surface-low">
            <BookIllustration />
          </div>

          <button
            type="button"
            aria-label="Add a book"
            className="absolute -right-2 -bottom-2 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
        </div>

        {/* Heading */}
        <h1 className="text-center font-heading font-bold text-headline-lg leading-(--headline-lg-leading) text-on-surface mb-3">
          Your library is waiting
        </h1>

        {/* Subtext */}
        <p className="text-center mx-auto mb-8 max-w-115 font-body text-body-lg leading-(--body-lg-leading) text-on-surface-variant">
          Connect your world of stories. Upload your first EPUB or PDF document
          to start your distraction-free reading experience.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <button
            type="button"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-md bg-primary text-primary-foreground font-label font-semibold text-label-md transition-opacity hover:opacity-90"
          >
            <Upload size={18} />
            Upload your first book
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-md border border-border bg-transparent text-primary font-label font-semibold text-label-md transition-colors hover:bg-surface-low"
          >
            <Compass size={18} />
            Explore Samples
          </button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FeatureCard
            icon={<Smartphone size={20} />}
            eyebrow="Sync Everywhere"
            text="Your library stays in sync across all your devices."
          />
          <FeatureCard
            icon={<Sparkles size={20} />}
            eyebrow="Smart Sorting"
            text="We'll automatically categorize and tag your library."
          />
          <FeatureCard
            icon={<EyeOff size={20} />}
            eyebrow="Focus Mode"
            text="Pure reading comfort with zero distractions."
          />
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  eyebrow: string;
  text: string;
}

function FeatureCard({
  icon,
  eyebrow,
  text,
}: FeatureCardProps): React.ReactElement {
  return (
    <div className="border border-border rounded-md bg-surface-lowest p-4">
      <div className="mb-3 text-primary">{icon}</div>
      <div className="font-label font-bold uppercase tracking-wide text-label-sm leading-(--label-sm-leading) text-on-surface mb-1">
        {eyebrow}
      </div>
      <p className="font-body text-body-sm leading-(--body-sm-leading) text-on-surface-variant">
        {text}
      </p>
    </div>
  );
}

function BookIllustration(): React.ReactElement {
  return (
    <svg
      width="150"
      height="150"
      viewBox="0 0 150 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="75"
        cy="128"
        rx="42"
        ry="7"
        className="fill-border"
        opacity="0.4"
      />
      <g transform="translate(75 72) rotate(-18) translate(-75 -72)">
        <rect
          x="40"
          y="40"
          width="70"
          height="58"
          rx="4"
          className="fill-surface-highest stroke-border"
        />
        <rect
          x="40"
          y="40"
          width="70"
          height="14"
          rx="4"
          className="fill-primary-container"
          opacity="0.85"
        />
        <circle
          cx="75"
          cy="47"
          r="4"
          className="fill-on-primary-container"
          opacity="0.7"
        />
        <rect
          x="44"
          y="90"
          width="62"
          height="8"
          rx="2"
          className="fill-secondary-container"
        />
      </g>
      <circle cx="112" cy="40" r="2.5" className="fill-primary" opacity="0.6" />
      <circle cx="30" cy="60" r="2" className="fill-primary" opacity="0.4" />
      <circle cx="118" cy="70" r="1.8" className="fill-primary" opacity="0.5" />
      <circle cx="26" cy="95" r="2.2" className="fill-primary" opacity="0.3" />
    </svg>
  );
}
