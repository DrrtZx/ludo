"use client";

import type { CSSProperties } from "react";

interface TokenProps {
  id: string;
  color: string;
  label: string;
  selectable?: boolean;
  small?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function Token({
  id,
  color,
  label,
  selectable = false,
  small = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: TokenProps) {
  const style = { "--player-color": color } as CSSProperties;

  return (
    <button
      aria-label={label}
      aria-pressed={selectable}
      className={`token-button${selectable ? " is-selectable" : " token-locked"}${small ? " token-small" : ""}`}
      disabled={!selectable}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={style}
      title={label}
      type="button"
      data-token-id={id}
    >
      <span className="token-shine" />
    </button>
  );
}
