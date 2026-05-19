"use client";

import { ArrowUpRight, Package, TrendingUp, Users, Info } from "lucide-react";
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

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
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

      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Tổng quan
        </h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi hoạt động kinh doanh của MIRAI
        </p>
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
          <div className="text-2xl font-bold">125.400.000đ</div>
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
              Khách hàng mới
            </h3>
            <span className="p-2 bg-blue-500/10 rounded-full">
              <Users className="h-4 w-4 text-blue-500" />
            </span>
          </div>
          <div className="text-2xl font-bold">+2350</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-green-500 flex items-center font-medium">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> +180.1%
            </span>
            so với tháng trước
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Đơn hàng</h3>
            <span className="p-2 bg-orange-500/10 rounded-full">
              <Package className="h-4 w-4 text-orange-500" />
            </span>
          </div>
          <div className="text-2xl font-bold">+12,234</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-green-500 flex items-center font-medium">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> +19%
            </span>
            so với tháng trước
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium flex items-center gap-1">
              Tỷ lệ chuyển đổi
              <Tooltip>
                <TooltipTrigger className="text-muted-foreground hover:text-foreground cursor-help">
                  <Info className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tỷ lệ giữa số lượng đơn hàng trên lượt truy cập</p>
                </TooltipContent>
              </Tooltip>
            </h3>
            <span className="p-2 bg-green-500/10 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </span>
          </div>
          <div className="text-2xl font-bold">4.3%</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-green-500 flex items-center font-medium">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> +1.2%
            </span>
            so với tuần trước
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm lg:col-span-4 min-h-[400px]">
          <h3 className="font-semibold mb-4">Biểu đồ doanh thu</h3>
          <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
            [Chart Area Placeholder]
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-6 shadow-sm lg:col-span-3 min-h-[400px]">
          <h3 className="font-semibold mb-4">Đơn hàng gần đây</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
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
                <div className="font-medium text-sm">+1.250.000đ</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
