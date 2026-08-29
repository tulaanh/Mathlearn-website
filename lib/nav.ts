export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const baseNavItems: NavItem[] = [
  { href: "/", label: "Tổng quan", icon: "⌂" },
  { href: "/lo-trinh", label: "Lộ trình học", icon: "▤" },
  { href: "/quiz", label: "Bài kiểm tra", icon: "✓" },
  { href: "/ngan-hang-cau-hoi", label: "Ngân hàng câu hỏi", icon: "🏦" },
  { href: "/su-kien", label: "Sự kiện", icon: "🎮" },
];

const teacherNavItems: NavItem[] = [
  { href: "/tai-lieu", label: "Thư viện tài liệu", icon: "▧" },
  { href: "/quan-ly/lo-trinh", label: "Quản lý lộ trình", icon: "🧭" },
  { href: "/quan-ly/chuong", label: "Quản lý chương", icon: "📑" },
  { href: "/quan-ly/tai-lieu", label: "Quản lý tài liệu", icon: "✎" },
  { href: "/quan-ly/ngan-hang-cau-hoi", label: "Quản lý câu hỏi", icon: "⚙️" },
  { href: "/quan-ly/bao-loi", label: "Báo lỗi nội dung", icon: "🚩" },
  { href: "/quan-ly/su-kien", label: "Quản lý sự kiện", icon: "🎮" },
];

export function getNavItems(role?: string): NavItem[] {
  return role === "teacher" ? [...baseNavItems, ...teacherNavItems] : baseNavItems;
}

export function isNavActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
