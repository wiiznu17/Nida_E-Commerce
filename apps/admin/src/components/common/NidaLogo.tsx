
export interface NidaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dark?: boolean;
  className?: string;
}

const LETTERS_PATH =
  'M 2 2 L 8 2 L 134 100 L 134 8 L 166 8 L 166 156 L 135 156 L 34 62 L 34 150 L 2 150 Z ' +
  'M 265 8 H 298 V 150 H 265 Z ' +
  'M 400 8 H 490 C 532 8 560 42 560 79 C 560 116 532 150 490 150 H 400 Z ' +
  'M 433 33 H 482 C 510 33 529 54 529 79 C 529 104 510 125 482 125 H 433 Z ' +
  'M 702 8 L 738 8 L 808 150 L 774 150 L 720 42 L 666 150 L 631 150 Z';

const WAVE_1_PATH =
  'M 44 230 L 102 206 L 160 229 L 218 206 L 276 230 L 276 254 L 218 230 L 160 253 L 102 230 L 44 254 Z';

const WAVE_2_PATH =
  'M 276 230 L 334 206 L 392 229 L 450 206 L 508 230 L 508 254 L 450 230 L 392 253 L 334 230 L 276 254 Z';

const WAVE_3_PATH =
  'M 508 230 L 566 206 L 624 229 L 682 206 L 740 230 L 740 254 L 682 230 L 624 253 L 566 230 L 508 254 Z';

export function NidaLogo({
  size = 'md',
  dark = false,
  className = '',
}: NidaLogoProps) {
  const heightClass =
    size === 'xl'
      ? 'h-14'
      : size === 'lg'
        ? 'h-11'
        : size === 'sm'
          ? 'h-7'
          : 'h-9';

  const lettersColor = dark ? '#FFFFFF' : '#2B1810';
  const wave1Color = dark ? '#E6C687' : '#312419';
  const wave2Color = '#FFFFFF';
  const wave2Stroke = dark ? '#FFFFFF' : '#D5CDC5';
  const wave3Color = '#EB9617';

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      aria-label="NIDA Back Office"
    >
      <svg
        viewBox="0 0 810 258"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${heightClass} w-auto transition-transform duration-200 hover:scale-[1.02]`}
      >
        {/* NIDA Letters */}
        <path d={LETTERS_PATH} fill={lettersColor} fillRule="evenodd" />

        {/* Chevron Ribbon Wave 1 (Brown in Light, Champagne Gold in Dark) */}
        <path d={WAVE_1_PATH} fill={wave1Color} />

        {/* Chevron Ribbon Wave 2 (White with subtle contrast border in Light) */}
        <path
          d={WAVE_2_PATH}
          fill={wave2Color}
          stroke={wave2Stroke}
          strokeWidth="1.5"
        />

        {/* Chevron Ribbon Wave 3 (Amber Yellow) */}
        <path d={WAVE_3_PATH} fill={wave3Color} />
      </svg>
    </div>
  );
}
