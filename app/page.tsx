import { ArtPicture, photo } from "@/components/art-picture";
import { ButtonLink } from "@/components/button-link";
import { EventTabs } from "@/components/event-tabs";
import { Logo } from "@/components/logo";
import { PatternDivide, PatternLines } from "@/components/patterns";
import { SiteFooter } from "@/components/site-footer";

const heroPhoto = photo("hero-bg", { mobile: [375, 748], tablet: [768, 992], desktop: [1440, 820] });
const enjoyablePhoto = photo("enjoyable-place", { mobile: [327, 400], tablet: [573, 360], desktop: [540, 720] });
const locallySourcedPhoto = photo("locally-sourced", { mobile: [327, 400], tablet: [573, 360], desktop: [540, 720] });
const readyPhoto = photo("ready-bg", { mobile: [375, 328], tablet: [768, 272], desktop: [1440, 240] });

const menuHighlights = [
  {
    name: "Seared Salmon Fillet",
    description: "Our locally sourced salmon served with a refreshing buckwheat summer salad.",
    image: "salmon",
    alt: "Seared salmon fillet on buckwheat salad with a bright orange sauce",
  },
  {
    name: "Rosemary Filet Mignon",
    description: "Our prime beef served to your taste with a delicious choice of seasonal sides.",
    image: "beef",
    alt: "Filet mignon topped with rosemary and a slice of butter",
  },
  {
    name: "Summer Fruit Chocolate Mousse",
    description: "Creamy mousse combined with summer fruits and dark chocolate shavings.",
    image: "chocolate",
    alt: "Glasses of chocolate mousse topped with pomegranate seeds",
  },
];

const sectionHeadingClasses = "text-section-title mt-8 md:mt-10 lg:mt-12";

export default function HomePage() {
  return (
    <>
      <header className="relative isolate bg-ink px-6 pt-[232px] pb-[154px] text-center text-white md:px-10 md:pt-[374px] md:pb-[210px] lg:px-0 lg:pt-[65px] lg:pb-[198px] lg:text-left">
        <ArtPicture sources={heroPhoto} alt="" priority className="absolute inset-0 -z-10" />
        {/* The design keeps the text column on plain black; the photo starts beside it. */}
        <div aria-hidden="true" className="absolute inset-y-0 left-0 -z-10 hidden w-[calc(50%-175px)] bg-ink lg:block" />
        <div className="mx-auto max-w-[689px] lg:max-w-[1110px]">
          <Logo title="Dine" className="mx-auto h-8 w-[82px] md:h-10 md:w-[103px] lg:mx-0" />
          <div className="mt-10 lg:mt-[153px]">
            <h1 className="text-hero lg:max-w-[540px] lg:text-[5rem] lg:leading-[5rem] lg:tracking-[-0.0625rem]">
              Exquisite dining <br />
              since 1989
            </h1>
            <p className="text-body mx-auto mt-5 max-w-[327px] md:max-w-[573px] lg:mx-0 lg:mt-[10px] lg:max-w-[445px]">
              Experience our seasonal menu in beautiful country surroundings. Eat the freshest produce from the comfort of
              our farmhouse.
            </p>
            <ButtonLink href="/booking" tone="light" className="mt-12 md:mt-14 lg:mt-10">
              Book a table
            </ButtonLink>
          </div>
        </div>
      </header>

      <main className="overflow-x-clip">
        <section aria-labelledby="enjoyable-title" className="relative -mt-[72px] px-6 md:-mt-24 md:px-10 lg:-mt-[70px] lg:px-0">
          <div
            aria-hidden="true"
            className="absolute top-[196px] left-0 hidden h-80 w-1/2 rounded-tr-[100px] bg-slate-mist/[0.077] md:block lg:top-80 lg:w-[calc(50%+175px)]"
          />
          <div className="relative mx-auto max-w-[573px] lg:flex lg:max-w-[1110px] lg:items-start">
            <ArtPicture
              sources={enjoyablePhoto}
              alt="Autumn hillside with a stream, sheep grazing and farm cottages"
              className="relative z-10 block aspect-[327/400] shadow-photo md:aspect-[573/360] lg:aspect-auto lg:h-[720px] lg:w-[540px] lg:shrink-0"
            />
            <div className="mx-auto mt-12 max-w-[457px] text-center md:mt-14 lg:mt-[247px] lg:ml-[125px] lg:w-[445px] lg:max-w-none lg:text-left">
              <PatternDivide className="mx-auto lg:mx-0" />
              <h2 id="enjoyable-title" className={sectionHeadingClasses}>
                Enjoyable place <br />
                for all the family
              </h2>
              <p className="text-body mt-3 md:mt-6">
                Our relaxed surroundings make dining with us a great experience for everyone. We can even arrange a tour of the
                farm before your meal.
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="locally-sourced-title"
          className="relative mt-[106px] px-6 pb-[106px] md:mt-[120px] md:px-10 md:pb-[120px] lg:mt-[121px] lg:-mb-20 lg:px-0 lg:pb-0"
        >
          <div
            aria-hidden="true"
            className="absolute top-[473px] right-0 left-1/2 hidden h-80 rounded-tl-[100px] bg-slate-mist/[0.077] md:block lg:top-80 lg:left-[calc(50%-175px)]"
          />
          <div className="relative mx-auto max-w-[573px] lg:flex lg:max-w-[1110px] lg:flex-row-reverse lg:items-start lg:justify-between">
            <div className="relative z-10 lg:shrink-0">
              <ArtPicture
                sources={locallySourcedPhoto}
                alt="Chef spooning sauce over a plated dish"
                className="block aspect-[327/400] shadow-photo md:aspect-[573/360] lg:aspect-auto lg:h-[720px] lg:w-[540px]"
              />
              <PatternLines className="top-[228px] right-[-58px] hidden md:block lg:top-[282px] lg:right-[-114px]" />
            </div>
            <div className="mx-auto mt-12 max-w-[457px] text-center md:mt-14 lg:mx-0 lg:mt-[200px] lg:w-[445px] lg:max-w-none lg:text-left">
              <PatternDivide className="mx-auto lg:mx-0" />
              <h2 id="locally-sourced-title" className={sectionHeadingClasses}>
                The most locally sourced food
              </h2>
              <p className="text-body mt-3 md:mt-6">
                All our ingredients come directly from our farm or local fishery. So you can be sure that you’re eating the
                freshest, most sustainable food.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="menu-title" className="relative bg-ink px-6 py-[87px] text-white md:px-10 md:py-[97px] lg:px-0 lg:pt-[200px] lg:pb-[120px]">
          <div className="mx-auto max-w-[573px] lg:grid lg:max-w-[1110px] lg:grid-cols-[445px_540px] lg:justify-between">
            <div className="mx-auto max-w-[445px] text-center lg:mx-0 lg:text-left">
              <PatternDivide className="mx-auto lg:mx-0" />
              <h2 id="menu-title" className="text-section-title mt-10 lg:mt-12">
                A few highlights from our menu
              </h2>
              <p className="text-body mt-3 md:mt-[30px] lg:mt-6">
                We cater for all dietary requirements, but here’s a glimpse at some of our diner’s favourites. Our menu is
                revamped every season.
              </p>
            </div>
            <ul className="mt-20 md:mt-12 lg:mt-[55px]">
              {menuHighlights.map((item) => (
                <li
                  key={item.name}
                  className="flex flex-col items-center text-center not-first:mt-5 not-first:border-t not-first:border-white/15 not-first:pt-6 md:flex-row md:items-start md:text-left md:not-first:mt-6"
                >
                  <picture className="block aspect-[327/245] w-full shrink-0 md:aspect-auto md:h-24 md:w-32">
                    <source
                      media="(min-width: 48rem)"
                      srcSet={`/images/homepage/${item.image}-desktop-tablet.jpg 1x, /images/homepage/${item.image}-desktop-tablet@2x.jpg 2x`}
                      width={128}
                      height={96}
                    />
                    <img
                      src={`/images/homepage/${item.image}-mobile.jpg`}
                      srcSet={`/images/homepage/${item.image}-mobile.jpg 1x, /images/homepage/${item.image}-mobile@2x.jpg 2x`}
                      width={327}
                      height={245}
                      alt={item.alt}
                      loading="lazy"
                      decoding="async"
                      className="block h-full w-full object-cover"
                    />
                  </picture>
                  <div className="relative mt-10 md:mt-[7px] md:pl-[62px]">
                    <span aria-hidden="true" className="absolute top-3 left-0 hidden h-px w-8 bg-beige md:block" />
                    <h3 className="text-xl leading-6 font-bold tracking-[-0.015625rem]">{item.name}</h3>
                    <p className="mt-2 max-w-[327px] text-base leading-[1.625rem] md:mt-1.5 md:max-w-[350px]">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <EventTabs />

        <section aria-labelledby="ready-title" className="relative isolate bg-ink px-6 py-[82px] text-center text-white md:px-10 md:py-[68px] lg:px-0 lg:py-[88px] lg:text-left">
          <ArtPicture sources={readyPhoto} alt="" className="absolute inset-0 -z-10" />
          <div className="mx-auto flex max-w-[689px] flex-col items-center gap-5 md:gap-6 lg:max-w-[1110px] lg:flex-row lg:justify-between">
            <h2 id="ready-title" className="text-section-title">
              Ready to make a reservation?
            </h2>
            <ButtonLink href="/booking" tone="light">
              Book a table
            </ButtonLink>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
