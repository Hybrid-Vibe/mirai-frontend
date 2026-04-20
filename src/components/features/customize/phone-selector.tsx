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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {phoneModels.map((model) => (
        <motion.div
          key={model.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPhoneModel(model.name)}
          className={`relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col gap-4 group ${
            phoneModel === model.name
              ? "bg-[rgba(0,102,255,0.1)] border-[#0066FF] glow-blue"
              : "bg-[#0A0F1E] border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,102,255,0.3)]"
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            phoneModel === model.name ? "bg-[#0066FF] text-white" : "bg-[#0D1830] text-[#6B85B0] group-hover:text-[#00D4FF]"
          }`}>
            <Smartphone className="w-6 h-6" />
          </div>
          
          <div>
            <div className="text-xs text-[#6B85B0] mb-1">{model.brand}</div>
            <div className="font-heading font-bold text-white group-hover:text-[#00D4FF] transition-colors">
              {model.name}
            </div>
          </div>

          {phoneModel === model.name && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 w-6 h-6 bg-[#00D4FF] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.5)]"
            >
              <Check className="w-4 h-4 text-[#050814] stroke-[3px]" />
            </motion.div>
          )}
        </motion.div>
      ))}

      <div className="md:col-span-2 lg:col-span-4 flex justify-end mt-8">
        <Button
          size="lg"
          disabled={!phoneModel}
          onClick={onNext}
          className="bg-[#0066FF] hover:bg-[#3385FF] text-white font-bold px-12 py-6 rounded-2xl shadow-[0_8px_30px_rgba(0,102,255,0.4)] disabled:opacity-50 disabled:shadow-none transition-all duration-300"
        >
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}
