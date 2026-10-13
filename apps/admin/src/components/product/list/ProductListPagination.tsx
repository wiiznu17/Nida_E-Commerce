import { Pagination } from '../../ui';

export interface ProductListPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function ProductListPagination(props: ProductListPaginationProps) {
  return <Pagination {...props} />;
}
