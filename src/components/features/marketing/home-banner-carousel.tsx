"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/providers/language-context";

const COLLECTION_SLIDES_VI = [
  {
    id: "jardin-de-fleurs",
    tag: "Bộ sưu tập bán chạy",
    title: "Khám phá Bộ sưu tập Jardin De Fleurs",
    href: "/collections/jardin-de-fleurs",
    image:
      "https://stuwtmcljxqhdlsawtif.supabase.co/storage/v1/object/public/static-image/collection-banner.jpg",
  },
  {
    id: "greengreen-redred",
    tag: "Bộ sưu tập nổi bật",
    title: "Khám phá Bộ sưu tập GreenGreen + RedRed",
    href: "/collections/greengreen-redred",
    image: "/images/collections/greengreen_redred_cover.png",
  },
  {
    id: "on-denim",
    tag: "Bộ sưu tập xu hướng",
    title: "Khám phá Bộ sưu tập On Denim",
    href: "/collections/on-denim",
    image: "/images/collections/on_denim_cover.png",
  },
];

const COLLECTION_SLIDES_EN = [
  {
    id: "jardin-de-fleurs",
    tag: "Best-Selling Collection",
    title: "Explore the Jardin De Fleurs Collection",
    href: "/collections/jardin-de-fleurs",
    image:
      "https://stuwtmcljxqhdlsawtif.supabase.co/storage/v1/object/public/static-image/collection-banner.jpg",
  },
  {
    id: "greengreen-redred",
    tag: "Featured Collection",
    title: "Explore the GreenGreen + RedRed Collection",
    href: "/collections/greengreen-redred",
    image: "/images/collections/greengreen_redred_cover.png",
  },
  {
    id: "on-denim",
    tag: "Trending Collection",
    title: "Explore the On Denim Collection",
    href: "/collections/on-denim",
    image: "/images/collections/on_denim_cover.png",
  },
];

export function HomeBannerCarousel() {
  const { locale, t } = useTranslation();
  const COLLECTION_SLIDES =
    locale === "en" ? COLLECTION_SLIDES_EN : COLLECTION_SLIDES_VI;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const totalSlides = 1 + COLLECTION_SLIDES.length; // AI Custom Case + 3 collections
  const autoPlayInterval = 6000; // 6 seconds for comfortable reading
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Swipe and Drag references
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(nextSlide, autoPlayInterval);
  }, [nextSlide]);

  useEffect(() => {
    if (!isHovered) {
      resetTimer();
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isHovered, resetTimer]);

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
    resetTimer();
  };

  const handlePrevClick = () => {
    prevSlide();
    resetTimer();
  };

  const handleNextClick = () => {
    nextSlide();
    resetTimer();
  };

  // Touch Swipe Handlers
  const handleSwipe = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchEndX.current - touchStartX.current;
    const threshold = 50; // minimum swipe distance in pixels
    if (diff > threshold) {
      prevSlide();
      resetTimer();
    } else if (diff < -threshold) {
      nextSlide();
      resetTimer();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }, [nextSlide, prevSlide, resetTimer]);

  // Mouse Drag Handlers
  const handleDragEnd = useCallback(
    (diff: number) => {
      const threshold = 50; // minimum drag distance in pixels
      if (diff > threshold) {
        prevSlide();
        resetTimer();
      } else if (diff < -threshold) {
        nextSlide();
        resetTimer();
      }
    },
    [nextSlide, prevSlide, resetTimer],
  );

  return (
    <div
      className="relative w-full overflow-hidden rounded-[4px] bg-(--mirai-sem-text) text-(--mirai-sem-background) group select-none cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        isDragging.current = false;
        setIsHovered(false);
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
        touchEndX.current = null;
      }}
      onTouchMove={(e) => {
        touchEndX.current = e.touches[0].clientX;
      }}
      onTouchEnd={handleSwipe}
      onMouseDown={(e) => {
        // Only track left click
        if (e.button !== 0) return;
        isDragging.current = true;
        dragStartX.current = e.clientX;
      }}
      onMouseUp={(e) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        const diff = e.clientX - dragStartX.current;
        handleDragEnd(diff);
      }}
    >
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {/* Slide 1: AI Custom Case */}
        <div className="w-full shrink-0 min-h-[340px] grid items-stretch gap-0 md:grid-cols-[4fr_6fr] overflow-hidden">
          <div className="flex flex-col justify-center px-8 py-8 md:py-10 md:pr-4">
            <p className="mb-3 text-sm text-(--mirai-sem-primary) font-semibold uppercase tracking-wider">
              {t("home.custom_case_title")}
            </p>
            <h2 className="font-heading text-4xl font-semibold leading-tight md:text-5xl mb-6 md:max-w-[340px]">
              {locale === "vi" ? (
                <>
                  Thiết kế ốp lưng mang dấu ấn{" "}
                  <br className="hidden md:inline" /> riêng của bạn
                </>
              ) : (
                <>
                  Design phone cases <br className="hidden md:inline" /> that
                  match your vibe
                </>
              )}
            </h2>
            <div>
              <Link
                href="/customize"
                className="inline-flex min-w-36 items-center justify-center rounded-[4px] bg-(--mirai-sem-primary) px-6 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-(--mirai-state-primary-hover) active:scale-[0.98]"
                draggable={false}
              >
                {t("home.explore_now")}
              </Link>
            </div>
          </div>
          <div className="relative h-64 md:h-auto w-full bg-(--mirai-sem-text-muted)/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://stuwtmcljxqhdlsawtif.supabase.co/storage/v1/object/public/static-image/ava-mirai%20.jpg"
              alt="MIRAI Custom Case"
              className="h-full w-full object-cover"
              draggable={false}
            />
            {/* Gradient mask for seamless blend */}
            <div className="absolute inset-0 bg-gradient-to-r from-(--mirai-sem-text) via-transparent to-transparent hidden md:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-(--mirai-sem-text) via-transparent to-transparent md:hidden" />
          </div>
        </div>

        {/* Dynamic slides for each collection */}
        {COLLECTION_SLIDES.map((slide) => (
          <div
            key={slide.id}
            className="w-full shrink-0 min-h-[340px] grid items-stretch gap-0 md:grid-cols-2 overflow-hidden"
          >
            <div className="flex flex-col justify-center px-8 py-8 md:py-10 md:pr-4">
              <p className="mb-3 text-sm text-(--mirai-sem-primary) font-semibold uppercase tracking-wider">
                {slide.tag}
              </p>
              <h2 className="font-heading text-4xl font-semibold leading-tight md:text-5xl mb-6">
                {slide.title}
              </h2>
              <div>
                <Link
                  href={slide.href}
                  className="inline-flex min-w-36 items-center justify-center rounded-[4px] bg-(--mirai-sem-primary) px-6 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-(--mirai-state-primary-hover) active:scale-[0.98]"
                  draggable={false}
                >
                  {locale === "vi" ? "Mua ngay" : "Shop Now"}
                </Link>
              </div>
            </div>
            <div className="relative h-64 md:h-auto w-full bg-(--mirai-sem-text-muted)/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={slide.title}
                className="h-full w-full object-cover"
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://stuwtmcljxqhdlsawtif.supabase.co/storage/v1/object/public/static-image/collection-banner.jpg";
                }}
              />
              {/* Gradient mask for seamless blend */}
              <div className="absolute inset-0 bg-gradient-to-r from-(--mirai-sem-text) via-transparent to-transparent hidden md:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-(--mirai-sem-text) via-transparent to-transparent md:hidden" />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrevClick}
        className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-black/40 focus:outline-none cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={handleNextClick}
        className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-black/40 focus:outline-none cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Pagination Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-10">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === currentSlide
                ? "w-6 bg-(--mirai-sem-primary)"
                : "w-2.5 bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
