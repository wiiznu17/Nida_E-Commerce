import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../ui';
import { useLanguage } from '../../context/LanguageContext';
import { formatOrderDateTime, formatPrice } from '../../utils';
import type { ApiOrder, OrderStatus } from '@repo/types';

interface DashboardRecentOrdersProps {
  orders: ApiOrder[];
  onQuickShip: (orderId: string, status: OrderStatus) => Promise<void>;
}

export function DashboardRecentOrders({
  orders,
  onQuickShip,
}: DashboardRecentOrdersProps) {
  const { language, t } = useLanguage();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'DELIVERED':
        return (
          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-xs border border-emerald-200">
            {t(`order.status.${status.toLowerCase()}`)}
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="bg-sky-50 text-sky-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-xs border border-sky-200">
            {t('order.status.shipped')}
          </span>
        );
      case 'PROCESSING':
      case 'PAID':
        return (
          <span className="bg-amber-50 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-xs border border-amber-200">
            {t(`order.status.${status.toLowerCase()}`)}
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-brand-border p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-gray-100 gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-brand-brown">
            {t('dashboard.orders.recentOrdersTitle')}
          </h3>
          <p className="text-xs text-gray-500">
            {t('dashboard.orders.recentOrdersSub')}
          </p>
        </div>
        <Link
          to="/admin/orders"
          className="text-xs font-bold uppercase tracking-wider text-brand-amber hover:underline flex items-center"
        >
          <span>{t('dashboard.orders.viewAll')}</span>
          <ArrowUpRight size={13} className="ml-1" />
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-36">{t('dashboard.orders.orderNo')}</TableHead>
            <TableHead className="w-48">{t('dashboard.orders.customer')}</TableHead>
            <TableHead>{t('dashboard.orders.items')}</TableHead>
            <TableHead className="w-28 text-right">{t('dashboard.orders.total')}</TableHead>
            <TableHead className="w-28 text-center">{t('dashboard.orders.status')}</TableHead>
            <TableHead className="w-28 text-right">{t('common.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.slice(0, 5).map((order) => {
            const isFulfillable = order.status === 'PROCESSING' || order.status === 'PAID';

            return (
              <TableRow key={order.id}>
                <TableCell className="font-mono font-bold text-brand-brown">
                  {order.orderNumber}
                  <span className="block text-[10px] font-sans text-gray-400 font-normal mt-0.5">
                    {formatOrderDateTime(order.placedAt, language)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-brand-brown">
                    {order.shippingAddress?.recipientName ?? t('dashboard.orders.guestCustomer')}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono">
                    {order.shippingAddress?.phone ?? '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-gray-800 text-xs">
                    {order.items[0]?.productName}
                    {order.items.length > 1 && (
                      <span className="text-gray-400 ml-1">
                        (+{order.items.length - 1} {t('common.units')})
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell className="font-mono font-bold text-brand-brown text-right">
                  {formatPrice(order.totalAmount)}
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(order.status)}
                </TableCell>
                <TableCell className="text-right">
                  {isFulfillable ? (
                    <button
                      onClick={() => onQuickShip(order.id, 'SHIPPED')}
                      className="bg-brand-brown hover:bg-brand-amber text-white text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xs transition-colors cursor-pointer"
                    >
                      {t('dashboard.orders.shipNow')}
                    </button>
                  ) : (
                    <Link
                      to="/admin/orders"
                      className="text-brand-amber hover:underline text-xs font-bold"
                    >
                      {t('common.viewDetails')}
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
