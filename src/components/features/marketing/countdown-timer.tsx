"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  initialDays?: number;
  initialHours?: number;
  initialMinutes?: number;
  initialSeconds?: number;
  labels?: string[];
  format?: "block" | "inline";
  targetDate?: string | Date;
}

export function CountdownTimer({
  initialDays = 3,
  initialHours = 23,
  initialMinutes = 19,
  initialSeconds = 56,
  labels = ["Ngày", "Giờ", "Phút", "Giây"],
  format = "block",
  targetDate,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: initialDays,
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let totalSeconds =
      initialDays * 86400 +
      initialHours * 3600 +
      initialMinutes * 60 +
      initialSeconds;

    const isValidDate = targetDate && !isNaN(new Date(targetDate).getTime());

    if (isValidDate && targetDate) {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);
      totalSeconds = Math.floor(diff / 1000);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft({
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    }

    const timerId = setTimeout(() => setMounted(true), 0);

    const timer = setInterval(() => {
      if (isValidDate && targetDate) {
        const target = new Date(targetDate).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, target - now);
        const secs = Math.floor(diff / 1000);

        if (secs <= 0) {
          clearInterval(timer);
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          return;
        }

        setTimeLeft({
          days: Math.floor(secs / 86400),
          hours: Math.floor((secs % 86400) / 3600),
          minutes: Math.floor((secs % 3600) / 60),
          seconds: secs % 60,
        });
      } else {
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
      }
    }, 1000);

    return () => {
      clearTimeout(timerId);
      clearInterval(timer);
    };
  }, [initialDays, initialHours, initialMinutes, initialSeconds, targetDate]);

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
