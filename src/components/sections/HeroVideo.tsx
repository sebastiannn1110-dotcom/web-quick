"use client";

import { useEffect, useRef } from "react";

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
  };
};

export function HeroVideo({ label }: { label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const saveData = (navigator as NavigatorWithConnection).connection
      ?.saveData;

    if (reducedMotion || saveData) {
      return;
    }

    const playVideo = () => {
      void video.play().catch(() => {
        // Autoplay can still be blocked by the browser; the poster remains visible.
      });
    };

    const resumeWhenVisible = () => {
      if (!document.hidden) {
        playVideo();
      }
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      playVideo();
    } else {
      video.addEventListener("canplay", playVideo, { once: true });
    }

    document.addEventListener("visibilitychange", resumeWhenVisible);

    return () => {
      video.removeEventListener("canplay", playVideo);
      document.removeEventListener("visibilitychange", resumeWhenVisible);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="h-full w-full object-cover object-center"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/videos/quicksol-home-hero-poster.webp"
      aria-label={label}
    >
      <source
        src="/videos/quicksol-home-hero-mobile.mp4"
        media="(max-width: 767px)"
        type="video/mp4"
      />
      <source src="/videos/quicksol-home-hero.mp4" type="video/mp4" />
    </video>
  );
}
