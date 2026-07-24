"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FAQItem } from "@/types";

interface AccordionProps {
  items: FAQItem[];
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;

        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-sm border border-border bg-card transition-colors duration-300 hover:border-muted/50"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-300"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
            >
              <span className="text-base font-medium text-foreground sm:text-lg">
                {item.question}
              </span>
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-sm border border-border text-muted transition-all duration-300",
                  isOpen && "rotate-45 border-primary text-primary"
                )}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-muted sm:text-base">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
