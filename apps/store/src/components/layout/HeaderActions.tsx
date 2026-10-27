import React from 'react';
import Link from 'next/link';
import { Heart, User, ShoppingBag } from 'lucide-react';

interface HeaderActionsProps {
  isAuthenticated: boolean;
  wishlistCount: number;
  cartItemCount: number;
  onOpenCart: () => void;
  onOpenAuth?: (tab?: 'signin' | 'signup') => void;
  hideCartButton?: boolean;
  t: (key: string, fallback?: string) => string;
}

export function HeaderActions({
  isAuthenticated,
  wishlistCount,
  cartItemCount,
  onOpenCart,
  onOpenAuth,
  hideCartButton = false,
  t,
}: HeaderActionsProps) {
  return (
    <>
      {/* Wishlist Link */}
      <Link
        href="/wishlist"
        className="text-brand-brown hover:text-brand-amber p-1.5 transition-colors relative hidden sm:flex items-center"
        title={t('nav.wishlist')}
      >
        <Heart size={20} strokeWidth={2} />
        {wishlistCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand-yellow text-brand-brown text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {wishlistCount}
          </span>
        )}
      </Link>

      {/* Profile / Account */}
      {isAuthenticated ? (
        <Link
          href="/profile"
          className="text-brand-brown hover:text-brand-amber p-1.5 transition-colors"
          aria-label={t('nav.account')}
          title={t('nav.account')}
        >
          <User size={20} strokeWidth={2} />
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => onOpenAuth?.('signin')}
          className="text-brand-brown hover:text-brand-amber p-1.5 transition-colors cursor-pointer"
          aria-label={t('nav.signIn')}
          title={t('nav.signIn')}
        >
          <User size={20} strokeWidth={2} />
        </button>
      )}

      {/* Shopping Bag Button */}
      {!hideCartButton && (
        <button
          onClick={onOpenCart}
          className="bg-brand-brown hover:bg-brand-amber text-white px-4 py-2.5 rounded-xs flex items-center space-x-2 transition-colors relative shadow-xs cursor-pointer"
          aria-label={t('nav.bag')}
        >
          <ShoppingBag size={18} strokeWidth={2} />
          <span className="text-xs font-bold tracking-widest hidden sm:inline">
            {t('nav.bag')}
          </span>
          <span className="bg-brand-yellow text-brand-brown font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center ml-1">
            {cartItemCount}
          </span>
        </button>
      )}
    </>
  );
}
