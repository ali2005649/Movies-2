import { useEffect, useId, useRef, useState } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa";

/**
 * Custom glass dropdown. Menu is always `top-full mt-2` (opens downward).
 */
export default function GlassSelect({
  value,
  options,
  onChange,
  "aria-label": ariaLabel,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const listId = useId();
  const selected = options.find((opt) => opt.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectAt = (index) => {
    const opt = options[index];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (activeIndex >= 0) selectAt(activeIndex);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() =>
          setOpen((prev) => {
            const next = !prev;
            if (next) {
              setActiveIndex(
                Math.max(0, options.findIndex((o) => o.value === value))
              );
            }
            return next;
          })
        }
        onKeyDown={handleKeyDown}
        className={[
          "glass-input appearance-none inline-flex w-full min-w-[10.5rem] items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-text-main",
          open ? "border-primary/60" : "hover:border-primary/40",
        ].join(" ")}
      >
        <span className="truncate">{selected?.label}</span>
        <FaChevronDown
          className={`shrink-0 text-[10px] text-primary transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="sleek-scroll absolute left-0 top-full z-50 mt-2 max-h-64 min-w-full overflow-y-auto rounded-xl border border-white/10 bg-[#09090B]/90 py-1 text-text-main shadow-2xl shadow-black/50 backdrop-blur-xl"
        >
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            const isActive = index === activeIndex;
            return (
              <li key={opt.value || "any"} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectAt(index)}
                  className={[
                    "flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-sm transition-colors duration-150",
                    isActive || isSelected
                      ? "bg-primary/20 text-text-main"
                      : "text-text-main/90 hover:bg-primary/20 hover:text-text-main",
                    isSelected ? "text-primary" : "",
                  ].join(" ")}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected ? (
                    <FaCheck className="shrink-0 text-[10px] text-primary" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
