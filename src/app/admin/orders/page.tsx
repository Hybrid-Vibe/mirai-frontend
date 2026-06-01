"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/api-client";
import {
  AdminOrderListDto,
  AdminOrderDetailDto,
  AdminShippingDto,
  AdminOrderFilter,
} from "@/types/api";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Loader2,
  RefreshCw,
  X,
  Eye,
  Truck,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ShoppingBag,
  MoreHorizontal,
} from "lucide-react";
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

  // Bộ lọc nâng cao
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Xem chi tiết & Vận chuyển
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<AdminOrderDetailDto | null>(
    null,
  );
  const [shippingDetail, setShippingDetail] = useState<AdminShippingDto | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Form tạo vận đơn (Create Shipping)
  const [isCreateShippingOpen, setIsCreateShippingOpen] = useState(false);
  const [carrier, setCarrier] = useState("Giao Hàng Tiết Kiệm (GHTK)");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingFee, setShippingFee] = useState("30000");

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const filter: AdminOrderFilter = {};
      if (statusFilter !== "all") {
        filter.status = parseInt(statusFilter, 10);
      }
      if (paymentStatusFilter !== "all") {
        filter.paymentStatus = parseInt(paymentStatusFilter, 10);
      }
      if (searchTerm.trim() !== "") {
        filter.search = searchTerm.trim();
      }

      const data = await adminApi.getOrders(filter);
      setOrders(data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng từ Backend ❌");
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, paymentStatusFilter, searchTerm]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fetchOrders]);

  // Xem chi tiết đơn hàng và tải thông tin Vận chuyển (Shipping)
  const handleViewDetail = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setOrderDetail(null);
    setShippingDetail(null);
    setIsDetailOpen(true);
    setIsLoadingDetail(true);

    try {
      // 1. Tải chi tiết đơn hàng
      const detail = await adminApi.getOrderDetail(orderId);
      setOrderDetail(detail);

      // 2. Tải thông tin vận chuyển thực tế từ backend
      const shippings = await adminApi.getShippings({ orderId });
      if (shippings && shippings.length > 0) {
        setShippingDetail(shippings[0]); // Lấy vận đơn mới nhất của đơn hàng này
      }
    } catch (err) {
      console.error("Failed to fetch order or shipping details:", err);
      toast.error("Lỗi khi tải thông tin chi tiết đơn hàng! ❌");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = async (
    orderId: string,
    currentStatus: number,
  ) => {
    let nextStatus = currentStatus + 1;
    if (nextStatus > 4) nextStatus = 5;
    if (currentStatus === 5) nextStatus = 1;

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
      if (isDetailOpen && selectedOrderId === orderId) {
        handleViewDetail(orderId); // Tải lại chi tiết
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error(
        "Lỗi khi cập nhật trạng thái đơn hàng. Vui lòng thử lại! ❌",
        { id: updateToast },
      );
    }
  };

  // Cập nhật trạng thái thanh toán
  const handleUpdatePaymentStatus = async (
    orderId: string,
    currentPaymentStatus: number,
  ) => {
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
      if (isDetailOpen && selectedOrderId === orderId) {
        handleViewDetail(orderId); // Tải lại chi tiết
      }
    } catch (error) {
      console.error("Failed to update payment status:", error);
      toast.error(
        "Lỗi khi cập nhật trạng thái thanh toán. Vui lòng thử lại! ❌",
        { id: updateToast },
      );
    }
  };

  // Tạo mới Vận đơn (Create Shipping)
  const handleCreateShippingSubmit = async () => {
    if (!selectedOrderId) return;
    if (!trackingNumber.trim()) {
      toast.error("Vui lòng nhập Mã vận đơn! ⚠️");
      return;
    }

    const feeNum = parseFloat(shippingFee);
    if (isNaN(feeNum) || feeNum < 0) {
      toast.error("Phí vận chuyển phải là số hợp lệ! ⚠️");
      return;
    }

    const updateToast = toast.loading("Đang khởi tạo vận đơn giao hàng... ⏳");
    try {
      await adminApi.createShipping({
        orderId: selectedOrderId,
        carrier,
        trackingNumber: trackingNumber.trim(),
        shippingFee: feeNum,
        estimatedDelivery: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 3 ngày sau
      });

      toast.success("Khởi tạo vận đơn giao hàng thành công! 📦✨", {
        id: updateToast,
      });
      setIsCreateShippingOpen(false);

      // Chuyển luôn trạng thái đơn hàng sang "Đang giao (3)" để đồng bộ UI/UX
      if (orderDetail && orderDetail.status < 3) {
        await adminApi.updateOrderStatus(selectedOrderId, 3);
      }

      handleViewDetail(selectedOrderId); // Tải lại thông tin
      fetchOrders();
    } catch (err) {
      console.error("Failed to create shipping:", err);
      toast.error("Lỗi khi tạo vận đơn. Vui lòng thử lại! ❌", {
        id: updateToast,
      });
    }
  };

  // Cập nhật trạng thái Vận chuyển (Giao thành công)
  const handleUpdateShippingStatus = async (status: string) => {
    if (!shippingDetail) return;
    const actionText = status === "Delivered" ? "Xác nhận đã giao" : "Cập nhật";
    const updateToast = toast.loading(`Đang ${actionText.toLowerCase()}... ⏳`);

    try {
      await adminApi.updateShipping(shippingDetail.shippingId, {
        status,
        actualDelivery:
          status === "Delivered" ? new Date().toISOString() : undefined,
      });

      toast.success("Cập nhật trạng thái giao hàng thành công! 🎉", {
        id: updateToast,
      });

      // Nếu giao thành công, tự động chuyển đơn hàng sang trạng thái "Đã giao (4)"
      if (status === "Delivered" && selectedOrderId) {
        await adminApi.updateOrderStatus(selectedOrderId, 4);
      }

      if (selectedOrderId) {
        handleViewDetail(selectedOrderId);
      }
      fetchOrders();
    } catch (err) {
      console.error("Failed to update shipping:", err);
      toast.error("Lỗi khi cập nhật trạng thái vận đơn! ❌", {
        id: updateToast,
      });
    }
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setSearchTerm("");
    toast.success("Đã xóa bộ lọc! 🧹");
  };

  const isFiltered =
    statusFilter !== "all" ||
    paymentStatusFilter !== "all" ||
    searchTerm !== "";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/admin"
              className="hover:text-foreground transition-colors"
            >
              Admin
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold">Đơn hàng</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Quản lý Đơn hàng & Vận chuyển
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Theo dõi đơn hàng, quản lý quy trình giao nhận (Shipping) và thanh
            toán tích hợp API Backend.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchOrders}
            className="h-10 rounded-xl hover:border-primary/40 transition-all"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Làm mới dữ liệu
          </Button>
        </div>
      </div>

      {/* Tìm kiếm & Bộ lọc */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-background p-4 rounded-2xl border border-border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm theo số đơn, mã đơn hoặc tên khách hàng..."
              className="pl-10 h-10 rounded-xl border border-border bg-background outline-none focus-visible:ring-1 focus-visible:ring-primary w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button
              variant={showAdvancedFilters ? "default" : "outline"}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="h-10 rounded-xl transition-all"
            >
              <Filter className="h-4 w-4 mr-2" />
              Lọc nâng cao
            </Button>
            {isFiltered && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="h-10 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Xoá bộ lọc
              </Button>
            )}
          </div>
        </div>

        {/* Khối Bộ Lọc Nâng Cao */}
        {showAdvancedFilters && (
          <div className="grid gap-4 md:grid-cols-2 bg-muted/20 p-5 rounded-2xl border border-border shadow-inner animate-in slide-in-from-top-2 duration-250">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Trạng thái đơn hàng
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none cursor-pointer hover:border-primary/50 transition-all font-medium"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="1">Đã tạo</option>
                <option value="2">Đã xác nhận</option>
                <option value="3">Đang giao</option>
                <option value="4">Đã giao</option>
                <option value="5">Đã huỷ</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Trạng thái thanh toán
              </label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none cursor-pointer hover:border-primary/50 transition-all font-medium"
              >
                <option value="all">Tất cả thanh toán</option>
                <option value="1">Chưa thanh toán</option>
                <option value="2">Đã thanh toán</option>
                <option value="3">Thất bại</option>
                <option value="4">Đã hoàn tiền</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bảng đơn hàng */}
      <div className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[140px] font-semibold">Số Đơn</TableHead>
              <TableHead className="font-semibold">Khách Hàng</TableHead>
              <TableHead className="font-semibold">Ngày Đặt</TableHead>
              <TableHead className="font-semibold">Tổng Tiền</TableHead>
              <TableHead className="font-semibold">Trạng Thái Đơn</TableHead>
              <TableHead className="font-semibold">Thanh Toán</TableHead>
              <TableHead className="text-right font-semibold">
                Thao Tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="h-7 w-7 animate-spin text-primary mx-auto" />
                    <p className="text-xs text-muted-foreground animate-pulse">
                      Đang tải danh sách đơn hàng thực tế...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground font-medium"
                >
                  Không tìm thấy đơn hàng nào khớp với bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const statusInfo = ORDER_STATUS_MAP[order.status] ?? {
                  label: "Không rõ",
                  class: "bg-gray-100 text-gray-600 border-gray-200",
                };
                const payInfo = PAYMENT_STATUS_MAP[order.paymentStatus] ?? {
                  label: "Không rõ",
                  class: "bg-gray-100 text-gray-600 border-gray-200",
                };

                return (
                  <TableRow
                    key={order.orderId}
                    className="hover:bg-muted/10 transition-colors"
                  >
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
                        className="text-left active:scale-[0.98] transition-all duration-200 focus:outline-none"
                        title="Click để đổi sang trạng thái tiếp theo"
                      >
                        <Badge
                          variant="outline"
                          className={`cursor-pointer rounded-xl font-medium border px-2.5 py-0.5 shadow-sm transition-all hover:brightness-95 ${statusInfo.class}`}
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
                        className="text-left active:scale-[0.98] transition-all duration-200 focus:outline-none"
                        title="Click để chuyển đổi Đã thanh toán / Chưa thanh toán"
                      >
                        <Badge
                          variant="outline"
                          className={`cursor-pointer rounded-xl font-medium border px-2.5 py-0.5 shadow-sm transition-all hover:brightness-95 ${payInfo.class}`}
                        >
                          {payInfo.label}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-xl text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 outline-none transition-colors border border-transparent hover:border-border">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-xl border border-border shadow-md"
                        >
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                              Đơn hàng
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleViewDetail(order.orderId)}
                              className="cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateOrderStatus(
                                  order.orderId,
                                  order.status,
                                )
                              }
                              className="cursor-pointer"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Duyệt trạng thái
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog 1: Xem chi tiết đơn hàng & Vận chuyển (Shipping) */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Chi Tiết Đơn Hàng
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Thông tin người đặt, các sản phẩm phôi ốp đã mua, và chi tiết giao
              nhận (Shipping).
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">
                Đang tải chi tiết đơn hàng...
              </p>
            </div>
          ) : orderDetail ? (
            <div className="space-y-6 py-2">
              {/* Khối 1: Thông tin chung */}
              <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/60">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Mã đơn hàng
                  </span>
                  <span className="font-bold text-foreground text-sm">
                    {orderDetail.orderNumber ||
                      `ORD-${orderDetail.orderId.slice(0, 8).toUpperCase()}`}
                  </span>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Ngày đặt
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(orderDetail.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Khối 2: Thông tin khách hàng */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5" />
                  Thông tin khách hàng
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs bg-background p-3.5 rounded-xl border border-border/80">
                  <div>
                    <span className="text-muted-foreground block">
                      Họ và Tên
                    </span>
                    <span className="font-semibold text-foreground">
                      {orderDetail.userFullName || "Khách vãng lai"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Email</span>
                    <span className="font-semibold text-foreground select-all">
                      {orderDetail.userEmail || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">
                      Số điện thoại
                    </span>
                    <span className="font-semibold text-foreground">
                      {orderDetail.userPhone || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Khối 3: Danh sách sản phẩm mua */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Sản phẩm đã mua
                </h4>
                <div className="border border-border rounded-xl overflow-hidden shadow-inner">
                  <Table>
                    <TableHeader className="bg-muted/10 text-[10px]">
                      <TableRow>
                        <TableHead className="font-semibold py-2">
                          Sản phẩm / Dòng máy
                        </TableHead>
                        <TableHead className="font-semibold py-2 text-center">
                          Số lượng
                        </TableHead>
                        <TableHead className="font-semibold py-2 text-right">
                          Đơn giá
                        </TableHead>
                        <TableHead className="font-semibold py-2 text-right">
                          Thành tiền
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      {orderDetail.items &&
                        orderDetail.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium py-2">
                              <p className="font-semibold">
                                {item.productName || "Phôi ốp lưng MIRAI"}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {item.variantName || "-"}
                              </p>
                            </TableCell>
                            <TableCell className="text-center py-2">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right py-2">
                              {item.unitPrice.toLocaleString("vi-VN")}đ
                            </TableCell>
                            <TableCell className="text-right font-bold py-2">
                              {item.price.toLocaleString("vi-VN")}đ
                            </TableCell>
                          </TableRow>
                        ))}
                      <TableRow className="bg-muted/20 hover:bg-muted/20 font-bold">
                        <TableCell colSpan={3} className="text-right py-2.5">
                          Tổng cộng đơn hàng:
                        </TableCell>
                        <TableCell className="text-right text-sm text-primary py-2.5">
                          {orderDetail.totalAmount.toLocaleString("vi-VN")}đ
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Ghi chú đơn hàng */}
              {orderDetail.note && (
                <div className="bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-xl text-xs text-amber-600 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    ⚠️ Ghi chú của khách hàng:
                  </span>
                  <p>{orderDetail.note}</p>
                </div>
              )}

              {/* Khối 4: QUẢN LÝ VẬN CHUYỂN (SHIPPING) TÍCH HỢP backend */}
              <div className="border-t border-border/80 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                  <Truck className="w-3.5 h-3.5" />
                  Quản lý giao nhận (Shipping)
                </h4>

                {shippingDetail ? (
                  // Đã có thông tin vận đơn
                  <div className="bg-background p-4 rounded-xl border border-border space-y-3 shadow-sm">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground block">
                          Đơn vị vận chuyển
                        </span>
                        <span className="font-semibold text-foreground text-sm">
                          {shippingDetail.carrier || "Chưa rõ"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">
                          Mã vận đơn (Tracking No.)
                        </span>
                        <span className="font-semibold text-foreground text-sm select-all">
                          {shippingDetail.trackingNumber || "Chưa có"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                      <div>
                        <span className="text-muted-foreground block">
                          Phí giao hàng
                        </span>
                        <span className="font-semibold text-foreground">
                          {shippingDetail.shippingFee.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">
                          Trạng thái vận chuyển
                        </span>
                        <Badge
                          className={`rounded-xl mt-0.5 ${
                            shippingDetail.status === "Delivered"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : shippingDetail.status === "Shipped"
                                ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          }`}
                        >
                          {shippingDetail.status === "Delivered"
                            ? "Đã giao thành công"
                            : shippingDetail.status === "Shipped"
                              ? "Đang trên đường giao"
                              : "Đang chờ xử lý"}
                        </Badge>
                      </div>
                    </div>

                    {/* Các nút cập nhật nhanh trạng thái giao hàng */}
                    {shippingDetail.status !== "Delivered" && (
                      <div className="flex gap-2 pt-2">
                        {shippingDetail.status !== "Shipped" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateShippingStatus("Shipped")
                            }
                            className="rounded-xl h-8 text-xs flex-1"
                          >
                            Xác nhận đang giao hàng
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateShippingStatus("Delivered")
                          }
                          className="rounded-xl h-8 text-xs bg-green-600 hover:bg-green-700 flex-1 text-white"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Xác nhận giao thành công
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Chưa có thông tin vận đơn
                  <div className="bg-muted/10 border border-dashed border-border/80 p-5 rounded-xl text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground">
                        Chưa khởi tạo vận đơn giao hàng
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Vui lòng tạo vận đơn giao hàng để khách hàng có thể theo
                        dõi hành trình đơn hàng.
                      </p>
                    </div>
                    {orderDetail.status >= 2 && orderDetail.status < 5 ? (
                      <Button
                        size="sm"
                        onClick={() => setIsCreateShippingOpen(true)}
                        className="rounded-xl h-9 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Khởi tạo vận đơn giao hàng
                      </Button>
                    ) : (
                      <p className="text-[10px] text-amber-500 font-medium">
                        ⚠️ Vui lòng duyệt đơn hàng sang trạng thái &quot;Đã xác
                        nhận&quot; trước khi tạo vận đơn.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground text-xs">
              Không tìm thấy thông tin đơn hàng này.
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setIsDetailOpen(false)}
              className="rounded-xl w-full"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Form Tạo mới Vận đơn (Create Shipping) */}
      <Dialog
        open={isCreateShippingOpen}
        onOpenChange={setIsCreateShippingOpen}
      >
        <DialogContent className="sm:max-w-[420px] rounded-2xl border border-border bg-background p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Khởi Tạo Vận Đơn
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Nhập thông tin đối tác giao nhận để bắt đầu giao hàng cho khách.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase block">
                Đơn vị vận chuyển *
              </label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm outline-none cursor-pointer hover:border-primary/50 transition-all font-medium"
              >
                <option value="Giao Hàng Tiết Kiệm (GHTK)">
                  Giao Hàng Tiết Kiệm (GHTK)
                </option>
                <option value="Giao Hàng Nhanh (GHN)">
                  Giao Hàng Nhanh (GHN)
                </option>
                <option value="Viettel Post">Viettel Post</option>
                <option value="VNPost (Bưu điện Việt Nam)">
                  VNPost (Bưu điện Việt Nam)
                </option>
                <option value="GrabExpress / J&T Express">
                  GrabExpress / J&T Express
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase block">
                Mã vận đơn (Tracking Code) *
              </label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Ví dụ: GHTK102938475"
                className="rounded-xl border border-border bg-background h-11 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase block">
                Phí giao hàng (VNĐ) *
              </label>
              <Input
                type="number"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                placeholder="Ví dụ: 30000"
                className="rounded-xl border border-border bg-background h-11 font-medium"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCreateShippingOpen(false)}
              className="rounded-xl flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateShippingSubmit}
              className="rounded-xl flex-1"
            >
              Tạo vận đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
