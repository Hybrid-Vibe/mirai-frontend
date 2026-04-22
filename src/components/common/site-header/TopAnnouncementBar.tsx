"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function TopAnnouncementBar() {
  const [lang, setLang] = useState("Vietnamese");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="h-12 bg-(--mirai-sem-accent) text-(--mirai-sem-background)">
      <div className="page-shell relative flex h-full items-center justify-center">
        {/* Center content */}
        <div className="flex items-center gap-2">
          <p className="font-body text-[15px] font-normal leading-[21px] hidden sm:block">
            Chào mừng bạn đã ghé thăm website chính thức của MIRAI !!
          </p>
          <p className="font-body text-[13px] font-normal sm:hidden">
            Chào mừng đến MIRAI!
          </p>
          <Link
            href="/shop"
            className="font-body text-[15px] font-semibold leading-[24px] underline"
          >
            ShopNow
          </Link>
        </div>

        {/* Right content - Language Selector */}
        <div className="absolute right-4 hidden md:flex lg:right-0">
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-[5px] cursor-pointer outline-none"
              aria-label="Select language"
            >
              <span className="font-body text-[14px] font-normal leading-[21px]">
                {lang}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-32 rounded-[4px] bg-(--mirai-sem-surface) text-(--mirai-sem-text) shadow-(--mirai-shadow-md) border border-(--mirai-sem-border)">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setLang("Vietnamese");
                      setIsOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-xs hover:bg-(--mirai-sem-surface-muted) transition-colors"
                  >
                    Vietnamese
                  </button>
                  <button
                    onClick={() => {
                      setLang("English");
                      setIsOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-xs hover:bg-(--mirai-sem-surface-muted) transition-colors"
                  >
                    English
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
