"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api-client";
import { AdminOrderListDto } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2, RefreshCw } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ORDER_STATUS_MAP: Record<number, { label: string; class: string }> = {
  1: {
    label: "Đã tạo",
    class: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  2: {
    label: "Đã xác nhận",
    class: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  3: {
    label: "Đang giao",
    class: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  4: {
    label: "Đã giao",
    class: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  5: { label: "Đã huỷ", class: "bg-red-500/10 text-red-500 border-red-500/20" },
};

const PAYMENT_STATUS_MAP: Record<number, { label: string; class: string }> = {
  1: {
    label: "Chưa thanh toán",
    class: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  },
  2: {
    label: "Đã thanh toán",
    class: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  3: {
    label: "Thất bại",
    class: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  4: {
    label: "Đã hoàn tiền",
    class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<AdminOrderListDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      Promise.resolve().then(() => setIsLoading(true));
      const data = await adminApi.getOrders({});
      setOrders(data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng từ Backend ❌");
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (
    orderId: string,
    currentStatus: number,
  ) => {
    // Next logic status loop: 1 -> 2 -> 3 -> 4
    let nextStatus = currentStatus + 1;
    if (nextStatus > 4) nextStatus = 5; // allow cancellation or loop back
    if (currentStatus === 5) nextStatus = 1; // reset if cancelled

    const statusLabel = ORDER_STATUS_MAP[nextStatus]?.label || "Không rõ";
    const updateToast = toast.loading(
      `Đang cập nhật trạng thái đơn hàng sang ${statusLabel}... ⏳`,
    );

    try {
      await adminApi.updateOrderStatus(orderId, nextStatus);
      toast.success("Cập nhật trạng thái đơn hàng thành công! ✨", {
        id: updateToast,
      });
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error(
        "Lỗi khi cập nhật trạng thái đơn hàng. Vui lòng thử lại! ❌",
        { id: updateToast },
      );
    }
  };

  const handleUpdatePaymentStatus = async (
    orderId: string,
    currentPaymentStatus: number,
  ) => {
    // Alternate between unpaid (1) and paid (2)
    const nextPaymentStatus = currentPaymentStatus === 1 ? 2 : 1;
    const paymentLabel =
      PAYMENT_STATUS_MAP[nextPaymentStatus]?.label || "Không rõ";
    const updateToast = toast.loading(
      `Đang cập nhật trạng thái thanh toán sang ${paymentLabel}... ⏳`,
    );

    try {
      await adminApi.updateOrderPaymentStatus(orderId, nextPaymentStatus);
      toast.success("Cập nhật trạng thái thanh toán thành công! ✨", {
        id: updateToast,
      });
      fetchOrders();
    } catch (error) {
      console.error("Failed to update payment status:", error);
      toast.error(
        "Lỗi khi cập nhật trạng thái thanh toán. Vui lòng thử lại! ❌",
        { id: updateToast },
      );
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.userFullName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Đơn hàng</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Quản lý Đơn hàng
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi, cập nhật trạng thái giao hàng và thanh toán thời gian
            thực.
          </p>
        </div>
        <Button variant="outline" onClick={fetchOrders} className="h-10">
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Làm mới dữ liệu
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-background p-4 rounded-lg border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm theo số đơn, mã đơn hoặc tên khách..."
            className="pl-9 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-9">
          <Filter className="h-4 w-4 mr-2" />
          Lọc nâng cao
        </Button>
      </div>

      <div className="rounded-md border border-border bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Số Đơn</TableHead>
              <TableHead>Khách Hàng</TableHead>
              <TableHead>Ngày Đặt</TableHead>
              <TableHead>Tổng Tiền</TableHead>
              <TableHead>Trạng Thái Đơn</TableHead>
              <TableHead>Trạng Thái Thanh Toán</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Đang tải danh sách đơn hàng...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  Không tìm thấy đơn hàng nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const statusInfo = ORDER_STATUS_MAP[order.status] ?? {
                  label: "Không rõ",
                  class: "bg-gray-100 text-gray-600",
                };
                const payInfo = PAYMENT_STATUS_MAP[order.paymentStatus] ?? {
                  label: "Không rõ",
                  class: "bg-gray-100 text-gray-600",
                };

                return (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-semibold text-foreground">
                      {order.orderNumber ||
                        `ORD-${order.orderId.slice(0, 8).toUpperCase()}`}
                    </TableCell>
                    <TableCell className="font-medium">
                      {order.userFullName || "Khách vãng lai"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {order.totalAmount.toLocaleString("vi-VN")}đ
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateOrderStatus(order.orderId, order.status)
                        }
                        className="text-left active:scale-[0.98] transition-transform"
                        title="Click để đổi sang trạng thái tiếp theo"
                      >
                        <Badge
                          variant="outline"
                          className={`cursor-pointer ${statusInfo.class}`}
                        >
                          {statusInfo.label}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdatePaymentStatus(
                            order.orderId,
                            order.paymentStatus,
                          )
                        }
                        className="text-left active:scale-[0.98] transition-transform"
                        title="Click để chuyển đổi Đã thanh toán / Chưa thanh toán"
                      >
                        <Badge
                          variant="outline"
                          className={`cursor-pointer ${payInfo.class}`}
                        >
                          {payInfo.label}
                        </Badge>
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
