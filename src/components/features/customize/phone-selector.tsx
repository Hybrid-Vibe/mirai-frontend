"use client";

import { motion } from "framer-motion";
import { useDesignStore } from "@/lib/store";
import { Smartphone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const phoneModels = [
  { id: "iphone-15-pm", name: "iPhone 15 Pro Max", brand: "Apple" },
  { id: "iphone-15-pro", name: "iPhone 15 Pro", brand: "Apple" },
  { id: "iphone-15", name: "iPhone 15", brand: "Apple" },
  { id: "s-24-ultra", name: "Samsung Galaxy S24 Ultra", brand: "Samsung" },
  { id: "s-24-plus", name: "Samsung Galaxy S24+", brand: "Samsung" },
  { id: "xiaomi-14-pro", name: "Xiaomi 14 Pro", brand: "Xiaomi" },
  { id: "oppo-find-x7", name: "Oppo Find X7 Ultra", brand: "Oppo" },
  { id: "google-pixel-8", name: "Google Pixel 8 Pro", brand: "Google" },
];

export function PhoneSelector({ onNext }: { onNext: () => void }) {
  const { phoneModel, setPhoneModel } = useDesignStore();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {phoneModels.map((model) => (
        <motion.div
          key={model.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPhoneModel(model.name)}
          className={`group relative flex cursor-pointer flex-col gap-4 rounded-2xl border p-6 transition-all duration-300 ${
            phoneModel === model.name
              ? "border-accent bg-accent/10 glow-blue"
              : "border-border bg-card hover:border-accent/40"
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
              phoneModel === model.name
                ? "bg-accent text-background"
                : "bg-secondary text-muted-foreground group-hover:text-primary"
            }`}
          >
            <Smartphone className="w-6 h-6" />
          </div>

          <div>
            <div className="mb-1 text-xs text-muted-foreground">{model.brand}</div>
            <div className="font-heading font-bold text-foreground transition-colors group-hover:text-primary">
              {model.name}
            </div>
          </div>

          {phoneModel === model.name && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-md"
            >
              <Check className="h-4 w-4 stroke-[3px] text-foreground" />
            </motion.div>
          )}
        </motion.div>
      ))}

      <div className="mt-8 flex justify-end md:col-span-2 lg:col-span-4">
        <Button
          size="lg"
          disabled={!phoneModel}
          onClick={onNext}
          className="rounded-2xl bg-accent px-12 py-6 font-bold text-background shadow-md transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:shadow-none"
        >
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}
