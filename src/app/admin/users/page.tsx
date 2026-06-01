"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api-client";
import { GetUserDto, AdminUserFilter } from "@/types/api";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
  MoreHorizontal,
  Filter,
  Download,
  Loader2,
  X,
  User,
  Shield,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<GetUserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bộ lọc nâng cao
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Các States cho Dialogs
  const [selectedUser, setSelectedUser] = useState<GetUserDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [newRoleId, setNewRoleId] = useState<string>("3");

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const filter: AdminUserFilter = {};

      if (roleFilter !== "all") {
        filter.roleId = roleFilter;
      }

      if (statusFilter !== "all") {
        filter.isActive = statusFilter === "active";
      }

      if (searchTerm.trim() !== "") {
        filter.search = searchTerm.trim();
      }

      // Gọi API Admin để hỗ trợ phân quyền và lọc tốt nhất
      const data = await adminApi.getUsers(filter);
      setUsers(data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách tài khoản ");
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fetchUsers]);

  // Xem chi tiết tài khoản
  const handleViewDetails = async (user: GetUserDto) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
    if (user.userId) {
      try {
        const detail = await adminApi.getUserById(user.userId);
        setSelectedUser(detail);
      } catch (err) {
        console.error("Error loading user details:", err);
      }
    }
  };

  // Khóa / Mở khóa tài khoản
  const handleToggleStatus = async (user: GetUserDto) => {
    if (!user.userId) return;

    const nextStatus = !user.isActive;
    const actionText = nextStatus ? "Mở khóa" : "Khóa";
    const updateToast = toast.loading(
      `Đang ${actionText.toLowerCase()} tài khoản... `,
    );

    try {
      await adminApi.updateUserStatus(user.userId, { isActive: nextStatus });
      toast.success(`${actionText} tài khoản thành công! `, {
        id: updateToast,
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to toggle user status:", error);
      toast.error(
        `Lỗi khi ${actionText.toLowerCase()} tài khoản. Vui lòng thử lại! `,
        {
          id: updateToast,
        },
      );
    }
  };

  // Mở Dialog phân quyền
  const handleOpenRoleDialog = (user: GetUserDto) => {
    setSelectedUser(user);
    setNewRoleId(user.roleId || "3");
    setIsRoleOpen(true);
  };

  // Thực hiện phân quyền
  const handleUpdateRole = async () => {
    if (!selectedUser?.userId) return;

    const roleName =
      newRoleId === "1" ? "Admin" : newRoleId === "2" ? "Staff" : "Customer";
    const updateToast = toast.loading(
      `Đang chuyển quyền sang ${roleName}... `,
    );

    try {
      await adminApi.updateUserRole(selectedUser.userId, { roleId: newRoleId });
      toast.success(`Cập nhật vai trò sang ${roleName} thành công! `, {
        id: updateToast,
      });
      setIsRoleOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error("Lỗi khi phân quyền người dùng. Vui lòng thử lại! ", {
        id: updateToast,
      });
    }
  };

  const handleClearFilters = () => {
    setRoleFilter("all");
    setStatusFilter("all");
    setSearchTerm("");
    toast.success("Đã xóa bộ lọc người dùng! 🧹");
  };

  const isFiltered =
    roleFilter !== "all" || statusFilter !== "all" || searchTerm !== "";

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
            <BreadcrumbPage className="font-semibold">Tài khoản</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Quản lý Người Dùng
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Xem thông tin chi tiết, khóa/mở khóa tài khoản và phân quyền quản
            trị viên, nhân viên.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-10 rounded-xl hover:border-primary/40 transition-all"
        >
          <Download className="h-4 w-4 mr-2" />
          Xuất dữ liệu Excel
        </Button>
      </div>

      {/* Thanh Tìm kiếm & Lọc */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-background p-4 rounded-2xl border border-border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm theo tên khách hàng, email hoặc số điện thoại..."
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

        {/* Bộ lọc nâng cao */}
        {showAdvancedFilters && (
          <div className="grid gap-4 md:grid-cols-2 bg-muted/20 p-5 rounded-2xl border border-border shadow-inner animate-in slide-in-from-top-2 duration-250">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Vai trò (Quyền hạn)
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none cursor-pointer hover:border-primary/50 transition-all font-medium"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="1">Admin (Quản trị)</option>
                <option value="2">Staff (Nhân viên)</option>
                <option value="3">Customer (Khách hàng)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Trạng thái hoạt động
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none cursor-pointer hover:border-primary/50 transition-all font-medium"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động (Active)</option>
                <option value="inactive">Đang bị khóa (Banned)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-semibold">Người Dùng</TableHead>
              <TableHead className="font-semibold">Số Điện Thoại</TableHead>
              <TableHead className="font-semibold">Vai Trò</TableHead>
              <TableHead className="font-semibold">Ngày Tham Gia</TableHead>
              <TableHead className="font-semibold">Trạng Thái</TableHead>
              <TableHead className="text-right font-semibold">
                Thao Tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="h-7 w-7 animate-spin text-primary mx-auto" />
                    <p className="text-xs text-muted-foreground animate-pulse">
                      Đang tải danh sách người dùng từ hệ thống...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground font-medium"
                >
                  Không tìm thấy người dùng nào.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.userId}
                  className="hover:bg-muted/10 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName || "U"}`}
                          alt={user.fullName || "User"}
                        />
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                          {user.fullName?.slice(0, 2).toUpperCase() || "US"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-sm">
                          {user.fullName || "Chưa cập nhật"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.email || "Không có email"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-sm text-foreground/80">
                    {user.phone || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`rounded-xl px-2 py-0.5 text-xs font-semibold ${
                        user.roleId === "1"
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : user.roleId === "2"
                            ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                            : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      }`}
                    >
                      {user.roleName ||
                        (user.roleId === "1"
                          ? "Admin"
                          : user.roleId === "2"
                            ? "Staff"
                            : "Customer")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? "default" : "secondary"}
                      className={`rounded-xl px-2.5 py-0.5 border ${
                        user.isActive
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15"
                          : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/15"
                      }`}
                    >
                      {user.isActive ? "Hoạt động" : "Bị khóa"}
                    </Badge>
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
                            Tài khoản
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(user)}
                            className="cursor-pointer"
                          >
                            <User className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenRoleDialog(user)}
                            className="cursor-pointer"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Phân quyền
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user)}
                          className={`cursor-pointer ${user.isActive ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"}`}
                        >
                          {user.isActive ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Khóa tài khoản
                            </>
                          ) : (
                            <>
                              <Unlock className="w-4 h-4 mr-2" />
                              Mở khóa
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog 1: Xem chi tiết tài khoản */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl border border-border bg-background p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Chi Tiết Người Dùng
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Thông tin đầy đủ của tài khoản trên hệ thống MIRAI.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-border/60">
                <Avatar className="h-14 w-14 border border-border">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.fullName || "U"}`}
                  />
                  <AvatarFallback className="text-lg font-bold">
                    {selectedUser.fullName?.slice(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="font-bold text-lg text-foreground leading-tight">
                    {selectedUser.fullName || "Chưa cập nhật"}
                  </h4>
                  <Badge
                    variant="outline"
                    className={`rounded-xl px-2 py-0.5 text-xs font-semibold ${
                      selectedUser.roleId === "1"
                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                        : selectedUser.roleId === "2"
                          ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                          : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    }`}
                  >
                    {selectedUser.roleName ||
                      (selectedUser.roleId === "1"
                        ? "Admin"
                        : selectedUser.roleId === "2"
                          ? "Staff"
                          : "Customer")}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground w-24">
                    Email:
                  </span>
                  <span className="font-semibold select-all">
                    {selectedUser.email || "Không có email"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground w-24">
                    Số điện thoại:
                  </span>
                  <span className="font-semibold">
                    {selectedUser.phone || "-"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground w-24">
                    Ngày tham gia:
                  </span>
                  <span className="font-semibold">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString(
                          "vi-VN",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground w-24">
                    Trạng thái:
                  </span>
                  <span
                    className={`font-semibold ${selectedUser.isActive ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {selectedUser.isActive ? "Đang hoạt động" : "Đã bị khóa"}
                  </span>
                </div>
              </div>
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

      {/* Dialog 2: Phân quyền tài khoản */}
      <Dialog open={isRoleOpen} onOpenChange={setIsRoleOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl border border-border bg-background p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Phân Quyền Người Dùng
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Thay đổi vai trò quản lý của tài khoản{" "}
              <strong>{selectedUser?.fullName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Chọn vai trò mới
              </label>
              <select
                value={newRoleId}
                onChange={(e) => setNewRoleId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm outline-none cursor-pointer hover:border-primary/50 transition-all font-medium"
              >
                <option value="3">Customer (Khách hàng thông thường)</option>
                <option value="2">Staff (Nhân viên hệ thống)</option>
                <option value="1">Admin (Quản trị viên cấp cao)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsRoleOpen(false)}
              className="rounded-xl flex-1"
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateRole} className="rounded-xl flex-1">
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
