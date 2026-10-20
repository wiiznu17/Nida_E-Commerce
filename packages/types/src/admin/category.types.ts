// @repo/types — Admin Category Management Types

import type { Department } from '../common/enums.js';

export interface CreateCategoryPayload {
  name: string;
  nameTh?: string | null;
  slug?: string | null;
  department: Department;
  parentId?: string | null;
  description?: string | null;
  descriptionTh?: string | null;
  bannerTag?: string | null;
  bannerTagTh?: string | null;
  bannerImage?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;
