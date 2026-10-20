import React from "react";

// 3x3 pixel motif from the redesign (sidebar top-right corner). 1 = filled, 0 = empty.
const PATTERN = [1, 0, 1, 0, 1, 1, 0, 0, 1];

const PixelMark = ({ size = 25, className = "" }) => (
  <div
    aria-hidden="true"
    className={`grid grid-cols-3 pointer-events-none ${className}`}
    style={{ width: size * 3, height: size * 3 }}
  >
    {PATTERN.map((on, i) => (
      <span key={i} className={on ? "bg-black" : ""} />
    ))}
  </div>
);

export default PixelMark;
