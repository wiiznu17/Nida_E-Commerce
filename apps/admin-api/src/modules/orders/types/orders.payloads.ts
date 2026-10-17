import { Prisma } from '@repo/database';

export type OrderDetailPayload = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        variant: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }; take: 1 };
              };
            };
          };
        };
      };
    };
    payment: true;
    refunds: { orderBy: { createdAt: 'desc' } };
    cancellationRequests: { orderBy: { createdAt: 'desc' } };
    returnRequests: {
      include: {
        items: true;
      };
      orderBy: { createdAt: 'desc' };
    };
    shipments: {
      include: {
        logs: { orderBy: { logTimestamp: 'desc' } };
      };
    };
  };
}>;

export type ShipmentWithLogs = Prisma.ShipmentGetPayload<{
  include: {
    logs: { orderBy: { logTimestamp: 'desc' } };
  };
}>;
