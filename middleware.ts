import { NextResponse, type NextRequest } from "next/server";

/** Kiểm tra nhanh sự tồn tại của cookie phiên Supabase (cục bộ, không gọi mạng).
 *  Người dùng chưa đăng nhập được chuyển hướng ngay mà không phải chờ render trang.
 *  Việc làm mới token diễn ra phía browser client khi tải trang. */
export function middleware(request: NextRequest) {
  const hasSessionCookie = request.cookies.getAll().some(
    (cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token"),
  );

  if (!hasSessionCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/dang-nhap";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Chỉ chạy ở khu vực cần đăng nhập; các trang học công khai không bị ảnh hưởng.
export const config = {
  matcher: ["/tai-lieu/:path*", "/quan-ly/:path*"],
};
