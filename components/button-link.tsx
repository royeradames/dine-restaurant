import Link from "next/link";

type Tone = "light" | "dark";

const toneClasses: Record<Tone, string> = {
  // Button style 2: white outline on dark photography; fills white when active.
  light: "border-white text-white hover:bg-white hover:text-ink focus-visible:bg-white focus-visible:text-ink",
  // Button style 1: solid black; turns into a black outline when active.
  dark: "border-ink bg-ink text-white hover:bg-white hover:text-ink focus-visible:bg-white focus-visible:text-ink",
};

export const buttonBaseClasses =
  "text-button inline-flex h-16 items-center justify-center border transition-colors duration-200";

type ButtonLinkProps = {
  href: string;
  tone: Tone;
  children: React.ReactNode;
  className?: string;
};

export function ButtonLink({ href, tone, children, className = "" }: ButtonLinkProps) {
  return (
    <Link href={href} className={`${buttonBaseClasses} px-14 ${toneClasses[tone]} ${className}`}>
      {children}
    </Link>
  );
}
