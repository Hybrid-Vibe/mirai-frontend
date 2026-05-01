"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  initialDays?: number;
  initialHours?: number;
  initialMinutes?: number;
  initialSeconds?: number;
  labels?: string[];
  format?: "block" | "inline";
}

export function CountdownTimer({
  initialDays = 3,
  initialHours = 23,
  initialMinutes = 19,
  initialSeconds = 56,
  labels = ["Ngày", "Giờ", "Phút", "Giây"],
  format = "block",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: initialDays,
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => setMounted(true), 0);

    // Calculate total seconds
    let totalSeconds =
      initialDays * 86400 +
      initialHours * 3600 +
      initialMinutes * 60 +
      initialSeconds;

    const timer = setInterval(() => {
      if (totalSeconds <= 0) {
        clearInterval(timer);
        return;
      }

      totalSeconds -= 1;

      setTimeLeft({
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    }, 1000);

    return () => {
      clearTimeout(timerId);
      clearInterval(timer);
    };
  }, [initialDays, initialHours, initialMinutes, initialSeconds]);

  // Prevent hydration mismatch
  if (!mounted) {
    if (format === "inline") {
      return (
        <div className="mt-8 flex gap-3">
          {[
            `${initialDays.toString().padStart(2, "0")} ngày`,
            `${initialHours.toString().padStart(2, "0")} giờ`,
            `${initialMinutes.toString().padStart(2, "0")} phút`,
            `${initialSeconds.toString().padStart(2, "0")} giây`,
          ].map((value) => (
            <span
              key={value}
              className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-(--mirai-sem-surface) text-[10px] font-semibold text-(--mirai-sem-text)"
            >
              {value}
            </span>
          ))}
        </div>
      );
    }

    return (
      <div className="mb-8 flex flex-wrap items-end gap-6">
        {[
          initialDays.toString().padStart(2, "0"),
          initialHours.toString().padStart(2, "0"),
          initialMinutes.toString().padStart(2, "0"),
          initialSeconds.toString().padStart(2, "0"),
        ].map((value, i) => (
          <div key={labels[i]} className="text-center">
            <p className="text-xs text-muted-foreground">{labels[i]}</p>
            <p className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
              {value}
            </p>
          </div>
        ))}
      </div>
    );
  }

  const values = [
    timeLeft.days.toString().padStart(2, "0"),
    timeLeft.hours.toString().padStart(2, "0"),
    timeLeft.minutes.toString().padStart(2, "0"),
    timeLeft.seconds.toString().padStart(2, "0"),
  ];

  if (format === "inline") {
    return (
      <div className="mt-8 flex gap-3">
        {[
          `${values[0]} ngày`,
          `${values[1]} giờ`,
          `${values[2]} phút`,
          `${values[3]} giây`,
        ].map((value) => (
          <span
            key={value}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-(--mirai-sem-surface) text-[10px] font-semibold text-(--mirai-sem-text)"
          >
            {value}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 flex flex-wrap items-end gap-6">
      {values.map((value, i) => (
        <div key={labels[i]} className="text-center">
          <p className="text-xs text-muted-foreground">{labels[i]}</p>
          <p className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
