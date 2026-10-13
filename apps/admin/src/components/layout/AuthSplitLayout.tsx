import React from 'react';
import { NidaLogo } from '../common/NidaLogo';

export interface AuthSplitLayoutProps {
  children: React.ReactNode;
}

export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-white flex selection:bg-[#EE593B] selection:text-white">
      {/* ==================================================== */}
      {/* LEFT COLUMN: PURE WHITE WITH FLOATING MINIMAL CARD   */}
      {/* ==================================================== */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-12 md:p-16 z-10 bg-white">
        <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 sm:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] border border-stone-100/80">
          {/* Brand Logo - Top of card like "Logo Here" */}
          <div className="mb-8">
            <NidaLogo size="md" />
          </div>

          {children}
        </div>
      </div>

      {/* ==================================================== */}
      {/* RIGHT COLUMN: FLAT SOFT PEACH WITH VECTOR ARTWORK    */}
      {/* ==================================================== */}
      <div className="hidden lg:flex lg:w-1/2 min-h-screen bg-[#FFF2EB] items-center justify-center p-12 xl:p-16 relative overflow-hidden select-none">
        <div className="w-full max-w-lg">
          <svg
            viewBox="0 0 640 460"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            {/* Subtle Minimalist Horizontal Brick Texture Lines */}
            <g stroke="#ECC7B2" strokeWidth="1" strokeLinecap="round" opacity="0.6">
              <path d="M120 180H190M210 180H310M330 180H420" />
              <path d="M160 215H260M280 215H370M390 215H470" />
              <path d="M100 250H180M200 250H320M340 250H430" />
              <path d="M140 285H240M260 285H360M380 285H460" />
            </g>

            {/* Subtle Ground Baseline */}
            <path d="M80 395H560" stroke="#ECC7B2" strokeWidth="1" opacity="0.7" />

            {/* ---------------------------------------------------- */}
            {/* MINIMALIST SHOPPING CART                             */}
            {/* ---------------------------------------------------- */}
            <g id="shopping-cart">
              {/* Cart Basket Outline */}
              <path
                d="M145 270L170 345H325L355 270H145Z"
                fill="white"
                stroke="#1E2235"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Inner Wireframe Grid */}
              <path d="M157 308H338" stroke="#1E2235" strokeWidth="1.5" opacity="0.4" />
              <path d="M192 272L204 343" stroke="#1E2235" strokeWidth="1.5" opacity="0.4" />
              <path d="M235 272L240 343" stroke="#1E2235" strokeWidth="1.5" opacity="0.4" />
              <path d="M278 272L276 343" stroke="#1E2235" strokeWidth="1.5" opacity="0.4" />
              <path d="M318 272L312 343" stroke="#1E2235" strokeWidth="1.5" opacity="0.4" />

              {/* Chassis / Frame to Wheels */}
              <path d="M185 345L172 388M295 345L310 388" stroke="#1E2235" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M176 368H304" stroke="#1E2235" strokeWidth="2" strokeLinecap="round" />

              {/* Wheels */}
              <circle cx="170" cy="388" r="10" fill="#1E2235" />
              <circle cx="170" cy="388" r="3.5" fill="#FFF2EB" />
              <circle cx="312" cy="388" r="10" fill="#1E2235" />
              <circle cx="312" cy="388" r="3.5" fill="#FFF2EB" />

              {/* Handle Bar */}
              <path d="M355 270L375 276V298" stroke="#1E2235" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Items in Cart */}
              {/* 1. Bright Cyan/Emerald Box with cross lines */}
              <rect x="175" y="295" width="62" height="38" rx="2" fill="#00C9A7" />
              <path d="M206 295V333M175 314H237" stroke="white" strokeWidth="1.5" opacity="0.8" />

              {/* 2. Royal Blue Box tilted */}
              <rect x="230" y="298" width="56" height="32" rx="2" fill="#1D71F2" transform="rotate(-8 230 298)" />

              {/* 3. Orange Hatbox Circle */}
              <circle cx="288" cy="282" r="30" fill="#EE6748" />
            </g>

            {/* ---------------------------------------------------- */}
            {/* MANAGER FIGURE                                       */}
            {/* ---------------------------------------------------- */}
            <g id="manager-figure">
              {/* Head & Hair */}
              <circle cx="388" cy="180" r="18" fill="#F7D0BA" />
              <path
                d="M372 178C372 166 380 158 392 158C404 158 408 168 407 178C402 174 395 173 389 173C383 173 377 175 372 178Z"
                fill="#1E2235"
              />

              {/* Neck */}
              <rect x="383" y="197" width="10" height="9" fill="#EABDA4" />

              {/* Blazer / Jacket in Terracotta Coral */}
              <path
                d="M362 205H414L422 284H354L362 205Z"
                fill="#EE593B"
                rx="4"
              />

              {/* White V-Neck Collar */}
              <path d="M381 205L388 232L395 205H381Z" fill="white" />

              {/* Clipboard in Hands */}
              <rect x="375" y="238" width="34" height="46" rx="3" fill="#F4E6D7" stroke="#1E2235" strokeWidth="1.5" />
              <rect x="382" y="246" width="20" height="2" rx="1" fill="#1E2235" opacity="0.4" />
              <rect x="382" y="252" width="16" height="2" rx="1" fill="#1E2235" opacity="0.3" />
              <rect x="382" y="258" width="12" height="2" rx="1" fill="#1E2235" opacity="0.3" />

              {/* Arms */}
              <path d="M362 208L354 250L374 258" stroke="#EE593B" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M414 208L422 254L408 260" stroke="#EE593B" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />

              {/* Hands */}
              <circle cx="374" cy="260" r="5" fill="#F7D0BA" />
              <circle cx="408" cy="261" r="5" fill="#F7D0BA" />

              {/* Trousers in Dark Charcoal Navy */}
              <path
                d="M363 284H413L418 395H402L392 312L382 395H366L363 284Z"
                fill="#1E2235"
              />

              {/* Shoes */}
              <path d="M363 395H380C382 399 382 405 375 405H358C358 400 360 395 363 395Z" fill="#111422" />
              <path d="M402 395H418C421 395 423 400 423 405H406C399 405 400 400 402 395Z" fill="#111422" />
            </g>

            {/* Fallen Leaf / Petal Accent on ground */}
            <path d="M108 408C112 396 122 390 122 401C122 412 112 417 108 408Z" fill="#EE593B" />
            <path d="M116 412C118 402 126 397 126 406C126 415 118 419 116 412Z" fill="#1E2235" />
          </svg>
        </div>
      </div>
    </div>
  );
};
