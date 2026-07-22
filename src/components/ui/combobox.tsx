"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  ariaLabel?: string;
  error?: boolean;
  disabled?: boolean;
  /**
   * Separator used to propose several songs in one field. Picking a
   * suggestion replaces only the segment currently being typed.
   */
  separator?: string;
  className?: string;
};

/**
 * A Select2-style "tags/free text" combobox: a text input that always
 * accepts custom text, with a searchable suggestion list underneath.
 * Typing filters the suggestions; picking one fills the current segment.
 */
export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  error = false,
  disabled = false,
  separator = " / ",
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const baseId = React.useId();
  const listId = `${baseId}-list`;

  // The text after the last separator — what the user is currently typing.
  const currentSegment = value.split(separator).pop()?.trim().toLowerCase() ?? "";

  const filtered = React.useMemo(() => {
    const chosen = new Set(
      value
        .split(separator)
        .slice(0, -1)
        .map((s) => s.trim().toLowerCase()),
    );
    const matches = options.filter((o) => {
      const lo = o.toLowerCase();
      if (chosen.has(lo)) return false;
      return currentSegment ? lo.includes(currentSegment) : true;
    });
    return matches.slice(0, 60);
  }, [options, value, currentSegment, separator]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  React.useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-index="${active}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const showPanel = open && filtered.length > 0;

  const pick = (option: string) => {
    const parts = value.split(separator);
    parts[parts.length - 1] = option;
    onChange(parts.join(separator));
    setOpen(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!showPanel) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => Math.min(a + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[active]) pick(filtered[active]);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={cn(
          "w-full rounded-md border bg-background px-3 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 disabled:opacity-60",
          error
            ? "border-red-600 focus:border-red-600 focus:ring-red-600/20"
            : "border-border focus:border-primary focus:ring-primary/20",
        )}
      />

      {showPanel && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-background py-1 shadow-lg"
        >
          {filtered.map((opt, i) => (
            <li
              key={opt}
              data-index={i}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(opt);
              }}
              className={cn(
                "cursor-pointer truncate px-3 py-2 text-sm text-foreground",
                i === active && "bg-muted",
              )}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
