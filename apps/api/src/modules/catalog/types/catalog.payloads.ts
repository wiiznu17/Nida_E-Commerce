import { Prisma, type Category } from '@repo/database';

export type CategoryWithRelations = Category & {
  children?: Category[];
  _count?: { products: number };
};

export type ProductListPayload = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
    variants: {
      include: { inventoryItem: true };
    };
    _count: { select: { reviews: true } };
  };
}>;
