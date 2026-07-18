interface Props {
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
}

export default function Logo({ size = 'md', light = false }: Props) {
  const sizes = {
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-14 w-auto',
  };

  return (
    <span
      className={`inline-flex items-center ${light ? 'rounded-lg bg-white px-2 py-1' : ''}`}
      aria-label="Ani Market"
    >
      <img
        src="/animarket-logo-withtext.svg"
        alt="Ani Market"
        className={`${sizes[size]} object-contain`}
      />
    </span>
  );
}
