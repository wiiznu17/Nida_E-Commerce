export interface MegaMenuLink {
  label: string;
  href: string;
}

export interface MegaMenuCategoryGroup {
  title: string;
  links: MegaMenuLink[];
}

export interface MegaMenuPromo {
  tag: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

export interface MegaMenuDepartment {
  categories: MegaMenuCategoryGroup[];
  promo: MegaMenuPromo;
}

export type MegaMenuData = Record<string, MegaMenuDepartment>;

export interface NavDepartment {
  id: string;
  label: string;
  path: string;
  isSale?: boolean;
}
