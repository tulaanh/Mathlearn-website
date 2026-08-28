export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const baseNavItems: NavItem[] = [
  { href: "/", label: "Tổng quan", icon: "⌂" },
  { href: "/lo-trinh", label: "Lộ trình học", icon: "▤" },
  { href: "/quiz", label: "Bài kiểm tra", icon: "✓" },
];

const teacherNavItems: NavItem[] = [
  { href: "/tai-lieu", label: "Thư viện tài liệu", icon: "▧" },
  { href: "/quan-ly/lo-trinh", label: "Quản lý lộ trình", icon: "🧭" },
  { href: "/quan-ly/chuong", label: "Quản lý chương", icon: "📑" },
  { href: "/quan-ly/tai-lieu", label: "Quản lý tài liệu", icon: "✎" },
  { href: "/quan-ly/ngan-hang-cau-hoi", label: "Ngân hàng câu hỏi", icon: "🏦" },
  { href: "/quan-ly/bao-loi", label: "Báo lỗi nội dung", icon: "🚩" },
];

export function getNavItems(role?: string): NavItem[] {
  return role === "teacher" ? [...baseNavItems, ...teacherNavItems] : baseNavItems;
}

export function isNavActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
