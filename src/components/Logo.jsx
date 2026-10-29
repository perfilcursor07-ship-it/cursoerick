import Link from 'next/link';

/** Wordmark tipográfico da plataforma. */
function splitName(name) {
  const value = String(name || '').trim() || 'NomadeFace Legacy';
  const words = value.split(/\s+/);
  const hasLegacy = words.at(-1)?.toLowerCase() === 'legacy';
  const base = hasLegacy ? words.slice(0, -1).join(' ') : value;

  if (base.includes(' ')) {
    const i = base.indexOf(' ');
    return { first: base.slice(0, i), second: base.slice(i + 1), legacy: hasLegacy, spaced: true };
  }

  const camel = base.match(/^(.+?)([A-Z][^A-Z]*)$/);
  if (camel) return { first: camel[1], second: camel[2], legacy: hasLegacy, spaced: false };

  return { first: base, second: '', legacy: hasLegacy, spaced: false };
}

export default function Logo({ name = 'NomadeFace Legacy', href = '/' }) {
  const { first, second, legacy, spaced } = splitName(name);
  const flourish = first.toLowerCase() === 'nomade' && second.toLowerCase() === 'face';

  return (
    <Link
      href={href}
      aria-label={name || 'NomadeFace Legacy'}
      className={['inline-flex shrink-0 items-center whitespace-nowrap pb-2 font-brush text-[13px] font-normal leading-none tracking-tight text-white sm:text-[22px] lg:text-[26px]', spaced ? 'gap-[0.2em]' : 'gap-0'].join(' ')}
    >
      <span>{first}</span>
      {second && (
        <span className="relative text-brand-300">
          {flourish ? (
            <>
              <span className="relative inline-block">
                F
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-[0.28em] -left-[0.36em] h-[0.42em] w-[1.9em] overflow-visible"
                  viewBox="0 0 80 20"
                  preserveAspectRatio="none"
                >
                  <path d="M2 16 C22 12 50 7 78 2 C54 10 24 16 2 18 Z" fill="currentColor" />
                </svg>
              </span>
              ace
            </>
          ) : second}
          {legacy && (
            <span className="absolute -bottom-[1.1em] right-0 font-sans text-[0.34em] font-bold uppercase tracking-[0.38em] text-white/85">
              Legacy
            </span>
          )}
        </span>
      )}
      {legacy && !second && (
        <span className="font-sans text-[0.4em] font-bold uppercase tracking-[0.32em] text-brand-300">Legacy</span>
      )}
    </Link>
  );
}