import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import he from "he";
import { API_ENDPOINTS } from "../../constants";

function EyeIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.9"
      />
    </svg>
  );
}

function LevelChip({ level }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] leading-none"
      style={{
        color: "white",
        borderColor: "rgba(255,255,255,0.25)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.05))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
      }}
    >
      {level || "ปี 3"}
    </span>
  );
}

function PlaceholderPoster({ category, sectionColor, accentColor, icon = null }) {
  // Compact poster-style placeholder (keeps card size consistent)
  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{
        background:
          category === "academic"
            ? `linear-gradient(135deg, ${sectionColor}, ${accentColor})`
            : `linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,
      }}
    >
      {category === "academic" ? (
        <>
          <div className="absolute inset-0 opacity-15 text-white">
            <div className="absolute top-4 left-4 w-8 h-1 bg-white/80 rounded" />
            <div className="absolute top-7 left-4 w-12 h-1 bg-white/70 rounded" />
            <div className="absolute top-10 left-4 w-10 h-1 bg-white/60 rounded" />
            <div className="absolute top-16 left-4 w-16 h-1 bg-white/70 rounded" />
            <div className="absolute top-20 left-4 w-8 h-1 bg-white/60 rounded" />
            <div className="absolute top-24 left-4 w-14 h-1 bg-white/70 rounded" />
            <div className="absolute top-28 left-4 w-12 h-1 bg-white/60 rounded" />
          </div>
          <div className="relative z-10 flex h-full flex-col items-center justify-center p-3 text-center text-white">
            <div className="mb-1 text-lg">{icon}</div>
            <div className="text-[10px] uppercase tracking-widest opacity-80">
              งานวิชาการ
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className="relative flex h-12 items-center justify-center text-white text-xs font-semibold"
            style={{
              background: `linear-gradient(135deg, ${sectionColor}, ${accentColor})`,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{icon}</span>
              <span className="text-[11px]">
                {category === "coursework" ? "งานในรายวิชา" : "การแข่งขัน"}
              </span>
            </div>
            <div className="absolute right-0 top-0 h-0 w-0 border-l-8 border-b-8 border-l-transparent border-b-white/30 opacity-30" />
          </div>
          <div className="flex-1 bg-gradient-to-b from-white/5 to-transparent" />
          <div
            className="h-4"
            style={{
              background: `linear-gradient(45deg, ${sectionColor}22, ${accentColor}22)`,
            }}
          />
        </>
      )}
    </div>
  );
}

function ProjectCard({ item, sectionColor, accentColor, onClick }) {
  const imgSrc = item?.image ? `${API_ENDPOINTS.BASE}/${item.image}` : null;
  const title = he.decode(item?.title || "");
  const description = item?.description ? he.decode(item.description) : "";
  const year =
    item?.year || (item?.createdAt ? new Date(item.createdAt).getFullYear() : "");
  const level = item?.level;
  const categoryLabel = (item?.category || "project").toLowerCase();
 
  // Horizontal modern card for ALL items (poster-scale image on the left)
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block h-full w-[18rem] sm:w-[20rem] md:w-[22rem] cursor-pointer select-none rounded-2xl border border-white/10 bg-white/10 p-3 text-left text-white/90 shadow-sm backdrop-blur-md transition-colors duration-200 hover:bg-white/15 active:opacity-95 transform-gpu will-change-transform [transform:translateZ(0)] [contain:paint]"
      style={{
        boxShadow:
          '0 8px 20px rgba(144,39,142,0.14), inset 0 1px 0 rgba(255,255,255,0.12)',
      }}
      aria-label={title}
    >
      <div className="flex items-stretch gap-3">
        {/* Poster image (portrait 2:3) */}
        <div className="relative w-20 sm:w-24 md:w-28 shrink-0">
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover transform-gpu will-change-transform [transform:translateZ(0)]"
                loading="lazy"
              />
            ) : (
              <PlaceholderPoster
                category={item?.category || 'coursework'}
                sectionColor={sectionColor}
                accentColor={accentColor}
              />
            )}
 
            {/* Category chip on image */}
            <div className="absolute left-1.5 top-1.5">
              <span className="rounded-full bg-black/35 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-white/90 ring-1 ring-white/20">
                {categoryLabel}
              </span>
            </div>
 
            {/* Views on image */}
            {typeof item?.viewsCount !== 'undefined' && (
              <div className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-white/85 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 shadow-sm backdrop-blur">
                <EyeIcon />
                <span>{item.viewsCount}</span>
              </div>
            )}
          </div>
        </div>
 
        {/* Text content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <div className="mb-1 line-clamp-2 text-sm font-semibold text-white">
              {title}
            </div>
            {description ? (
              <div className="mb-2 line-clamp-2 text-[12px] text-white/80">
                {description}
              </div>
            ) : null}
          </div>
 
          {/* Footer meta */}
          <div className="mt-1 flex items-center justify-between text-[12px] text-white/80">
            <span className="truncate">
              {(categoryLabel === 'competition' ? 'การแข่งขัน' : 'งานในชั้นเรียน')}
            </span>
            <div className="flex items-center gap-2">
              <span>{year}</span>
              <LevelChip level={level} />
            </div>
          </div>
        </div>
      </div>
 
      {/* Decorative glow */}
      <div
        className="pointer-events-none absolute -bottom-3 -right-3 h-10 w-10 rounded-full opacity-25 blur-md transition-opacity duration-300 group-hover:opacity-40"
        style={{
          background: `linear-gradient(45deg, ${sectionColor}, ${accentColor})`,
        }}
      />
    </button>
  );
}

export default function MarqueeProjects({
  projects = [],
  sectionColor = "#90278E",
  accentColor = "#B252B0",
  className = "",
}) {
  const navigate = useNavigate();

  const items = useMemo(() => {
    // Filter out academic and de-duplicate by id if present
    const filtered = (projects || []).filter(
      (p) => (p?.category || "").toLowerCase() !== "academic"
    );
    const map = new Map();
    for (const p of filtered) {
      const key = p?.id ?? `${p?.category || "x"}-${p?.title || ""}`;
      if (!map.has(key)) map.set(key, p);
    }
    return Array.from(map.values());
  }, [projects]);

  const handleProjectClick = (projectLink) => {
    if (!projectLink) return;
    try {
      let correctedPath = projectLink;
      if (projectLink.includes("sitspu.com")) {
        const url = new URL(projectLink);
        correctedPath = url.pathname;
      }
      navigate(correctedPath);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Navigation error:", error);
    }
  };

  const hasItems = items && items.length > 0;

  const duplicated = useMemo(
    () => (hasItems ? [...items, ...items] : []),
    [items, hasItems]
  );

  if (!hasItems) {
    // Spec: hide marquee when no projects
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Edge fade overlays for nicer aesthetics */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#0a0014] to-transparent md:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#0a0014] to-transparent md:w-16" />

      <div
        className="relative mx-auto max-w-[100vw] overflow-x-hidden motion-reduce:overflow-x-auto py-4 [contain:paint]"
        
        
      >
        <div
          className="flex w-max animate-marquee motion-reduce:animate-none [--duration:40s] md:[--duration:30s] hover:[animation-play-state:paused] will-change-transform [transform:translateZ(0)]"
          role="list"
        >
          {duplicated.map((item, index) => (
            <div key={`${item?.id || index}-${index}`} className="h-full px-2.5">
              <ProjectCard
                item={item}
                sectionColor={sectionColor}
                accentColor={accentColor}
                onClick={() => handleProjectClick(item?.projectLink)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}