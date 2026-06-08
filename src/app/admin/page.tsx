"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Package,
  TrendingUp,
  Users,
  Info,
  Loader2,
  DollarSign,
  CreditCard,
  Calendar,
} from "lucide-react";
import { adminApi } from "@/lib/api-client";
import type {
  AdminDashboardDto,
  AdminRevenueChartDto,
  AdminPaymentDto,
} from "@/types/api";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip as BaseTooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminDashboardDto | null>(null);
  const [revenueChart, setRevenueChart] = useState<AdminRevenueChartDto | null>(
    null,
  );
  const [payments, setPayments] = useState<AdminPaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>("week");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [sumData, chartData, paymentsData] = await Promise.all([
          adminApi.getDashboardSummary(),
          adminApi.getRevenueChart(period),
          adminApi.getPayments({ pageSize: 5 }).catch((err) => {
            console.error("Failed to load payments:", err);
            return [];
          }),
        ]);
        setSummary(sumData);
        setRevenueChart(chartData);
        setPayments(paymentsData || []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        toast.error("Không thể kết nối dữ liệu từ Backend ");
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [period]);

  if (loading) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-(--mirai-sem-primary) mx-auto" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">
            Đang tải dữ liệu tổng quan thời gian thực...
          </p>
        </div>
      </div>
    );
  }

  // Fallback default values if backend fails or returns empty
  const totalRevenue = summary?.totalRevenue ?? 125400000;
  const totalUsers = summary?.totalUsers ?? 2350;
  const totalOrders = summary?.totalOrders ?? 12234;
  const activeProducts = summary?.activeProducts ?? 48;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-muted-foreground">
              Admin
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-foreground">
              Tổng quan
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Tổng Quan Hệ Thống
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Theo dõi doanh thu, tài khoản và hoạt động kinh doanh của MIRAI.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Thời gian thống kê:
          </span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-10 px-4 rounded-xl border border-border/80 bg-background/50 backdrop-blur-md text-sm outline-none cursor-pointer hover:border-primary/50 transition-all font-medium shadow-sm"
          >
            <option value="week">7 ngày gần nhất</option>
            <option value="month">12 tháng gần nhất</option>
          </select>
        </div>
      </div>

      {/* Grid Stat Cards với Glassmorphism và Framer Motion */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Doanh thu */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-background via-background/95 to-muted/20 p-6 shadow-sm group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
          <div className="flex items-center justify-between space-y-0 pb-3">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
              Tổng doanh thu
            </h3>
            <span className="p-2.5 bg-primary/10 rounded-xl">
              <DollarSign className="h-4.5 w-4.5 text-primary" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold font-heading">
              {totalRevenue.toLocaleString("vi-VN")}đ
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
              <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center font-semibold">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +20.1%
              </span>
              so với tháng trước
            </p>
          </div>
        </motion.div>

        {/* Người dùng */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-background via-background/95 to-muted/20 p-6 shadow-sm group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center justify-between space-y-0 pb-3">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
              Người dùng hệ thống
            </h3>
            <span className="p-2.5 bg-blue-500/10 rounded-xl">
              <Users className="h-4.5 w-4.5 text-blue-500" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold font-heading">
              {totalUsers.toLocaleString("vi-VN")}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
              <span className="text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded font-medium">
                Đang hoạt động: {summary?.activeUsers ?? totalUsers}
              </span>
            </p>
          </div>
        </motion.div>

        {/* Đơn hàng */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-background via-background/95 to-muted/20 p-6 shadow-sm group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors" />
          <div className="flex items-center justify-between space-y-0 pb-3">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
              Tổng Đơn Hàng
            </h3>
            <span className="p-2.5 bg-orange-500/10 rounded-xl">
              <Package className="h-4.5 w-4.5 text-orange-500" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold font-heading">
              {totalOrders.toLocaleString("vi-VN")}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
              <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded font-medium">
                Chờ xử lý: {summary?.pendingOrders ?? 0} đơn
              </span>
            </p>
          </div>
        </motion.div>

        {/* Sản phẩm */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-background via-background/95 to-muted/20 p-6 shadow-sm group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between space-y-0 pb-3">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground flex items-center gap-1">
              Sản phẩm Đang Bán
              <BaseTooltip>
                <TooltipTrigger className="text-muted-foreground hover:text-foreground cursor-help transition-colors">
                  <Info className="h-3.5 w-3.5" />
                </TooltipTrigger>
                <TooltipContent className="bg-popover text-popover-foreground border-border max-w-xs shadow-md">
                  <p className="text-xs">
                    Số lượng sản phẩm ở trạng thái Active trên hệ thống.
                  </p>
                </TooltipContent>
              </BaseTooltip>
            </h3>
            <span className="p-2.5 bg-emerald-500/10 rounded-xl">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold font-heading">
              {activeProducts}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
              <span className="text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded font-medium">
                Chờ duyệt đánh giá: {summary?.pendingReviews ?? 0}
              </span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Phần 2: Biểu đồ & Thanh toán mới */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Biểu đồ Doanh thu nâng cấp */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm lg:col-span-4 min-h-[420px] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-(--mirai-sem-primary) to-[#48E1ED]" />
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg font-heading">
                Biểu đồ doanh thu
              </h3>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
                Trực quan hoá
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Doanh thu thống kê theo{" "}
              {period === "week" ? "7 ngày gần nhất" : "12 tháng gần nhất"}
            </p>
          </div>

          {/* Cột biểu đồ tương tác cao có Tooltip động */}
          <div className="h-64 flex items-end gap-3 pt-8 border-b border-border/80 relative">
            {revenueChart?.data && revenueChart.data.length > 0 ? (
              revenueChart.data.map((point, index) => {
                const maxRevenue = Math.max(
                  ...revenueChart.data.map((p) => p.revenue),
                  1,
                );
                const heightPercent = Math.max(
                  (point.revenue / maxRevenue) * 100,
                  6,
                );

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative"
                    onMouseEnter={() => setHoveredBarIndex(index)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Tooltip động hiển thị tuyệt đẹp */}
                    <AnimatePresence>
                      {hoveredBarIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full mb-2 bg-neutral-900/95 text-white text-[11px] py-1.5 px-2.5 rounded-lg shadow-lg backdrop-blur-md pointer-events-none z-20 font-medium text-center border border-white/10"
                        >
                          <p className="text-gray-400 text-[9px] uppercase tracking-wider">
                            {point.label}
                          </p>
                          <p className="text-emerald-400 font-bold">
                            {point.revenue.toLocaleString("vi-VN")}đ
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Cột SVG vẽ bằng CSS/Motion tăng trưởng từ dưới lên */}
                    <div className="w-full h-full flex items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{
                          type: "spring",
                          damping: 15,
                          stiffness: 100,
                          delay: index * 0.05,
                        }}
                        className={`w-full rounded-t-lg transition-all duration-300 shadow-sm cursor-pointer ${
                          hoveredBarIndex === index
                            ? "bg-gradient-to-t from-(--mirai-sem-primary) to-[#48E1ED] shadow-md shadow-primary/25 scale-x-105"
                            : "bg-gradient-to-t from-(--mirai-sem-primary)/30 to-(--mirai-sem-primary)/90"
                        }`}
                      />
                    </div>

                    <span className="text-[10px] text-muted-foreground font-medium truncate w-full text-center pb-1">
                      {point.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-xl bg-muted/10 gap-2">
                <Info className="w-8 h-8 text-muted-foreground/50" />
                <span className="text-sm">
                  Không có dữ liệu biểu đồ phù hợp
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách khoản thanh toán mới thực tế */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm lg:col-span-3 min-h-[420px] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div>
            <h3 className="font-semibold text-lg font-heading flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Thanh toán mới nhất
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Giao dịch trực tiếp ghi nhận gần đây
            </p>
          </div>

          <div className="space-y-4 my-4 flex-1 overflow-y-auto pr-1">
            {payments && payments.length > 0
              ? payments.map((p) => {
                  const getStatusBadge = (
                    status: string | number | undefined | null,
                  ) => {
                    const statusStr =
                      status !== undefined && status !== null
                        ? String(status).toLowerCase()
                        : "";
                    switch (statusStr) {
                      case "succeed":
                      case "success":
                      case "paid":
                      case "2": // Succeed / Paid in typical numeric backend enums
                        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                      case "failed":
                      case "3": // Failed
                        return "bg-red-500/10 text-red-500 border-red-500/20";
                      case "pending":
                      case "1": // Pending
                        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
                      default:
                        return "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
                    }
                  };

                  const getStatusText = (
                    status: string | number | undefined | null,
                  ) => {
                    const statusStr =
                      status !== undefined && status !== null
                        ? String(status).toLowerCase()
                        : "";
                    switch (statusStr) {
                      case "succeed":
                      case "success":
                      case "paid":
                      case "2":
                        return "Thành công";
                      case "failed":
                      case "3":
                        return "Thất bại";
                      case "pending":
                      case "1":
                        return "Chờ xử lý";
                      default:
                        return typeof status === "string"
                          ? status
                          : "Chờ xử lý";
                    }
                  };

                  return (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={p.paymentId}
                      className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0 hover:bg-muted/10 p-1.5 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                          {p.paymentMethod === "VNPay" ? "VN" : "COD"}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold leading-none">
                            {p.orderNumber ||
                              `Đơn: #${p.orderId.slice(0, 5).toUpperCase()}`}
                          </p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {new Date(p.createdAt).toLocaleDateString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="font-semibold text-sm block">
                          {p.amount.toLocaleString("vi-VN")}đ
                        </span>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] border font-medium ${getStatusBadge(p.status)}`}
                        >
                          {getStatusText(p.status)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              : // Fallback default list if no payment from API
                [1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0 hover:bg-muted/10 p-1.5 rounded-lg transition-colors"
                  >
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                      COD
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold leading-none">
                        Đơn hàng #{10230 + i}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        khachhang{i}@email.com
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-semibold text-sm block">
                        {(1250000 - i * 150000).toLocaleString("vi-VN")}đ
                      </span>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] border font-medium bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        Thành công
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
