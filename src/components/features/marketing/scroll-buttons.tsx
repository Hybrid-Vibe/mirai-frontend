"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

export function ScrollButtons({ targetId }: { targetId: string }) {
  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById(targetId);
    if (container) {
      // scroll by a bit less than the width to keep context
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="hidden items-center gap-2 md:flex">
      <button
        onClick={() => scroll("left")}
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--mirai-color-line) bg-background transition-all hover:border-(--mirai-sem-primary) hover:text-(--mirai-sem-primary) active:scale-95 shadow-sm"
        aria-label="Previous"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => scroll("right")}
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--mirai-color-line) bg-background transition-all hover:border-(--mirai-sem-primary) hover:text-(--mirai-sem-primary) active:scale-95 shadow-sm"
        aria-label="Next"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
