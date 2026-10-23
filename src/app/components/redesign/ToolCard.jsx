import React from "react";

// Gallery card for a CMS-managed tool: cover image (or the name, until a cover is uploaded),
// with the same hover chrome as EffectCard. The whole card opens the tool's first link.
const ToolCard = ({ name, cover, links = [] }) => {
  const href = links[0]?.url;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
      className="group relative block aspect-[4/3] rounded-lg overflow-hidden bg-white text-black"
    >
      {cover ? (
        <img
          src={cover}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center p-6 text-center font-inter-tight text-2xl font-medium">
          {name}
        </span>
      )}
      <span className="absolute left-2 bottom-2 h-[22px] px-[9px] flex items-center rounded-[18px] bg-black text-white text-xs leading-3 font-medium tracking-[-0.01em] whitespace-nowrap translate-y-[calc(100%+8px)] transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0">
        {name}
      </span>
      <span
        aria-hidden="true"
        className="absolute right-2 top-2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center -translate-y-[calc(100%+8px)] transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0"
      >
        <svg width="12.33" height="12.33" viewBox="0 0 12.33 12.33" fill="currentColor">
          <path d="M12.33017 8.08753l-0.02209 0.99437-1.98874 0c0-0.04419 0-1.94454 0-5.65685l-8.90513 8.90512-1.41421-1.41421 8.90513-8.90513c-3.71231 0-5.61266 0-5.65686 0l0-1.98873 0.99437-0.0221 8.08753 0 0 8.08753z" />
        </svg>
      </span>
    </a>
  );
};

export default ToolCard;
