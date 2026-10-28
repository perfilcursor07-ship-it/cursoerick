import Link from 'next/link';

/** Wordmark tipográfico da plataforma. */
function splitName(name) {
  const value = String(name || '').trim();
  if (!value) return ['Nomade', 'Face'];

  if (value.includes(' ')) {
    const i = value.lastIndexOf(' ');
    return [value.slice(0, i), value.slice(i + 1)];
  }

  const camel = value.match(/^(.+?)([A-Z][^A-Z]*)$/);
  if (camel) return [camel[1], camel[2]];

  return [value, ''];
}

export default function Logo({ name = 'NomadeFace', href = '/' }) {
  const [first, second] = splitName(name);

  return (
    <Link
      href={href}
      aria-label={name || 'NomadeFace'}
      className="inline-flex items-baseline whitespace-nowrap font-brush text-[24px] font-normal leading-tight tracking-tight text-white"
    >
      <span>{first}</span>
      {second && <span className="text-brand-400">{second}</span>}
    </Link>
  );
}
