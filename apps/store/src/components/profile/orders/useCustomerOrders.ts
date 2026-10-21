'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { orderRequester } from '@/api/requester/orderRequester';
import type { ApiOrder } from '@repo/types';
import type {
  OrderHistoryStatusFilter,
  OrderHistorySortOption,
  OrderHistoryMetrics,
} from './orderHistoryTypes';

export function useCustomerOrders() {
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [allOrders, setAllOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] =
    useState<OrderHistoryStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<OrderHistorySortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await orderRequester.getMyOrders(token);
      setAllOrders(data);
    } catch {
      setAllOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login?redirect=/profile/orders');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (token) {
      void fetchOrders();
    }
  }, [token, fetchOrders]);

  // Overall metrics calculation
  const metrics = useMemo<OrderHistoryMetrics>(() => {
    let pendingCount = 0;
    let processingCount = 0;
    let inTransitCount = 0;
    let deliveredCount = 0;
    let completedCount = 0;
    let totalSpent = 0;

    for (const o of allOrders) {
      const amount = Number(o.totalAmount) || 0;
      if (o.status !== 'CANCELLED' && o.status !== 'REFUNDED') {
        totalSpent += amount;
      }
      if (o.status === 'PENDING') pendingCount++;
      else if (o.status === 'PROCESSING' || o.status === 'PAID')
        processingCount++;
      else if (o.status === 'SHIPPED') inTransitCount++;
      else if (o.status === 'DELIVERED') deliveredCount++;
      else if (o.status === 'COMPLETED') completedCount++;
    }

    return {
      totalOrders: allOrders.length,
      pendingCount,
      processingCount,
      inTransitCount,
      deliveredCount,
      completedCount,
      totalSpent,
    };
  }, [allOrders]);

  // Status counts map for tabs
  const statusCounts = useMemo<Record<OrderHistoryStatusFilter, number>>(() => {
    const counts: Record<OrderHistoryStatusFilter, number> = {
      ALL: allOrders.length,
      PENDING: 0,
      PAID: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    for (const o of allOrders) {
      if (o.status in counts) {
        counts[o.status as OrderHistoryStatusFilter]++;
      }
    }
    return counts;
  }, [allOrders]);

  // Filter and Sort orders
  const filteredOrders = useMemo(() => {
    let result = [...allOrders];

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((o) => o.status === statusFilter);
    }

    // Search query filter
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((o) => {
        const matchNumber = o.orderNumber.toLowerCase().includes(query);
        const matchItem = o.items.some((item) =>
          item.productName.toLowerCase().includes(query),
        );
        return matchNumber || matchItem;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime();
      }
      if (sortBy === 'amount_desc') {
        return Number(b.totalAmount) - Number(a.totalAmount);
      }
      if (sortBy === 'amount_asc') {
        return Number(a.totalAmount) - Number(b.totalAmount);
      }
      return 0;
    });

    return result;
  }, [allOrders, statusFilter, searchQuery, sortBy]);

  // Pagination calculation
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const handleStatusFilterChange = (status: OrderHistoryStatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setSearchQuery('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  return {
    user,
    isLoading: isAuthLoading || isLoading,
    allOrdersCount: allOrders.length,
    metrics,
    statusCounts,
    statusFilter,
    handleStatusFilterChange,
    searchQuery,
    handleSearchChange,
    sortBy,
    setSortBy,
    pageSize,
    handlePageSizeChange,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    paginatedOrders,
    handleResetFilters,
  };
}
