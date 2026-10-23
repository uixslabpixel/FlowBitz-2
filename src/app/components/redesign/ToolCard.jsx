import React from "react";
import { Link } from "react-router-dom";

// Gallery card for a CMS-managed tool: cover image (or the name, until a cover is uploaded),
// with the same hover chrome as EffectCard. An optional `hover` image slides up over the cover,
// pushing it out, and settles from 105% to 100% as it lands. The whole card opens the tool's first link,
// or an internal route when `to` is set (template detail pages).

// Shared by the cover and hover images so both legs of the push move as one.
// The 102.5% start offset covers the 2.5% a 105% scale adds above the image's top edge.
const SLIDE = "transition-transform duration-500 [transition-timing-function:cubic-bezier(.7,0,.2,1)]";

const PILL =
  "h-[22px] px-[9px] flex items-center rounded-[18px] translate-y-[calc(100%+8px)] transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0";

const ToolCard = ({ name, cover, hover, price, links = [], to }) => {
  const linkProps = to
    ? { as: Link, to }
    : { as: "a", href: links[0]?.url, target: "_blank", rel: "noopener noreferrer" };
  const { as: Tag, ...rest } = linkProps;

  return (
    <Tag
      {...rest}
      aria-label={name}
      className="group relative block aspect-[4/3] rounded-lg overflow-hidden bg-white text-black"
    >
      {cover ? (
        <img
          src={cover}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none${hover ? ` ${SLIDE} group-hover:-translate-y-[30%] group-focus-visible:-translate-y-[30%]` : ""}`}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center p-6 text-center font-inter-tight text-2xl font-medium">
          {name}
        </span>
      )}
      {cover && hover && (
        <img
          src={hover}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${SLIDE} translate-y-[102.5%] scale-[1.05] group-hover:translate-y-0 group-hover:scale-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100`}
        />
      )}
      {/* Pills rise one after another on hover, and drop together on leave. */}
      <span className="absolute left-2 bottom-2 flex gap-1 text-xs leading-3 font-medium tracking-[-0.01em] whitespace-nowrap">
        <span className={`${PILL} bg-black text-white`}>{name}</span>
        {price && (
          <span className={`${PILL} bg-white text-black group-hover:[transition-delay:60ms] group-focus-visible:[transition-delay:60ms]`}>{price}</span>
        )}
      </span>
      <span
        aria-hidden="true"
        className="absolute right-2 top-2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center -translate-y-[calc(100%+8px)] transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0"
      >
        <svg width="12.33" height="12.33" viewBox="0 0 12.33 12.33" fill="currentColor">
          <path d="M12.33017 8.08753l-0.02209 0.99437-1.98874 0c0-0.04419 0-1.94454 0-5.65685l-8.90513 8.90512-1.41421-1.41421 8.90513-8.90513c-3.71231 0-5.61266 0-5.65686 0l0-1.98873 0.99437-0.0221 8.08753 0 0 8.08753z" />
        </svg>
      </span>
    </Tag>
  );
};

export default ToolCard;
