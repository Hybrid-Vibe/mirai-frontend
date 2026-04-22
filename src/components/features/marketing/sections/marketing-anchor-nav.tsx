"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "how-it-works", label: "Danh mục" },
  { id: "flash-sales", label: "Flash Sales" },
  { id: "features", label: "Best Seller" },
  { id: "testimonials", label: "Đánh giá" },
] as const;

export function MarketingAnchorNav() {
  const [activeId, setActiveId] = useState<string>(navItems[0].id);

  const sectionIds = useMemo(() => navItems.map((item) => item.id), []);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0.2, 0.5, 0.8],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [sectionIds]);

  const handleScrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;

    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="sticky top-[72px] z-20 border-y border-border bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="page-shell">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleScrollTo(item.id)}
              className={cn(
                "h-9 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition",
                activeId === item.id
                  ? "border-(--mirai-sem-primary) bg-(--mirai-sem-primary) text-(--mirai-sem-text)"
                  : "border-border bg-card text-muted-foreground hover:border-(--mirai-sem-primary)/60 hover:text-foreground",
              )}
              aria-pressed={activeId === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
