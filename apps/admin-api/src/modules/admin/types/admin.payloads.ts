import { Prisma } from '@repo/database';

export type InventoryItemWithRelations = Prisma.InventoryItemGetPayload<{
  include: {
    variant: {
      include: {
        product: {
          include: {
            category: true;
            images: { where: { isPrimary: true }; take: 1 };
          };
        };
      };
    };
  };
}>;
