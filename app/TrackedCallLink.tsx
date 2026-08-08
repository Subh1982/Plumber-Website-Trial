"use client";

import type { ReactNode } from "react";
import { sendGAEvent } from "@next/third-parties/google";

type TrackedCallLinkProps = {
  children: ReactNode;
  location: "top_bar" | "hero" | "photo_assistant";
  className?: string;
};

export function TrackedCallLink({ children, location, className }: TrackedCallLinkProps) {
  return (
    <a
      className={className}
      href="tel:+61492205682"
      onClick={() =>
        sendGAEvent("event", "call_click", {
          link_text: "Call 0492205682",
          link_url: "tel:+61492205682",
          link_location: location,
        })
      }
    >
      {children}
    </a>
  );
}
