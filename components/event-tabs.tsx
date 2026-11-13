"use client";

import { useRef, useState } from "react";
import { ArtPicture, photo } from "./art-picture";
import { ButtonLink } from "./button-link";
import { PatternLines } from "./patterns";

const events = [
  {
    id: "family-gathering",
    tab: "Family Gathering",
    title: "Family Gathering",
    description:
      "We love catering for entire families. So please bring everyone along for a special meal with your loved ones. We’ll provide a memorable experience for all.",
    alt: "Family passing bread, salads and pasta around a farmhouse table",
  },
  {
    id: "special-events",
    tab: "Special Events",
    title: "Special Events",
    description:
      "Whether it’s a romantic dinner or special date you’re celebrating with others we’ll look after you. We’ll be sure to mark your special date with an unforgettable meal.",
    alt: "Guests raising glasses at a dinner under a marquee",
  },
  {
    id: "social-events",
    tab: "Social Events",
    title: "Social Events",
    description:
      "Are you looking to have a larger social event? No problem! We’re more than happy to cater for big parties. We’ll work with you to make your event a hit with everyone.",
    alt: "Wine glasses along a long dinner party table",
  },
] as const;

const eventSizes = { mobile: [326, 400], tablet: [573, 360], desktop: [540, 600] } as const satisfies Parameters<typeof photo>[1];

const nextIndexForKey: Record<string, (current: number, count: number) => number> = {
  ArrowRight: (current, count) => (current + 1) % count,
  ArrowDown: (current, count) => (current + 1) % count,
  ArrowLeft: (current, count) => (current - 1 + count) % count,
  ArrowUp: (current, count) => (current - 1 + count) % count,
  Home: () => 0,
  End: (_current, count) => count - 1,
};

/**
 * Accessible tabs for the three event types. The server renders the first event,
 * so the section still reads correctly before (or without) JavaScript.
 */
export function EventTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const move = nextIndexForKey[event.key];
    if (!move) return;
    event.preventDefault();
    const nextIndex = move(activeIndex, events.length);
    setActiveIndex(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <section
      aria-labelledby="events-title"
      className="relative px-6 pt-20 pb-[95px] md:px-10 md:pt-[120px] md:pb-[121px] lg:px-0 lg:pt-40 lg:pb-40"
    >
      <h2 id="events-title" className="sr-only">
        Events
      </h2>
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 hidden h-80 w-1/2 rounded-tr-[100px] bg-slate-mist/[0.077] md:block lg:w-[calc(50%-175px)]"
      />
      <div className="relative mx-auto max-w-[573px] md:max-w-[689px] lg:grid lg:max-w-[1110px] lg:grid-cols-[540px_570px] lg:grid-rows-[auto_1fr]">
        <div className="relative md:mx-auto md:max-w-[573px] lg:row-span-2 lg:mx-0 lg:max-w-none">
          {events.map((item, index) => (
            <ArtPicture
              key={item.id}
              sources={photo(item.id, eventSizes)}
              alt={item.alt}
              className={`${index === activeIndex ? "block" : "hidden"} relative z-10 aspect-[326/400] shadow-photo md:aspect-[573/360] lg:aspect-auto lg:h-[600px] lg:w-[540px]`}
            />
          ))}
          <PatternLines className="top-[-38px] left-[-58px] z-20 hidden md:block lg:left-[-40px]" />
        </div>

        <div
          role="tablist"
          aria-label="Event types"
          className="mt-[49px] flex flex-col items-center gap-6 md:mt-[57px] md:flex-row md:items-start md:gap-[10px] lg:col-start-2 lg:row-start-2 lg:mx-0 lg:mt-20 lg:flex-col lg:items-start lg:gap-6"
        >
          {events.map((item, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={item.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`${item.id}-tab`}
                aria-selected={selected}
                aria-controls={`${item.id}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                onKeyDown={onTabKeyDown}
                className={`text-button flex cursor-pointer flex-col items-center gap-[10px] transition-colors md:w-[223px] md:gap-5 lg:w-auto lg:flex-row lg:gap-8 ${
                  selected ? "text-tab" : "text-tab-muted hover:text-tab"
                }`}
              >
                <span>{item.tab}</span>
                <span
                  aria-hidden="true"
                  className={`h-px w-12 lg:order-first lg:block lg:w-[95px] ${selected ? "block bg-beige" : "hidden bg-transparent"}`}
                />
              </button>
            );
          })}
        </div>

        {events.map((item, index) => (
          <div
            key={item.id}
            role="tabpanel"
            id={`${item.id}-panel`}
            aria-labelledby={`${item.id}-tab`}
            hidden={index !== activeIndex}
            className="mx-auto mt-10 max-w-[457px] text-center md:mt-12 lg:col-start-2 lg:row-start-1 lg:mx-0 lg:mt-[73px] lg:ml-[125px] lg:w-[445px] lg:max-w-none lg:text-left"
          >
            <h3 className="text-section-title">{item.title}</h3>
            <p className="text-body mt-3 md:mt-5">{item.description}</p>
            <ButtonLink href="/booking" tone="dark" className="mt-[30px] md:mt-14">
              Book a table
            </ButtonLink>
          </div>
        ))}
      </div>
    </section>
  );
}
