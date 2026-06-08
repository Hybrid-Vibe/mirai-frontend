"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Package, Loader2, ChevronLeft } from "lucide-react";
import { useDesignStore } from "@/lib/store";
import { orderApi } from "@/lib/api-client";
import { OrderResponseDto } from "@/types/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

const ORDER_STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: "Đã tạo", color: "bg-blue-100 text-blue-700" },
  2: { label: "Đã xác nhận", color: "bg-purple-100 text-purple-700" },
  3: { label: "Đang giao", color: "bg-orange-100 text-orange-700" },
  4: { label: "Đã giao", color: "bg-green-100 text-green-700" },
  5: { label: "Đã huỷ", color: "bg-red-100 text-red-700" },
};

const FILTER_STATUS_MAP: Record<string, number | null> = {
  all: null,
  "Đã tạo": 1,
  "Đã xác nhận": 2,
  "Đang giao": 3,
  "Đã giao": 4,
  "Đã huỷ": 5,
};

export default function OrdersPage() {
  const user = useDesignStore((state) => state.user);
  const [filter, setFilter] = useState("all");
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    Promise.resolve().then(() => {
      setLoading(true);
      setError(null);
    });
    orderApi
      .getOrdersByUserId(user.id)
      .then((data) => setOrders(data))
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại!");
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filteredOrders = useMemo(() => {
    const targetStatus = FILTER_STATUS_MAP[filter];
    if (targetStatus === null || targetStatus === undefined) return orders;
    return orders.filter((o) => o.status === targetStatus);
  }, [orders, filter]);

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
              <BreadcrumbPage>Đơn hàng của tôi</BreadcrumbPage>
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
            Đơn Hàng Của Tôi
          </h1>
        </div>

        <div className="rounded-[8px] border border-(--mirai-color-line) bg-card p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 border-b border-(--mirai-color-line) pb-6">
            <p className="text-muted-foreground">
              Quản lý và theo dõi trạng thái các đơn hàng của bạn.
            </p>

            <div className="flex gap-2 w-full sm:w-auto">
              <Select
                value={filter}
                onValueChange={(val) => setFilter(val || "all")}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Lọc trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Đã tạo">Đã tạo</SelectItem>
                  <SelectItem value="Đã xác nhận">Đã xác nhận</SelectItem>
                  <SelectItem value="Đang giao">Đang giao</SelectItem>
                  <SelectItem value="Đã giao">Đã giao</SelectItem>
                  <SelectItem value="Đã huỷ">Đã huỷ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!user ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">
                Vui lòng đăng nhập để xem đơn hàng của bạn.
              </p>
              <Button asChild>
                <Link href="/login">Đăng nhập ngay</Link>
              </Button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-(--mirai-sem-primary)" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
              <Package className="w-16 h-16 mx-auto mb-4 text-(--mirai-color-line-strong)" />
              <h3 className="text-xl font-medium text-foreground mb-2">
                Chưa có đơn hàng
              </h3>
              <p className="mb-6">
                {filter === "all"
                  ? "Bạn chưa có đơn hàng nào."
                  : `Không có đơn hàng ở trạng thái "${filter}".`}
              </p>
              {filter !== "all" && (
                <Button variant="outline" onClick={() => setFilter("all")}>
                  Xem tất cả đơn hàng
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const statusInfo = ORDER_STATUS_MAP[order.status ?? -1] ?? {
                  label: "Không rõ",
                  color: "bg-gray-100 text-gray-600",
                };
                const createdDate = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";
                return (
                  <div
                    key={order.orderId}
                    className="rounded-xl border border-(--mirai-color-line) bg-card p-6 hover:shadow-md transition-shadow space-y-4"
                  >
                    {/* Header row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-(--mirai-color-line) pb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">
                            Đơn hàng #
                            {order.orderNumber ||
                              order.orderId?.slice(0, 8).toUpperCase()}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Ngày đặt: {createdDate}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">
                          Tổng tiền
                        </p>
                        <p className="text-xl font-bold text-(--mirai-sem-danger)">
                          {order.totalAmount.toLocaleString("vi-VN")}₫
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="divide-y divide-(--mirai-color-line)">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row justify-between py-3 gap-4"
                          >
                            <div className="flex gap-4 items-start">
                              <div className="h-16 w-16 rounded bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-(--mirai-color-line)">
                                {/* Placeholder for item image if you want to add it later */}
                                <Package className="h-6 w-6 opacity-30" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground line-clamp-2">
                                  {item.productName || "Sản phẩm"}
                                </p>
                                {item.variantName && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Phân loại: {item.variantName}
                                  </p>
                                )}
                                <p className="text-sm font-medium mt-1 sm:hidden">
                                  {(
                                    item.price ?? item.unitPrice * item.quantity
                                  ).toLocaleString("vi-VN")}
                                  ₫
                                </p>
                              </div>
                            </div>
                            <div className="hidden sm:flex flex-col items-end justify-center shrink-0">
                              <p className="text-foreground font-semibold">
                                {(
                                  item.price ?? item.unitPrice * item.quantity
                                ).toLocaleString("vi-VN")}
                                ₫
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Số lượng: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
