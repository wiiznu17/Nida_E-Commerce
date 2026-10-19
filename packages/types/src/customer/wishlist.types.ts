export interface ApiWishlistItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: string;
}

export interface ApiWishlistResponse {
  productIds: string[];
}
