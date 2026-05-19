"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDesignStore } from "@/lib/store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  MapPin,
  CreditCard,
  Package,
  Trash2,
  Edit2,
  Plus,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { userApi, addressApi } from "@/lib/api-client";
import { GetUserDto } from "@/types/api";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function AccountPage() {
  const user = useDesignStore((state) => state.user);
  const [activeSection, setActiveSection] = useState("profile");
  const [orderFilter, setOrderFilter] = useState("all");

  const handleOrderSection = (filter: string) => {
    setActiveSection("orders");
    setOrderFilter(filter);
  };

  return (
    <main className="bg-background py-16">
      <div className="page-shell">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My Account</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-foreground">
            Welcome!{" "}
            <span className="font-semibold text-(--mirai-sem-danger)">
              {user?.name || "Guest"}
            </span>
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside>
            <h1 className="font-heading text-3xl font-semibold text-foreground hover:text-(--mirai-sem-danger) transition-colors">
              <Link href="/account">Quản Lý Tài Khoản</Link>
            </h1>
            <ul className="mt-5 space-y-2 text-base text-muted-foreground">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveSection("profile")}
                  className={`flex items-center gap-2 hover:text-foreground transition-colors ${
                    activeSection === "profile"
                      ? "font-semibold text-(--mirai-sem-danger)"
                      : ""
                  }`}
                >
                  Tài Khoản Của Tôi
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveSection("address")}
                  className={`flex items-center gap-2 hover:text-foreground transition-colors ${
                    activeSection === "address"
                      ? "font-semibold text-(--mirai-sem-danger)"
                      : ""
                  }`}
                >
                  Địa Chỉ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveSection("payment")}
                  className={`flex items-center gap-2 hover:text-foreground transition-colors ${
                    activeSection === "payment"
                      ? "font-semibold text-(--mirai-sem-danger)"
                      : ""
                  }`}
                >
                  Phương Thức Thanh Toán
                </button>
              </li>
            </ul>

            <h2 className="mt-8 font-heading text-2xl font-semibold text-foreground">
              <button
                type="button"
                onClick={() => handleOrderSection("all")}
                className={`hover:text-(--mirai-sem-danger) transition-colors ${
                  activeSection === "orders" && orderFilter === "all"
                    ? "text-(--mirai-sem-danger)"
                    : ""
                }`}
              >
                Đơn Hàng Của Tôi
              </button>
            </h2>
            <ul className="mt-5 space-y-2 text-base text-muted-foreground">
              {[
                "Đã đặt",
                "Đang sản xuất",
                "Đang giao",
                "Đã giao",
                "Đã huỷ",
              ].map((status) => (
                <li key={status}>
                  <button
                    onClick={() => handleOrderSection(status)}
                    className={`hover:text-foreground transition-colors ${
                      activeSection === "orders" && orderFilter === status
                        ? "text-foreground font-medium"
                        : ""
                    }`}
                  >
                    {status}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="rounded-[4px] border border-(--mirai-color-line) bg-card p-8 lg:p-10 min-h-[500px]">
            {activeSection === "profile" && <ProfileSection user={user} />}
            {activeSection === "address" && <AddressSection user={user} />}
            {activeSection === "payment" && <PaymentSection />}
            {activeSection === "orders" && (
              <OrdersSection key={orderFilter} initialFilter={orderFilter} />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function ProfileSection({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar_url?: string;
    id?: string;
  } | null;
}) {
  const [userData, setUserData] = useState<GetUserDto | null>(null);
  const [loading, setLoading] = useState(!!user?.id);

  useEffect(() => {
    if (user?.id) {
      // Avoid calling setLoading(true) if already true from initialization
      userApi
        .getUserById(user.id)
        .then((data) => setUserData(data))
        .catch((err) => console.error("Failed to fetch user:", err))
        .finally(() => setLoading(false));
    } else if (loading) {
      Promise.resolve().then(() => setLoading(false));
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-(--mirai-sem-primary)" />
      </div>
    );
  }

  if (!userData) return null;
  return (
    <ProfileForm
      key={userData.userId || userData.email}
      user={{
        name: userData.fullName || "User",
        email: userData.email || "",
        avatar_url: undefined, // Or map if available
        id: userData.userId,
      }}
    />
  );
}

function ProfileForm({
  user,
}: {
  user: { name: string; email: string; avatar_url?: string; id?: string };
}) {
  const [isEditing, setIsEditing] = useState(false);
  const parts = user.name?.split(" ") || [];
  const initialLastName = parts.length > 1 ? parts.pop() || "" : "";
  const initialFirstName = parts.join(" ");

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (password: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSave = () => {
    if (showPasswordChange) {
      if (newPassword !== confirmPassword) {
        setPasswordError("Mật khẩu xác nhận không khớp.");
        return;
      }
      if (!validatePassword(newPassword)) {
        setPasswordError(
          "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
        );
        return;
      }
    }

    setSaved(true);
    setIsEditing(false);
    setShowPasswordChange(false);
    setPasswordError("");
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold text-(--mirai-sem-danger)">
          Hồ Sơ Của Tôi
        </h2>
        <Button
          variant={isEditing ? "ghost" : "outline"}
          onClick={() => {
            if (isEditing) {
              setFirstName(initialFirstName);
              setLastName(initialLastName);
              setEmail(user.email);
              setShowPasswordChange(false);
              setPasswordError("");
            }
            setIsEditing(!isEditing);
          }}
        >
          {isEditing ? "Hủy" : "Chỉnh sửa"}
        </Button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Họ
              </label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!isEditing}
                placeholder="Nhập họ"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Tên
              </label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isEditing}
                placeholder="Nhập tên"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={true}
              placeholder="example@gmail.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Số điện thoại
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isEditing}
              placeholder="09xx xxx xxx"
            />
          </div>

          {/* Password Change Section */}
          <div className="pt-4">
            <Dialog
              open={showPasswordChange}
              onOpenChange={setShowPasswordChange}
            >
              <DialogTrigger
                render={
                  <Button
                    variant="outline"
                    className="text-(--mirai-sem-danger) border-(--mirai-sem-danger) hover:bg-red-50"
                  >
                    Thay đổi mật khẩu
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thay đổi mật khẩu</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Mật khẩu hiện tại
                    </label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Mật khẩu mới
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Xác nhận mật khẩu mới
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-500 font-medium">
                      {passwordError}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPasswordChange(false)}
                  >
                    Hủy
                  </Button>
                  <Button onClick={handleSave}>Lưu thay đổi</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isEditing && (
            <div className="pt-4">
              <Button
                className="w-full sm:w-auto bg-(--mirai-sem-danger) hover:bg-red-600"
                onClick={handleSave}
              >
                Lưu thay đổi
              </Button>
            </div>
          )}

          {saved && (
            <p className="text-sm font-medium text-green-600 animate-in fade-in slide-in-from-bottom-1">
              Cập nhật thành công!
            </p>
          )}
        </div>

        <div className="flex flex-col items-center space-y-4 border-l border-(--mirai-color-line) pl-10">
          <div className="group relative h-32 w-32 cursor-pointer overflow-hidden rounded-full ring-2 ring-red-100 ring-offset-2 transition-all hover:ring-red-400">
            <Avatar className="h-full w-full">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {user.name?.substring(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="text-xs font-medium text-white">Thay đổi</span>
            </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">
              Chọn ảnh đại diện mới
            </p>
          </div>
          <div className="w-full pt-4 space-y-2">
            <Button variant="outline" className="w-full">
              Đặt lại mật khẩu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Address {
  id: string;
  addressLine: string;
  phone: string;
  isDefault: boolean;
  rawDetails?: {
    addressLine: string;
    province: string;
    district: string;
    ward: string;
  };
}

interface LocationItem {
  code: number | string;
  name: string;
}

function AddressSection({
  user,
}: {
  user: { id: string; email: string; name: string } | null;
}) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [addressLine, setAddressLine] = useState("");
  const [phone, setPhone] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Provinces state
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [wards, setWards] = useState<LocationItem[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [phoneError, setPhoneError] = useState("");

  const [loading, setLoading] = useState(!!user?.id);

  const fetchAddresses = useMemo(
    () => async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const data = await addressApi.getAddressByUserId(user.id);
        setAddresses(
          data.map((addr) => ({
            id: addr.addressId,
            addressLine: addr.addressLine,
            phone: addr.recipientPhone || "",
            isDefault: addr.isDefault,
            rawDetails: {
              addressLine: addr.addressLine,
              province: addr.province || "",
              district: addr.district || "",
              ward: addr.ward || "",
            },
          })) as Address[],
        );
      } catch (err) {
        console.error("Error fetching addresses", err);
        toast.error("Không thể tải danh sách địa chỉ");
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    Promise.resolve().then(() => fetchAddresses());
  }, [fetchAddresses]);

  useEffect(() => {
    // Fetch provinces
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Error fetching provinces", err));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setDistricts(data.districts);
          setSelectedDistrict("");
          setSelectedWard("");
          setWards([]);
        })
        .catch((err) => console.error("Error fetching districts", err));
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setWards(data.wards);
          setSelectedWard("");
        })
        .catch((err) => console.error("Error fetching wards", err));
    }
  }, [selectedDistrict]);

  const validatePhone = (p: string) => {
    const regex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    return regex.test(p);
  };

  const handleSaveAddress = async () => {
    if (
      !addressLine ||
      !selectedProvince ||
      !selectedDistrict ||
      !selectedWard ||
      !user?.id
    )
      return;

    if (!validatePhone(phone)) {
      setPhoneError("Số điện thoại không hợp lệ.");
      return;
    }
    setPhoneError("");

    const pName =
      provinces.find((p) => p.code.toString() === selectedProvince)?.name || "";
    const dName =
      districts.find((d) => d.code.toString() === selectedDistrict)?.name || "";
    const wName =
      wards.find((w) => w.code.toString() === selectedWard)?.name || "";

    // In actual production, addressLine might be just the specific part
    const fullAddressLine = addressLine;

    try {
      if (editingId !== null) {
        await addressApi.updateAddress(editingId.toString(), {
          recipientName: user.name,
          recipientPhone: phone,
          addressLine: fullAddressLine,
          ward: wName,
          district: dName,
          city: pName, // City maps to Province name in some contexts
          province: pName,
          note: "",
        });
        toast.success("Đã cập nhật địa chỉ");
      } else {
        await addressApi.createAddress({
          userId: user.id,
          recipientName: user.name,
          recipientPhone: phone,
          addressLine: fullAddressLine,
          ward: wName,
          district: dName,
          city: pName,
          province: pName,
          note: "",
        });
        toast.success("Đã thêm địa chỉ mới");
      }
      fetchAddresses();
      resetForm();
    } catch (err) {
      console.error("Failed to save address", err);
      toast.error("Có lỗi xảy ra khi lưu địa chỉ");
    }
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    if (address.rawDetails) {
      setAddressLine(address.rawDetails.addressLine);
      setSelectedProvince(address.rawDetails.province);
      // Wait for effects to load districts/wards could be tricky here, but we set states.
      // A more robust implementation would fetch the specific nested areas, but for demo:
      setTimeout(() => {
        if (address.rawDetails)
          setSelectedDistrict(address.rawDetails.district);
      }, 500);
      setTimeout(() => {
        if (address.rawDetails) setSelectedWard(address.rawDetails.ward);
      }, 1000);
    } else {
      setAddressLine(address.addressLine);
    }
    setPhone(address.phone);
    setIsDefault(address.isDefault);
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setAddressLine("");
    setPhone("");
    setIsDefault(false);
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setPhoneError("");
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading text-2xl font-semibold text-(--mirai-sem-danger)">
          Địa Chỉ Của Bạn
        </h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="flex gap-2">
            <Plus className="w-4 h-4" /> Thêm địa chỉ mới
          </Button>
        )}
      </div>

      {isAdding ? (
        <div className="space-y-4 bg-muted/30 p-6 rounded-lg border">
          <h3 className="font-medium text-lg mb-4">
            {editingId ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              Tỉnh/Thành phố
              <Select
                value={selectedProvince}
                onValueChange={(val) => setSelectedProvince(val || "")}
              >
                <SelectTrigger className="mt-2 bg-background">
                  <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p.code} value={p.code.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="text-sm">
              Quận/Huyện
              <Select
                value={selectedDistrict}
                onValueChange={(val) => setSelectedDistrict(val || "")}
                disabled={!selectedProvince}
              >
                <SelectTrigger className="mt-2 bg-background">
                  <SelectValue placeholder="Chọn Quận/Huyện" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.code} value={d.code.toString()}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="text-sm">
              Phường/Xã
              <Select
                value={selectedWard}
                onValueChange={(val) => setSelectedWard(val || "")}
                disabled={!selectedDistrict}
              >
                <SelectTrigger className="mt-2 bg-background">
                  <SelectValue placeholder="Chọn Phường/Xã" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((w) => (
                    <SelectItem key={w.code} value={w.code.toString()}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="text-sm">
              Số điện thoại
              <Input
                className="mt-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0123456789"
              />
              {phoneError && (
                <span className="text-xs text-(--mirai-sem-danger) mt-1">
                  {phoneError}
                </span>
              )}
            </label>
          </div>

          <label className="text-sm block">
            Địa chỉ cụ thể
            <Input
              className="mt-2"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="Số nhà, tên đường..."
            />
          </label>

          <label className="flex items-center gap-2 text-sm mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-gray-300"
            />
            Đặt làm địa chỉ mặc định
          </label>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={resetForm}>
              Huỷ
            </Button>
            <Button onClick={handleSaveAddress}>Lưu địa chỉ</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-(--mirai-sem-primary)" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              <MapPin className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>Bạn chưa có địa chỉ nào.</p>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className="flex flex-col sm:flex-row justify-between gap-4 p-5 rounded-lg border bg-card hover:border-primary/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">{user?.name || "User"}</span>
                    {address.phone && (
                      <span className="text-muted-foreground text-sm">
                        | {address.phone}
                      </span>
                    )}
                    {address.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Mặc định
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{address.addressLine}</p>
                </div>
                <div className="flex items-center gap-2 sm:self-start">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(address)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function PaymentSection() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading text-2xl font-semibold text-(--mirai-sem-danger)">
          Phương Thức Thanh Toán
        </h2>
        <Button className="flex gap-2">
          <Plus className="w-4 h-4" /> Thêm phương thức mới
        </Button>
      </div>

      <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
        <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-medium text-foreground mb-1">
          Chưa có phương thức thanh toán
        </h3>
        <p>Bạn chưa liên kết thẻ hay phương thức thanh toán nào.</p>
      </div>
    </div>
  );
}

function OrdersSection({ initialFilter }: { initialFilter: string }) {
  const [filter, setFilter] = useState(initialFilter);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Feature is waiting for backend API (GetOrdersByUserId)
  const filteredOrders: unknown[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã đặt":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "Đang sản xuất":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "Đang giao":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "Đã giao":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "Đã huỷ":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "default";
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h2 className="font-heading text-2xl font-semibold text-(--mirai-sem-danger)">
          Đơn Hàng Của Tôi {filter !== "all" && `(${filter})`}
        </h2>

        <div className="flex gap-2">
          <Select
            value={filter}
            onValueChange={(val) => setFilter(val || "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Đã đặt">Đã đặt</SelectItem>
              <SelectItem value="Đang sản xuất">Đang sản xuất</SelectItem>
              <SelectItem value="Đang giao">Đang giao</SelectItem>
              <SelectItem value="Đã giao">Đã giao</SelectItem>
              <SelectItem value="Đã huỷ">Đã huỷ</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            title="Sắp xếp theo ngày"
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
        <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-medium text-foreground mb-1">
          Chưa có đơn hàng
        </h3>
        <p>Tính năng xem lịch sử đơn hàng đang được cập nhật từ Backend.</p>
      </div>
    </div>
  );
}
