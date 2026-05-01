"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Filter, Download } from "lucide-react";

// Mock data
const mockUsers = [
  { id: "USR-001", name: "Nguyễn Văn A", email: "nva@email.com", phone: "0901234567", joinDate: "2026-01-15", orders: 12, status: "Active" },
  { id: "USR-002", name: "Trần Thị B", email: "ttb@email.com", phone: "0912345678", joinDate: "2026-02-20", orders: 5, status: "Active" },
  { id: "USR-003", name: "Lê Văn C", email: "lvc@email.com", phone: "0923456789", joinDate: "2026-03-05", orders: 0, status: "Inactive" },
  { id: "USR-004", name: "Phạm D", email: "pd@email.com", phone: "0934567890", joinDate: "2026-04-10", orders: 2, status: "Active" },
  { id: "USR-005", name: "Hoàng E", email: "he@email.com", phone: "0945678901", joinDate: "2026-05-01", orders: 1, status: "Banned" },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Quản lý Khách hàng</h1>
          <p className="text-muted-foreground mt-1">Quản lý thông tin và tài khoản của người dùng.</p>
        </div>
        <Button variant="outline" className="h-10">
          <Download className="h-4 w-4 mr-2" />
          Xuất dữ liệu
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-background p-4 rounded-lg border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm tên khách hàng, email hoặc SĐT..."
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
              <TableHead>Khách Hàng</TableHead>
              <TableHead>Số Điện Thoại</TableHead>
              <TableHead>Ngày Tham Gia</TableHead>
              <TableHead>Số Đơn Hàng</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
                      <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.joinDate}</TableCell>
                <TableCell>{user.orders}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      user.status === "Active" ? "default" :
                      user.status === "Inactive" ? "secondary" : "destructive"
                    }
                    className={
                      user.status === "Active" ? "bg-green-500 hover:bg-green-600" : ""
                    }
                  >
                    {user.status}
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
                        <DropdownMenuItem>Xem lịch sử đơn hàng</DropdownMenuItem>
                        <DropdownMenuItem>Gửi email</DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Khóa tài khoản</DropdownMenuItem>
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
