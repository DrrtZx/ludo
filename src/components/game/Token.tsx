"use client";

import type { CSSProperties } from "react";

interface TokenProps {
  id: string;
  color: string;
  label: string;
  selectable?: boolean;
  small?: boolean;
  onClick?: () => void;
}

export default function Token({
  id,
  color,
  label,
  selectable = false,
  small = false,
  onClick,
}: TokenProps) {
  const style = { "--player-color": color } as CSSProperties;

  return (
    <button
      aria-label={label}
      aria-pressed={selectable}
      className={`token-button${selectable ? " is-selectable" : ""}${small ? " token-small" : ""}`}
      disabled={!selectable}
      onClick={onClick}
      style={style}
      title={label}
      type="button"
      data-token-id={id}
    >
      <span className="token-shine" />
    </button>
  );
}
