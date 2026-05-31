"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Package,
  TrendingUp,
  Users,
  Info,
  Loader2,
} from "lucide-react";
import { adminApi } from "@/lib/api-client";
import type { AdminDashboardDto, AdminRevenueChartDto } from "@/types/api";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminDashboardDto | null>(null);
  const [revenueChart, setRevenueChart] = useState<AdminRevenueChartDto | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>("week");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [sumData, chartData] = await Promise.all([
          adminApi.getDashboardSummary(),
          adminApi.getRevenueChart(period),
        ]);
        setSummary(sumData);
        setRevenueChart(chartData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        toast.error("Không thể kết nối dữ liệu từ Backend ❌");
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [period]);

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="h-10 w-10 animate-spin text-(--mirai-sem-primary) mx-auto" />
          <p className="text-muted-foreground text-sm">
            Đang tải dữ liệu tổng quan...
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Admin</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tổng quan</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Tổng quan
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi hoạt động kinh doanh thời gian thực của MIRAI
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-9 px-3 rounded-md border border-border bg-background text-sm outline-none cursor-pointer hover:border-primary/50"
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stat Cards */}
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Tổng doanh thu
            </h3>
            <span className="p-2 bg-primary/10 rounded-full">
              <span className="font-brand text-primary font-bold text-xs">
                ₫
              </span>
            </span>
          </div>
          <div className="text-2xl font-bold">
            {totalRevenue.toLocaleString("vi-VN")}đ
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-green-500 flex items-center font-medium">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> +20.1%
            </span>
            so với tháng trước
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Người dùng hệ thống
            </h3>
            <span className="p-2 bg-blue-500/10 rounded-full">
              <Users className="h-4 w-4 text-blue-500" />
            </span>
          </div>
          <div className="text-2xl font-bold">
            {totalUsers.toLocaleString("vi-VN")}
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-muted-foreground flex items-center font-medium">
              Đang hoạt động: {summary?.activeUsers ?? totalUsers}
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Tổng Đơn Hàng
            </h3>
            <span className="p-2 bg-orange-500/10 rounded-full">
              <Package className="h-4 w-4 text-orange-500" />
            </span>
          </div>
          <div className="text-2xl font-bold">
            {totalOrders.toLocaleString("vi-VN")}
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-amber-500 flex items-center font-medium">
              Chờ xử lý: {summary?.pendingOrders ?? 0}
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium flex items-center gap-1">
              Sản phẩm Đang Bán
              <Tooltip>
                <TooltipTrigger className="text-muted-foreground hover:text-foreground cursor-help">
                  <Info className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Số lượng sản phẩm ở trạng thái active</p>
                </TooltipContent>
              </Tooltip>
            </h3>
            <span className="p-2 bg-green-500/10 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </span>
          </div>
          <div className="text-2xl font-bold">{activeProducts}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-muted-foreground flex items-center font-medium">
              Chờ duyệt đánh giá: {summary?.pendingReviews ?? 0}
            </span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart point visualization */}
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm lg:col-span-4 min-h-[400px] flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-lg">Biểu đồ doanh thu</h3>
            <p className="text-xs text-muted-foreground">
              Doanh thu thống kê theo{" "}
              {period === "week"
                ? "các ngày trong tuần"
                : period === "month"
                  ? "các tuần trong tháng"
                  : "các tháng trong năm"}
            </p>
          </div>

          <div className="h-64 flex items-end gap-3 pt-6 border-b border-border">
            {revenueChart?.data && revenueChart.data.length > 0 ? (
              revenueChart.data.map((point, index) => {
                const maxRevenue = Math.max(
                  ...revenueChart.data.map((p) => p.revenue),
                  1,
                );
                const heightPercent = Math.max(
                  (point.revenue / maxRevenue) * 100,
                  8,
                ); // Minimum 8% height so it's always visible
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
                  >
                    <div className="relative w-full flex justify-center">
                      <div className="absolute bottom-full mb-1 bg-neutral-900 text-white text-[10px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 font-medium">
                        {point.revenue.toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-(--mirai-sem-primary)/40 to-(--mirai-sem-primary) hover:from-(--mirai-sem-primary) hover:to-[#48E1ED] rounded-t transition-all duration-300 shadow-sm"
                    />
                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                      {point.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                Không có dữ liệu biểu đồ
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-6 shadow-sm lg:col-span-3 min-h-[400px]">
          <h3 className="font-semibold mb-4">Các khoản thanh toán mới</h3>
          <div className="space-y-4">
            {summary?.totalPayments && summary.totalPayments > 0 ? (
              <div className="space-y-4">
                <div className="p-3 bg-muted/20 border border-dashed rounded-lg text-xs text-muted-foreground flex gap-2">
                  <Info className="w-4 h-4 text-primary flex-shrink-0" />
                  Hệ thống ghi nhận có {summary.totalPayments} giao dịch thanh
                  toán. Vui lòng chuyển qua trang Đơn hàng hoặc Thanh toán để
                  xem chi tiết.
                </div>
              </div>
            ) : (
              [1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border-b border-border/50 pb-2 last:border-0 last:pb-0"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-medium text-xs text-primary">
                    {`KH${i}`}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Khách hàng {i}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      khachhang{i}@email.com
                    </p>
                  </div>
                  <div className="font-medium text-sm">
                    {(1250000 - i * 150000).toLocaleString("vi-VN")}đ
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
