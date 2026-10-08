import type { Metadata } from "next";
import Link from "next/link";
import { ArtPicture, photo } from "@/components/art-picture";
import { BookingForm } from "@/components/booking-form";
import { Logo } from "@/components/logo";
import { PatternLines } from "@/components/patterns";
import { SiteFooter } from "@/components/site-footer";
import { baseOpenGraph, SITE_NAME } from "@/lib/site";

const bookingDescription =
  "Request a table at Dine in Sedbergh, Cumbria. Pick a date, time and party size of up to 20 people. This practice site sends nothing.";

export const metadata: Metadata = {
  title: "Reservations",
  description: bookingDescription,
  alternates: { canonical: "/booking" },
  openGraph: { ...baseOpenGraph, title: `Reservations | ${SITE_NAME}`, description: bookingDescription, url: "/booking" },
};

const headerPhoto = photo("hero-bg", { mobile: [375, 600], tablet: [768, 600], desktop: [1440, 600] }, "booking");

export default function BookingPage() {
  return (
    <>
      <header className="relative isolate h-[600px] bg-ink px-6 pt-14 text-center text-white md:px-10 lg:px-0 lg:pt-[65px] lg:text-left">
        <ArtPicture sources={headerPhoto} alt="" priority className="absolute inset-0 -z-10" />
        <div className="mx-auto max-w-[689px] lg:max-w-[1110px]">
          <Link href="/" className="mx-auto block w-fit md:mx-0">
            <Logo title="Dine home" className="h-8 w-[82px] md:h-10 md:w-[103px]" />
          </Link>
          <div className="mx-auto mt-[89px] max-w-[270px] md:mt-[70px] md:max-w-[573px] lg:mx-0 lg:mt-[153px] lg:max-w-[445px]">
            <h1 className="text-hero lg:text-[5rem] lg:leading-[5rem] lg:tracking-[-0.0625rem]">Reservations</h1>
            <p className="text-body mt-3 lg:mt-5">
              We can’t wait to host you. If you have any special requirements please feel free to call on the phone number
              below. We’ll be happy to accommodate you.
            </p>
          </div>
        </div>
      </header>

      <main className="relative flow-root overflow-x-clip px-6 pb-[86px] md:px-10 md:pb-[120px] lg:px-0 lg:pb-[116px]">
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 hidden h-80 w-[calc(50%+273px)] rounded-br-[100px] bg-slate-mist/[0.077] lg:block"
        />
        <PatternLines className="top-[165px] left-[calc(50%-65px)] hidden lg:block" />
        <div className="relative mx-auto -mt-[137px] max-w-[540px] bg-white px-8 pt-[37px] pb-[35px] shadow-photo md:-mt-[230px] md:px-12 md:pt-[49px] md:pb-[50px] lg:mr-[calc(50%-555px)] lg:-mt-[342px]">
          <h2 className="sr-only">Reservation details</h2>
          <BookingForm />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
