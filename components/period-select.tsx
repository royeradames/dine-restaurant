"use client";

import { useId, useRef, useState } from "react";
import type { Period } from "@/lib/booking";

const periods: readonly Period[] = ["AM", "PM"];

type PeriodSelectProps = {
  value: Period;
  onChange: (value: Period) => void;
  labelledBy: string;
  invalid?: boolean;
  describedBy?: string;
};

/**
 * AM/PM picker drawn as designed: an underlined value with a chevron that opens a
 * small white list. Follows the WAI-ARIA select-only combobox pattern.
 */
export function PeriodSelect({ value, onChange, labelledBy, invalid = false, describedBy }: PeriodSelectProps) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(periods.indexOf(value));
  const buttonRef = useRef<HTMLButtonElement>(null);

  const show = () => {
    setActiveIndex(periods.indexOf(value));
    setOpen(true);
  };

  const choose = (index: number) => {
    onChange(periods[index]);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const typed = periods.findIndex((period) => period[0].toLowerCase() === event.key.toLowerCase());
    if (typed !== -1) {
      event.preventDefault();
      if (open) setActiveIndex(typed);
      else onChange(periods[typed]);
      return;
    }

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        show();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, periods.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(periods.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        choose(activeIndex);
        break;
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-labelledby={labelledBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${id}-${periods[activeIndex]}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        // Space is handled on keydown; stop the button's own keyup click from reopening the list.
        onKeyUp={(event) => {
          if (event.key === " ") event.preventDefault();
        }}
        onBlur={() => setOpen(false)}
        className={`text-field flex h-[43px] w-full cursor-pointer items-start gap-4 border-b pr-[15px] pb-[14px] pl-4 text-left text-ink caret-beige transition-[border-color,box-shadow] focus-visible:outline-none ${
          invalid
            ? "border-error focus:shadow-[inset_0_-1px_0_var(--color-error)]"
            : "border-rule focus:border-ink focus:shadow-[inset_0_-1px_0_var(--color-ink)]"
        }`}
      >
        <span className="w-[34px]">{value}</span>
        <img
          src="/images/icons/icon-arrow.svg"
          alt=""
          width={18}
          height={11}
          className={`mt-[9px] ${open ? "rotate-180" : ""}`}
        />
      </button>
      <ul
        id={listId}
        role="listbox"
        aria-labelledby={labelledBy}
        hidden={!open}
        className="absolute top-[51px] left-0 z-30 w-[106px] bg-white pt-[10px] pb-[5px] shadow-menu"
      >
        {periods.map((period, index) => {
          const selected = period === value;
          return (
            <li
              key={period}
              id={`${id}-${period}`}
              role="option"
              aria-selected={selected}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => {
                choose(index);
                buttonRef.current?.focus();
              }}
              className={`text-field flex h-11 cursor-pointer items-center gap-[13px] px-4 text-ink ${
                index === activeIndex ? "bg-slate-mist/10" : ""
              }`}
            >
              <img
                src="/images/icons/icon-check.svg"
                alt=""
                width={13}
                height={11}
                className={selected ? "opacity-100" : "opacity-0"}
              />
              {period}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
