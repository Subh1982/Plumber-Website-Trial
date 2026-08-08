"use client";

import { sendGAEvent } from "@next/third-parties/google";

export function ExploreServicesLink() {
  return (
    <a
      className="text-link"
      href="#services"
      onClick={() =>
        sendGAEvent("event", "explore_services_click", {
          link_text: "Explore our services",
          link_url: "#services",
        })
      }
    >
      Explore our services ↓
    </a>
  );
}
