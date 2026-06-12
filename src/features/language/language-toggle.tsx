"use client";

import type { UiLanguage } from "@/features/clinic/types";
import { cn } from "@/lib/utils";

const labels = {
  en: {
    bangla: "BN",
    english: "EN",
    language: "Language",
  },
  bn: {
    bangla: "বাংলা",
    english: "ইং",
    language: "ভাষা",
  },
} as const;

export function LanguageToggle({
  className,
  value,
  onChange,
}: {
  className?: string;
  value: UiLanguage;
  onChange: (language: UiLanguage) => void;
}) {
  const copy = labels[value];

  return (
    <fieldset
      aria-label={copy.language}
      className={cn(
        "grid grid-cols-[auto_1fr_1fr] items-center overflow-hidden rounded-md border border-slate-200 bg-white text-sm shadow-sm",
        className,
      )}
    >
      <legend className="sr-only">{copy.language}</legend>
      <span className="px-3 font-semibold text-muted-foreground">
        {copy.language}
      </span>
      {(["en", "bn"] as const).map((language) => (
        <button
          aria-pressed={value === language}
          className={cn(
            "h-10 border-slate-200 border-l px-3 font-black transition-colors",
            value === language
              ? "bg-primary text-primary-foreground"
              : "bg-white text-slate-700 hover:bg-slate-50",
          )}
          key={language}
          onClick={() => onChange(language)}
          type="button"
        >
          {language === "en" ? copy.english : copy.bangla}
        </button>
      ))}
    </fieldset>
  );
}
