"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, ChevronLeft } from "lucide-react";
import { useDesignStore } from "@/lib/store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

export default function ReviewsPage() {
  const user = useDesignStore((state) => state.user);
  const [filter, setFilter] = useState("all");

  return (
    <main className="bg-background py-16 min-h-[70vh]">
      <div className="page-shell max-w-5xl mx-auto">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/account">Tài khoản</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Đánh giá của tôi</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/account">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Đánh Giá Của Tôi
          </h1>
        </div>

        <div className="rounded-[8px] border border-(--mirai-color-line) bg-card p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 border-b border-(--mirai-color-line) pb-6">
            <p className="text-muted-foreground">
              Quản lý các đánh giá sản phẩm bạn đã mua.
            </p>

            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className="text-sm"
              >
                Tất cả
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                onClick={() => setFilter("pending")}
                className="text-sm"
              >
                Chưa đánh giá
              </Button>
              <Button
                variant={filter === "done" ? "default" : "outline"}
                onClick={() => setFilter("done")}
                className="text-sm"
              >
                Đã đánh giá
              </Button>
            </div>
          </div>

          {!user ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">
                Vui lòng đăng nhập để xem đánh giá của bạn.
              </p>
              <Button asChild>
                <Link href="/login">Đăng nhập ngay</Link>
              </Button>
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
              <Star className="w-16 h-16 mx-auto mb-4 text-(--mirai-color-line-strong)" />
              <h3 className="text-xl font-medium text-foreground mb-2">
                Chưa có đánh giá nào
              </h3>
              <p className="mb-6">
                Bạn chưa có đánh giá hoặc sản phẩm nào chờ đánh giá lúc này.
              </p>
              <Button asChild variant="outline">
                <Link href="/shop">Tiếp tục mua sắm</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
