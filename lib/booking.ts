import { z } from "zod";

export const bookingMessages = {
  required: "This field is required",
  invalidEmail: "Please use a valid email address",
  incomplete: "This field is incomplete",
  invalidDate: "Please use a real date",
  pastDate: "Please pick today or a later date",
  invalidTime: "Please use a valid time",
  pastTime: "Please pick a time later today",
} as const;

export const PEOPLE_MIN = 1;
export const PEOPLE_MAX = 20;
export const PEOPLE_DEFAULT = 4;

export type Period = "AM" | "PM";

export type BookingValues = {
  name: string;
  email: string;
  month: string;
  day: string;
  year: string;
  hour: string;
  minute: string;
  period: Period;
  people: number;
};

/** Focus order for the first invalid field after a submit. */
export const bookingFieldOrder = ["name", "email", "month", "day", "year", "hour", "minute"] as const;
export type BookingFieldName = (typeof bookingFieldOrder)[number];
export type BookingErrors = Partial<Record<BookingFieldName, string>>;

export const emptyBooking: BookingValues = {
  name: "",
  email: "",
  month: "",
  day: "",
  year: "",
  hour: "",
  minute: "",
  period: "AM",
  people: PEOPLE_DEFAULT,
};

type Problem = { field: BookingFieldName; message: string };

const digits = /^\d+$/;
const emailSchema = z.email();

const firstEmpty = (values: BookingValues, fields: readonly BookingFieldName[]) =>
  fields.find((field) => values[field].trim() === "");

const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Returns the calendar day the guest picked, or the reason it is unusable. */
function checkDate(values: BookingValues, now: Date): { date: Date } | { problem: Problem } {
  const empty = firstEmpty(values, ["month", "day", "year"]);
  if (empty) return { problem: { field: empty, message: bookingMessages.incomplete } };

  const [month, day, year] = [values.month, values.day, values.year].map((part) => part.trim());
  if (!digits.test(month) || Number(month) < 1 || Number(month) > 12) {
    return { problem: { field: "month", message: bookingMessages.invalidDate } };
  }
  if (!digits.test(year) || year.length !== 4) {
    return { problem: { field: "year", message: bookingMessages.invalidDate } };
  }
  if (!digits.test(day) || Number(day) < 1 || Number(day) > daysInMonth(Number(year), Number(month))) {
    return { problem: { field: "day", message: bookingMessages.invalidDate } };
  }

  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date < startOfDay(now)) return { problem: { field: "month", message: bookingMessages.pastDate } };
  return { date };
}

/** Checks the 12-hour time, and that a booking for today is still ahead of now. */
function checkTime(values: BookingValues, date: Date | undefined, now: Date): Problem | undefined {
  const empty = firstEmpty(values, ["hour", "minute"]);
  if (empty) return { field: empty, message: bookingMessages.incomplete };

  const [hour, minute] = [values.hour.trim(), values.minute.trim()];
  if (!digits.test(hour) || Number(hour) < 1 || Number(hour) > 12) {
    return { field: "hour", message: bookingMessages.invalidTime };
  }
  if (!digits.test(minute) || Number(minute) > 59) {
    return { field: "minute", message: bookingMessages.invalidTime };
  }
  if (!date) return undefined;

  const hour24 = (Number(hour) % 12) + (values.period === "PM" ? 12 : 0);
  const bookingTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour24, Number(minute));
  if (bookingTime <= now) return { field: "hour", message: bookingMessages.pastTime };
  return undefined;
}

/** The booking rules as a Zod schema. `now` is read on every parse so "past" stays current. */
export function createBookingSchema(now: () => Date = () => new Date()) {
  return z
    .object({
      name: z.string(),
      email: z.string(),
      month: z.string(),
      day: z.string(),
      year: z.string(),
      hour: z.string(),
      minute: z.string(),
      period: z.enum(["AM", "PM"]),
      people: z.number().int().min(PEOPLE_MIN).max(PEOPLE_MAX),
    })
    .superRefine((values, context) => {
      const report = ({ field, message }: Problem) => context.addIssue({ code: "custom", path: [field], message });
      const current = now();

      if (values.name.trim() === "") report({ field: "name", message: bookingMessages.required });

      const email = values.email.trim();
      if (email === "") report({ field: "email", message: bookingMessages.required });
      else if (!emailSchema.safeParse(email).success) report({ field: "email", message: bookingMessages.invalidEmail });

      const dateCheck = checkDate(values, current);
      if ("problem" in dateCheck) report(dateCheck.problem);

      const timeProblem = checkTime(values, "date" in dateCheck ? dateCheck.date : undefined, current);
      if (timeProblem) report(timeProblem);
    });
}

/** First message per field, keyed by field name. Empty when the booking is valid. */
export function validateBooking(values: BookingValues, now: Date = new Date()): BookingErrors {
  const result = createBookingSchema(() => now).safeParse(values);
  if (result.success) return {};

  const errors: BookingErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string" || !(bookingFieldOrder as readonly string[]).includes(field)) continue;
    errors[field as BookingFieldName] ??= issue.message;
  }
  return errors;
}

export const firstInvalidField = (errors: BookingErrors) => bookingFieldOrder.find((field) => errors[field]);

/** "Friday 15 October 2027 at 08:15 PM" for the demo confirmation. */
export function describeBooking(values: BookingValues) {
  const date = new Date(Number(values.year), Number(values.month) - 1, Number(values.day));
  const day = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
  const time = `${values.hour.trim().padStart(2, "0")}:${values.minute.trim().padStart(2, "0")} ${values.period}`;
  const party = values.people === 1 ? "1 person" : `${values.people} people`;
  return { day, time, party };
}
