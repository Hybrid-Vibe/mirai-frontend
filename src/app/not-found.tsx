import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader, SiteFooter } from "@/components/common";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="font-heading text-8xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 font-heading text-2xl font-semibold text-foreground">
          Không tìm thấy trang
        </h2>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại, đã bị gỡ bỏ, đổi tên
          hoặc tạm thời không khả dụng.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="rounded-[4px] h-11 px-8">
            <Link href="/">Về trang chủ</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-[4px] h-11 px-8">
            <Link href="/shop">Xem sản phẩm</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
