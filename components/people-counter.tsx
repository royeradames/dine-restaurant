"use client";

import { useState } from "react";
import { PEOPLE_MAX, PEOPLE_MIN } from "@/lib/booking";

type PeopleCounterProps = {
  value: number;
  onChange: (value: number) => void;
};

const partySize = (count: number) => (count === 1 ? "1 person" : `${count} people`);

const stepButtonClasses =
  "flex size-10 cursor-pointer items-center justify-center transition-opacity hover:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-30";

/** −/+ party size picker. Buttons stay focusable at the limits and explain why they do nothing. */
export function PeopleCounter({ value, onChange }: PeopleCounterProps) {
  const [limitNote, setLimitNote] = useState("");
  const atMin = value <= PEOPLE_MIN;
  const atMax = value >= PEOPLE_MAX;

  const step = (delta: -1 | 1) => {
    const blocked = delta < 0 ? atMin : atMax;
    if (blocked) {
      setLimitNote(`Bookings are for ${PEOPLE_MIN} to ${PEOPLE_MAX} people.`);
      return;
    }
    setLimitNote("");
    onChange(value + delta);
  };

  return (
    <div role="group" aria-labelledby="people-label" aria-describedby="people-note" className="relative">
      <span id="people-label" className="sr-only">
        Number of people
      </span>
      <div className="flex h-[46px] items-start justify-between border-b border-rule pr-4 pl-[14px]">
        <button
          type="button"
          aria-label="Remove one person"
          aria-disabled={atMin || undefined}
          onClick={() => step(-1)}
          className={`-mt-1.5 ${stepButtonClasses}`}
        >
          <img src="/images/icons/icon-minus.svg" alt="" width={7} height={3} />
        </button>
        <output aria-live="polite" className="mt-[3px] text-xl leading-6 font-bold tracking-[-0.015625rem] text-ink">
          {partySize(value)}
        </output>
        <button
          type="button"
          aria-label="Add one person"
          aria-disabled={atMax || undefined}
          onClick={() => step(1)}
          className={`-mt-1.5 ${stepButtonClasses}`}
        >
          <img src="/images/icons/icon-plus.svg" alt="" width={10} height={11} />
        </button>
      </div>
      <p id="people-note" aria-live="polite" className="absolute top-full mt-1 text-base leading-6 text-tab">
        {limitNote}
      </p>
    </div>
  );
}
