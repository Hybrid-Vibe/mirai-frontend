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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Plus, Filter } from "lucide-react";

// Mock data
const mockProducts = [
  { id: "PROD-001", name: "iPhone 15 Pro Max Case", category: "Apple", price: "120.000đ", stock: 150, status: "Đang bán" },
  { id: "PROD-002", name: "iPhone 15 Pro Case", category: "Apple", price: "120.000đ", stock: 85, status: "Đang bán" },
  { id: "PROD-003", name: "Samsung S24 Ultra Case", category: "Samsung", price: "120.000đ", stock: 0, status: "Hết hàng" },
  { id: "PROD-004", name: "iPhone 14 Pro Max Case", category: "Apple", price: "100.000đ", stock: 45, status: "Đang bán" },
  { id: "PROD-005", name: "Oppo Reno 10 Case", category: "Oppo", price: "90.000đ", stock: 12, status: "Sắp hết" },
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Quản lý Sản phẩm</h1>
          <p className="text-muted-foreground mt-1">Quản lý danh sách phôi ốp và dòng máy hỗ trợ.</p>
        </div>
        <Button className="h-10">
          <Plus className="h-4 w-4 mr-2" />
          Thêm Sản Phẩm Mới
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-background p-4 rounded-lg border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm tên sản phẩm hoặc mã..."
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
              <TableHead className="w-[100px]">Mã SP</TableHead>
              <TableHead>Tên Sản Phẩm</TableHead>
              <TableHead>Dòng Máy</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Tồn Kho</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-muted-foreground">{product.id}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      product.status === "Đang bán" ? "default" :
                      product.status === "Sắp hết" ? "secondary" : "destructive"
                    }
                    className={
                      product.status === "Đang bán" ? "bg-green-500 hover:bg-green-600" :
                      product.status === "Sắp hết" ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""
                    }
                  >
                    {product.status}
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
                        <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuItem>Ẩn sản phẩm</DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Xóa</DropdownMenuItem>
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
