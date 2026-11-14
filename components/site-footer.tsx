import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto flex w-full max-w-[1110px] flex-col items-center gap-10 px-6 pt-20 pb-20 text-center md:max-w-[768px] md:flex-row md:items-start md:gap-[130px] md:px-10 md:pt-16 md:pb-16 md:text-left lg:max-w-[1110px] lg:gap-[193px] lg:px-0 lg:pt-[78px] lg:pb-[78px]">
        <Logo className="h-10 w-[103px] shrink-0" />
        <div className="text-footer flex flex-col gap-8 lg:flex-row lg:gap-[124px]">
          <address className="not-italic lg:w-[244px]">
            Marthwaite, Sedbergh
            <br />
            Cumbria
            <br />
            +00 44 123 4567
          </address>
          <p>
            Open times
            <br />
            Mon - Fri: 09:00 AM - 10:00 PM
            <br />
            Sat - Sun: 09:00 AM - 11:30 PM
          </p>
        </div>
      </div>
    </footer>
  );
}
