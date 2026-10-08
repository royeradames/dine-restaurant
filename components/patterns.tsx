/** Small circle-and-line ornament that opens each text block. */
export function PatternDivide({ className = "" }: { className?: string }) {
  return <img src="/images/patterns/pattern-divide.svg" alt="" width={71} height={7} className={`block ${className}`} />;
}

/** Stack of six beige lines that overlaps some photos. */
export function PatternLines({ className = "" }: { className?: string }) {
  return (
    <img
      src="/images/patterns/pattern-lines.svg"
      alt=""
      width={160}
      height={76}
      className={`pointer-events-none absolute ${className}`}
    />
  );
}
