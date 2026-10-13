export interface NidaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  dark?: boolean;
}

export function NidaLogo({ size = 'md', dark = false }: NidaLogoProps) {
  const textSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl';
  const textColor = dark ? 'text-white' : 'text-brand-brown';

  return (
    <div className="flex flex-col items-center group cursor-pointer">
      <div className="flex items-center space-x-2">
        <span className={`font-sans font-black tracking-[0.28em] uppercase ${textColor} ${textSize}`}>
          NIDA
        </span>
      </div>
      {/* Signature Ribbon / Flag emblem in Brown, White, Yellow */}
      <div className="flex w-14 h-1.5 mt-0.5 rounded-xs overflow-hidden shadow-xs">
        <div className="w-1/3 bg-brand-brown"></div>
        <div className="w-1/3 bg-white border-y border-brand-border"></div>
        <div className="w-1/3 bg-brand-yellow"></div>
      </div>
    </div>
  );
}
