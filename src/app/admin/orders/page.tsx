"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { Search, MoreHorizontal, Filter } from "lucide-react";

// Mock data
const mockOrders = [
  {
    id: "ORD-7234",
    customer: "Nguyễn Văn A",
    email: "nva@email.com",
    date: "2026-05-01",
    total: "240.000đ",
    status: "Hoàn thành",
  },
  {
    id: "ORD-7235",
    customer: "Trần Thị B",
    email: "ttb@email.com",
    date: "2026-05-01",
    total: "120.000đ",
    status: "Đang xử lý",
  },
  {
    id: "ORD-7236",
    customer: "Lê Văn C",
    email: "lvc@email.com",
    date: "2026-04-30",
    total: "360.000đ",
    status: "Đã hủy",
  },
  {
    id: "ORD-7237",
    customer: "Phạm D",
    email: "pd@email.com",
    date: "2026-04-30",
    total: "120.000đ",
    status: "Hoàn thành",
  },
  {
    id: "ORD-7238",
    customer: "Hoàng E",
    email: "he@email.com",
    date: "2026-04-29",
    total: "480.000đ",
    status: "Đang giao",
  },
];

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Quản lý Đơn hàng
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi và cập nhật trạng thái các đơn hàng.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-background p-4 rounded-lg border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm theo mã đơn hoặc tên khách..."
            className="pl-9 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-9">
          <Filter className="h-4 w-4 mr-2" />
          Lọc
        </Button>
      </div>

      <div className="rounded-md border border-border bg-background shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Mã Đơn</TableHead>
              <TableHead>Khách Hàng</TableHead>
              <TableHead>Ngày Đặt</TableHead>
              <TableHead>Tổng Tiền</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.customer}</span>
                    <span className="text-xs text-muted-foreground">
                      {order.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === "Hoàn thành"
                        ? "default"
                        : order.status === "Đang xử lý"
                          ? "secondary"
                          : order.status === "Đang giao"
                            ? "outline"
                            : "destructive"
                    }
                    className={
                      order.status === "Hoàn thành"
                        ? "bg-green-500 hover:bg-green-600"
                        : order.status === "Đang xử lý"
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : ""
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 outline-none">
                      <span className="sr-only">Mở menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                        <DropdownMenuItem>Cập nhật trạng thái</DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        Hủy đơn
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
