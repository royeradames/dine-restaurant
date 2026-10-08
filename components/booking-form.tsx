"use client";

import { revalidateLogic, useForm, useStore } from "@tanstack/react-form";
import { useEffect, useRef, useState } from "react";
import {
  type BookingErrors,
  type BookingFieldName,
  type BookingValues,
  describeBooking,
  emptyBooking,
  firstInvalidField,
  validateBooking,
} from "@/lib/booking";
import { buttonBaseClasses } from "./button-link";
import { PeopleCounter } from "./people-counter";
import { PeriodSelect } from "./period-select";

const submitClasses = `${buttonBaseClasses} w-full cursor-pointer border-ink bg-ink text-white hover:bg-white hover:text-ink focus-visible:bg-white focus-visible:text-ink`;

const underlineClasses = (invalid: boolean) =>
  `block w-full border-b bg-transparent text-ink caret-beige transition-[border-color,box-shadow] focus-visible:outline-none ${
    invalid
      ? "border-error placeholder:text-error"
      : "border-rule focus:border-ink focus:shadow-[inset_0_-1px_0_var(--color-ink)]"
  }`;

const textInputClasses = (invalid: boolean) =>
  `text-field h-[43px] px-4 pb-3 leading-[1.875rem] ${underlineClasses(invalid)}`;

const partInputClasses = (invalid: boolean) => `text-field h-[43px] pb-[14px] pl-4 ${underlineClasses(invalid)}`;

const errorClasses = "text-xs leading-3 font-medium tracking-[-0.0125rem] text-error";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const firstError = (errors: readonly unknown[] | undefined) => errors?.find((error) => typeof error === "string");

export function BookingForm() {
  const [confirmed, setConfirmed] = useState<BookingValues | null>(null);
  const inputs = useRef<Partial<Record<BookingFieldName, HTMLInputElement | null>>>({});
  const confirmationHeading = useRef<HTMLHeadingElement>(null);

  const form = useForm({
    defaultValues: emptyBooking,
    validationLogic: revalidateLogic({ mode: "submit", modeAfterSubmission: "change" }),
    validators: {
      onDynamic: ({ value }) => {
        const errors = validateBooking(value);
        return Object.keys(errors).length > 0 ? { fields: errors } : undefined;
      },
    },
    onSubmit: ({ value }) => setConfirmed(value),
    onSubmitInvalid: ({ value }) => {
      const field = firstInvalidField(validateBooking(value));
      if (field) inputs.current[field]?.focus();
    },
  });

  const fieldMeta = useStore(form.store, (state) => state.fieldMeta);
  const errorFor = (field: BookingFieldName) => firstError(fieldMeta[field]?.errors);
  const errors: BookingErrors = {
    name: errorFor("name"),
    email: errorFor("email"),
    month: errorFor("month"),
    day: errorFor("day"),
    year: errorFor("year"),
    hour: errorFor("hour"),
    minute: errorFor("minute"),
  };
  const dateError = errors.month ?? errors.day ?? errors.year;
  const timeError = errors.hour ?? errors.minute;

  useEffect(() => {
    if (confirmed) confirmationHeading.current?.focus();
  }, [confirmed]);

  const startOver = () => {
    form.reset();
    setConfirmed(null);
    requestAnimationFrame(() => inputs.current.name?.focus());
  };

  if (confirmed) {
    const { day, time, party } = describeBooking(confirmed);
    return (
      <div className="flex min-h-[449px] flex-col" role="region" aria-labelledby="confirmation-title">
        <h3
          id="confirmation-title"
          ref={confirmationHeading}
          tabIndex={-1}
          className="text-[2rem] leading-10 font-bold tracking-[-0.025rem] text-slate-ink focus-visible:outline-none"
        >
          Demo booking checked
        </h3>
        <p className="text-body mt-4 text-slate-ink">
          Thanks, {confirmed.name.trim()}. Your request for {party} on {day} at {time} passed every check.
        </p>
        <p className="text-body mt-4 font-semibold text-slate-ink">
          This is a practice site: nothing was sent and no table is reserved.
        </p>
        <button type="button" onClick={startOver} className={`${submitClasses} mt-auto`}>
          New booking
        </button>
      </div>
    );
  }

  const bindInput = (field: BookingFieldName) => (element: HTMLInputElement | null) => {
    inputs.current[field] = element;
  };

  return (
    <form
      noValidate
      method="post"
      aria-label="Reserve a table"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      className="flex flex-col"
    >
      <p data-no-js className="mb-6 text-base leading-6 text-error">
        Booking needs JavaScript to check your details. This demo never sends them anywhere.
      </p>

      <form.Field name="name">
        {(field) => (
          <div className="relative">
            <label htmlFor="booking-name" className="sr-only">
              Name
            </label>
            <input
              id="booking-name"
              ref={bindInput("name")}
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Name"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={Boolean(errors.name) || undefined}
              aria-describedby={errors.name ? "booking-name-error" : undefined}
              className={textInputClasses(Boolean(errors.name))}
            />
            {errors.name && (
              <p id="booking-name-error" className={`absolute top-full left-4 mt-3 ${errorClasses}`}>
                {errors.name}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <div className="relative mt-8 md:mt-[33px]">
            <label htmlFor="booking-email" className="sr-only">
              Email
            </label>
            <input
              id="booking-email"
              ref={bindInput("email")}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={Boolean(errors.email) || undefined}
              aria-describedby={errors.email ? "booking-email-error" : undefined}
              className={textInputClasses(Boolean(errors.email))}
            />
            {errors.email && (
              <p id="booking-email-error" className={`absolute top-full left-4 mt-3 ${errorClasses}`}>
                {errors.email}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <div
        role="group"
        aria-labelledby="date-label"
        className="relative mt-8 md:mt-[34px] md:grid md:grid-cols-[139px_80px_80px_97px] md:gap-x-4"
      >
        <div>
          <p id="date-label" className={`text-field leading-[1.875rem] ${dateError ? "text-error" : "text-ink"}`}>
            Pick a date
          </p>
          {dateError && (
            <p id="date-error" className={`absolute top-full left-0 mt-3 md:static md:mt-0 ${errorClasses}`}>
              {dateError}
            </p>
          )}
        </div>
        <div className="mt-2 flex gap-1 md:contents">
          {(
            [
              { name: "month", label: "Month", placeholder: "MM", maxLength: 2, width: "w-20" },
              { name: "day", label: "Day", placeholder: "DD", maxLength: 2, width: "w-20" },
              { name: "year", label: "Year", placeholder: "YYYY", maxLength: 4, width: "min-w-0 flex-1 md:w-auto" },
            ] as const
          ).map((part) => (
            <form.Field key={part.name} name={part.name}>
              {(field) => (
                <div className={part.width}>
                  <label htmlFor={`booking-${part.name}`} className="sr-only">
                    {part.label}
                  </label>
                  <input
                    id={`booking-${part.name}`}
                    ref={bindInput(part.name)}
                    name={part.name}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={part.maxLength}
                    placeholder={part.placeholder}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(onlyDigits(event.target.value))}
                    onBlur={field.handleBlur}
                    aria-invalid={Boolean(dateError) || undefined}
                    aria-describedby={dateError ? "date-error" : undefined}
                    className={partInputClasses(Boolean(dateError))}
                  />
                </div>
              )}
            </form.Field>
          ))}
        </div>
      </div>

      <div
        role="group"
        aria-labelledby="time-label"
        className="relative mt-8 md:mt-[34px] md:grid md:grid-cols-[139px_80px_80px_97px] md:gap-x-4"
      >
        <div>
          <p id="time-label" className={`text-field leading-[1.875rem] ${timeError ? "text-error" : "text-ink"}`}>
            Pick a time
          </p>
          {timeError && (
            <p id="time-error" className={`absolute top-full left-0 mt-3 md:static md:mt-0 ${errorClasses}`}>
              {timeError}
            </p>
          )}
        </div>
        <div className="mt-2 flex gap-1 md:contents">
          {(
            [
              { name: "hour", label: "Hour", placeholder: "09" },
              { name: "minute", label: "Minute", placeholder: "00" },
            ] as const
          ).map((part) => (
            <form.Field key={part.name} name={part.name}>
              {(field) => (
                <div className="w-20">
                  <label htmlFor={`booking-${part.name}`} className="sr-only">
                    {part.label}
                  </label>
                  <input
                    id={`booking-${part.name}`}
                    ref={bindInput(part.name)}
                    name={part.name}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={2}
                    placeholder={part.placeholder}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(onlyDigits(event.target.value))}
                    onBlur={field.handleBlur}
                    aria-invalid={Boolean(timeError) || undefined}
                    aria-describedby={timeError ? "time-error" : undefined}
                    className={partInputClasses(Boolean(timeError))}
                  />
                </div>
              )}
            </form.Field>
          ))}
          <form.Field name="period">
            {(field) => (
              <div className="min-w-0 flex-1 md:w-auto">
                <span id="period-label" className="sr-only">
                  AM or PM
                </span>
                <PeriodSelect
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                  labelledBy="period-label"
                  invalid={Boolean(timeError)}
                />
              </div>
            )}
          </form.Field>
        </div>
      </div>

      <form.Field name="people">
        {(field) => (
          <div className="mt-[27px] md:mt-[30px]">
            <PeopleCounter value={field.state.value} onChange={(value) => field.handleChange(value)} />
          </div>
        )}
      </form.Field>

      <button type="submit" className={`${submitClasses} mt-8 md:mt-[33px]`}>
        Make reservation
      </button>
    </form>
  );
}
