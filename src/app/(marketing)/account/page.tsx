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
  Loader2,
  ShieldCheck,
  Lock,
  Check,
  X,
} from "lucide-react";
import { userApi, addressApi, orderApi, getAuthToken } from "@/lib/api-client";
import { supabase } from "@/lib/supabase";
import { GetUserDto, OrderResponseDto } from "@/types/api";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "@/lib/utils";

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
            {activeSection === "payment" && <PaymentSection user={user} />}
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
        .then((data) => {
          if (typeof window !== "undefined") {
            const savedLocal = localStorage.getItem(`mirai_profile_${user.id}`);
            if (savedLocal) {
              try {
                const localData = JSON.parse(savedLocal);
                setUserData({
                  ...data,
                  fullName: localData.fullName || data.fullName,
                  phone: localData.phone || data.phone,
                });
                return;
              } catch (e) {
                console.error("Failed to parse local profile:", e);
              }
            }
          }
          setUserData(data);
        })
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
        avatar_url: user?.avatar_url,
        id: userData.userId,
        phone: userData.phone || "",
      }}
    />
  );
}

function ProfileForm({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar_url?: string;
    id?: string;
    phone?: string;
  };
}) {
  const [isEditing, setIsEditing] = useState(false);
  const parts = user.name?.split(" ") || [];
  const initialLastName = parts.length > 1 ? parts.pop() || "" : "";
  const initialFirstName = parts.join(" ");

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop avatar states
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [cropFile, setCropFile] = useState<File | null>(null);

  // Password state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const validatePassword = (password: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[@$!%*?&]/.test(newPassword);

  const handleSave = async () => {
    if (phone.trim() === "") {
      setPhoneError("Số điện thoại không được để trống.");
      toast.error("Vui lòng nhập số điện thoại! ⚠️");
      return;
    }

    const phoneRegex = /^(0|84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      setPhoneError(
        "Số điện thoại không hợp lệ. Định dạng đúng: 0912345678 (10 chữ số)",
      );
      toast.error("Số điện thoại không đúng định dạng Việt Nam. ❌");
      return;
    }

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

    setIsSaving(true);
    const saveToast = toast.loading("Đang lưu thay đổi... ⏳");

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      if (user.id) {
        // Check if there is an active Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // 1. Update Supabase Auth user metadata
          const { error: authError } = await supabase.auth.updateUser({
            data: { full_name: fullName },
          });
          if (authError) {
            console.warn(
              "Failed to update Supabase Auth metadata:",
              authError.message,
            );
          }
        } else {
          console.warn(
            "No active Supabase session. Skipping auth metadata update.",
          );
        }

        // 2. Update Supabase public.users table
        const { error: dbError } = await supabase
          .from("users")
          .update({
            full_name: fullName,
            phone: phone.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
        if (dbError) {
          console.error("Failed to update public.users table:", dbError);
          throw new Error(
            "Không thể cập nhật bảng dữ liệu người dùng. Vui lòng kiểm tra lại phiên đăng nhập.",
          );
        }

        // 3. Sync with .NET Backend (Update profile fields directly)
        try {
          await userApi.updateProfile(user.id, {
            fullName,
            phone: phone.trim() || undefined,
          });
        } catch (backendError) {
          console.warn(
            "Failed to sync profile to .NET Backend (endpoint update-profile might not be implemented yet):",
            backendError,
          );
        }

        try {
          await userApi.syncUser();
        } catch (syncError) {
          console.warn(
            "Failed to sync user via Supabase sync endpoint:",
            syncError,
          );
        }

        // 4. Update Zustand store user state so Header & Profile updates instantly
        const currentUserState = useDesignStore.getState().user;
        if (currentUserState && currentUserState.id === user.id) {
          useDesignStore.getState().setUser({
            ...currentUserState,
            name: fullName,
          });
        }

        // Save to localStorage as a fallback to prevent losing updates when backend is not yet implemented
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `mirai_profile_${user.id}`,
            JSON.stringify({
              fullName,
              phone: phone.trim() || "",
              updatedAt: new Date().toISOString(),
            }),
          );
        }
      }

      // 5. Update password if requested
      if (showPasswordChange) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Case A: Authenticated via Supabase Auth (e.g. Google OAuth)
          const { error: passError } = await supabase.auth.updateUser({
            password: newPassword,
          });
          if (passError) throw passError;
        } else {
          // Case B: Authenticated via .NET Backend JWT
          const token = getAuthToken();
          if (!token) {
            throw new Error(
              "Phiên đăng nhập đã hết hạn hoặc không tồn tại. Vui lòng đăng nhập lại để đổi mật khẩu!",
            );
          }

          // Call the backend endpoint to change the password
          await userApi.changePassword(user?.id || "", {
            currentPassword,
            newPassword,
          });
        }

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordChange(false);
      }

      toast.success("Cập nhật thông tin thành công! ✨", { id: saveToast });
      setSaved(true);
      setIsEditing(false);
      setPasswordError("");
      setPhoneError("");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      console.error("Failed to save profile:", err);
      toast.error(
        getFriendlyErrorMessage(
          err,
          "Không thể cập nhật hồ sơ. Vui lòng thử lại!",
        ),
        { id: saveToast },
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user.id) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh hợp lệ!");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước hình ảnh không được vượt quá 5MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string);
      setCropFile(file);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
      setIsCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const performUpload = async (fileToUpload: File) => {
    setIsUploading(true);
    const uploadToast = toast.loading("Đang tải ảnh đại diện lên... ⏳");

    try {
      const fileExt = fileToUpload.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 1. Upload to Supabase Storage bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, fileToUpload, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // 3. Update Supabase Auth user metadata if session is active
      const {
        data: { session: avatarSession },
      } = await supabase.auth.getSession();
      if (avatarSession) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl },
        });
        if (authError) {
          console.warn(
            "Failed to update avatar in Supabase auth metadata:",
            authError.message,
          );
        }
      }

      // 4. Update Supabase public.users table safely
      try {
        await supabase
          .from("users")
          .update({
            avatar_url: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      } catch (dbError) {
        console.warn(
          "Could not update public.users table (likely a foreign key constraint for backend user):",
          dbError,
        );
      }

      // 5. Sync with .NET Backend
      try {
        await userApi.syncUser();
      } catch (err) {
        console.warn("Backend sync skipped:", err);
      }

      // 6. Update Zustand store user state so Header & Profile updates instantly
      const currentUserState = useDesignStore.getState().user;
      if (currentUserState && currentUserState.id === user.id) {
        useDesignStore.getState().setUser({
          ...currentUserState,
          avatar_url: publicUrl,
        });
      }

      // 7. Save to localStorage to avoid losing avatar when logging back in
      if (typeof window !== "undefined") {
        const localProfile = localStorage.getItem(`mirai_profile_${user.id}`);
        const parsed = localProfile ? JSON.parse(localProfile) : {};
        localStorage.setItem(
          `mirai_profile_${user.id}`,
          JSON.stringify({
            ...parsed,
            fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
            phone: phone.trim() || "",
            avatarUrl: publicUrl,
            updatedAt: new Date().toISOString(),
          }),
        );
      }

      toast.success("Cập nhật ảnh đại diện thành công! ✨", {
        id: uploadToast,
      });
      setIsCropOpen(false);
    } catch (err: unknown) {
      console.error("Failed to upload avatar:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Không thể tải lên ảnh đại diện. Vui lòng thử lại!";
      toast.error(msg, { id: uploadToast });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCropSubmit = () => {
    if (!selectedImageSrc) return;

    const img = new Image();
    img.src = selectedImageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Vẽ hình tròn cắt
      ctx.beginPath();
      ctx.arc(150, 150, 150, 0, Math.PI * 2);
      ctx.clip();

      const minSide = Math.min(img.width, img.height);
      const scaleFactor = (300 / minSide) * zoom;

      const drawWidth = img.width * scaleFactor;
      const drawHeight = img.height * scaleFactor;

      // Vị trí vẽ trung tâm cộng offset X, Y
      const x = (300 - drawWidth) / 2 + offsetX;
      const y = (300 - drawHeight) / 2 + offsetY;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 300, 300);

      ctx.drawImage(img, x, y, drawWidth, drawHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const fileExt = cropFile?.name.split(".").pop() || "jpg";
          const finalFile = new File(
            [blob],
            `avatar-${Date.now()}.${fileExt}`,
            { type: "image/jpeg" },
          );
          performUpload(finalFile);
        },
        "image/jpeg",
        0.9,
      );
    };
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
              setPhone(user.phone || "");
              setShowPasswordChange(false);
              setPasswordError("");
              setPhoneError("");
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
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isEditing}
                placeholder="Nhập họ và chữ lót"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Tên
              </label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
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
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, ""); // Chỉ cho nhập số
                setPhone(val);
                if (val.trim() === "") {
                  setPhoneError("Số điện thoại không được để trống.");
                } else if (!/^(0|84)(3|5|7|8|9)[0-9]{8}$/.test(val)) {
                  setPhoneError(
                    "Số điện thoại không hợp lệ. Ví dụ đúng: 0912345678",
                  );
                } else {
                  setPhoneError("");
                }
              }}
              disabled={!isEditing}
              placeholder={
                isEditing ? "Ví dụ: 0912345678" : "Chưa cập nhật số điện thoại"
              }
              className={
                phoneError ? "border-red-500 focus-visible:ring-red-500" : ""
              }
            />
            {phoneError && (
              <p className="text-xs text-red-500 font-medium">{phoneError}</p>
            )}
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
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passwordError) setPasswordError("");
                      }}
                      placeholder="••••••••"
                      className={
                        newPassword && !validatePassword(newPassword)
                          ? "border-amber-500 focus-visible:ring-amber-500"
                          : ""
                      }
                    />
                    {newPassword.length > 0 && (
                      <div className="mt-2 space-y-1.5 rounded-lg border border-(--mirai-color-line) bg-muted/30 p-3 text-xs animate-in slide-in-from-top-1 duration-200">
                        <p className="font-semibold text-muted-foreground mb-1">
                          Mật khẩu mới cần đạt:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div
                            className={`flex items-center gap-1.5 transition-colors duration-200 ${hasMinLength ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                          >
                            <Check
                              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${hasMinLength ? "text-green-600 scale-110" : "text-muted-foreground/40"}`}
                            />
                            <span>Ít nhất 8 ký tự</span>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 transition-colors duration-200 ${hasUppercase ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                          >
                            <Check
                              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${hasUppercase ? "text-green-600 scale-110" : "text-muted-foreground/40"}`}
                            />
                            <span>Chữ in hoa (A-Z)</span>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 transition-colors duration-200 ${hasLowercase ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                          >
                            <Check
                              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${hasLowercase ? "text-green-600 scale-110" : "text-muted-foreground/40"}`}
                            />
                            <span>Chữ thường (a-z)</span>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 transition-colors duration-200 ${hasNumber ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                          >
                            <Check
                              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${hasNumber ? "text-green-600 scale-110" : "text-muted-foreground/40"}`}
                            />
                            <span>Chữ số (0-9)</span>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 transition-colors duration-200 ${hasSpecialChar ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                          >
                            <Check
                              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${hasSpecialChar ? "text-green-600 scale-110" : "text-muted-foreground/40"}`}
                            />
                            <span>Kí tự đặc biệt (@$!%*?&)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Xác nhận mật khẩu mới
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordError) setPasswordError("");
                      }}
                      placeholder="••••••••"
                      className={
                        confirmPassword && newPassword !== confirmPassword
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {newPassword && confirmPassword && (
                      <div
                        className={`mt-1.5 flex items-center gap-1.5 text-xs animate-in slide-in-from-top-1 duration-200 ${newPassword === confirmPassword ? "text-green-600 font-medium" : "text-red-500"}`}
                      >
                        {newPassword === confirmPassword ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span>
                          {newPassword === confirmPassword
                            ? "Mật khẩu trùng khớp"
                            : "Mật khẩu xác nhận chưa khớp"}
                        </span>
                      </div>
                    )}
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
                  <Button onClick={handleSave} disabled={isSaving}>
                    Lưu thay đổi
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isEditing && (
            <div className="pt-4">
              <Button
                className="w-full sm:w-auto bg-(--mirai-sem-danger) hover:bg-red-600"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              {isUploading ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              ) : null}
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {user.name?.substring(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <span className="text-xs font-medium text-white">Thay đổi</span>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleAvatarChange}
          />
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

      {/* Dialog Căn chỉnh và cắt ảnh đại diện */}
      <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl bg-background border border-border p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Căn chỉnh ảnh đại diện
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4 flex flex-col items-center">
            {/* Khung xem trước hình tròn */}
            <div className="relative h-56 w-56 overflow-hidden rounded-full border border-border bg-muted ring-2 ring-primary/20 ring-offset-2">
              {selectedImageSrc && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedImageSrc}
                    alt="Xem trước"
                    className="max-w-none origin-center transition-transform duration-75"
                    style={{
                      transform: `scale(${zoom}) translate(${offsetX / zoom}px, ${offsetY / zoom}px)`,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </>
              )}
            </div>

            {/* Các thanh trượt điều chỉnh */}
            <div className="w-full space-y-4 pt-4">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase block">
                  Độ thu phóng (Zoom)
                </span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase block">
                    Dịch chuyển ngang
                  </span>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="5"
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase block">
                    Dịch chuyển dọc
                  </span>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="5"
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCropOpen(false)}
              className="rounded-xl flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={handleCropSubmit}
              disabled={isUploading}
              className="rounded-xl flex-1"
            >
              Cắt & Tải lên
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

  // Pending edit states to resolve race conditions during editing
  const [pendingDistrict, setPendingDistrict] = useState("");
  const [pendingWard, setPendingWard] = useState("");

  useEffect(() => {
    // Fetch provinces
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Error fetching provinces", err));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const prov = provinces.find(
        (p) =>
          p.name === selectedProvince || p.code.toString() === selectedProvince,
      );
      if (prov) {
        fetch(`https://provinces.open-api.vn/api/p/${prov.code}?depth=2`)
          .then((res) => res.json())
          .then((data) => {
            setDistricts(data.districts || []);
            if (pendingDistrict) {
              const d = data.districts?.find(
                (item: LocationItem) =>
                  item.name === pendingDistrict ||
                  item.code.toString() === pendingDistrict,
              );
              if (d) {
                setSelectedDistrict(d.name);
              }
              setPendingDistrict("");
            }
          })
          .catch((err) => console.error("Error fetching districts", err));
      }
    } else {
      Promise.resolve().then(() => setDistricts([]));
    }
  }, [selectedProvince, provinces, pendingDistrict]);

  useEffect(() => {
    if (selectedDistrict) {
      const dist = districts.find(
        (d) =>
          d.name === selectedDistrict || d.code.toString() === selectedDistrict,
      );
      if (dist) {
        fetch(`https://provinces.open-api.vn/api/d/${dist.code}?depth=2`)
          .then((res) => res.json())
          .then((data) => {
            setWards(data.wards || []);
            if (pendingWard) {
              const w = data.wards?.find(
                (item: LocationItem) =>
                  item.name === pendingWard ||
                  item.code.toString() === pendingWard,
              );
              if (w) {
                setSelectedWard(w.name);
              }
              setPendingWard("");
            }
          })
          .catch((err) => console.error("Error fetching wards", err));
      }
    } else {
      Promise.resolve().then(() => setWards([]));
    }
  }, [selectedDistrict, districts, pendingWard]);

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
      provinces.find(
        (p) =>
          p.name === selectedProvince || p.code.toString() === selectedProvince,
      )?.name || selectedProvince;
    const dName =
      districts.find(
        (d) =>
          d.name === selectedDistrict || d.code.toString() === selectedDistrict,
      )?.name || selectedDistrict;
    const wName =
      wards.find(
        (w) => w.name === selectedWard || w.code.toString() === selectedWard,
      )?.name || selectedWard;

    const fullAddressLine = addressLine;

    try {
      if (editingId !== null) {
        await addressApi.updateAddress(editingId.toString(), {
          recipientName: user.name,
          recipientPhone: phone,
          addressLine: fullAddressLine,
          ward: wName,
          district: dName,
          city: pName,
          province: pName,
          note: "",
        });
        toast.success("Đã cập nhật địa chỉ thành công! ✨");
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
        toast.success("Đã thêm địa chỉ mới thành công! ✨");
      }
      fetchAddresses();
      resetForm();
    } catch (err) {
      console.error("Failed to save address", err);
      toast.error("Có lỗi xảy ra khi lưu địa chỉ. Vui lòng thử lại!");
    }
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    toast.success("Đã xóa địa chỉ!");
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setPhone(address.phone);
    setIsDefault(address.isDefault);
    setIsAdding(true);

    if (address.rawDetails) {
      setAddressLine(address.rawDetails.addressLine);
      setPendingDistrict(address.rawDetails.district);
      setPendingWard(address.rawDetails.ward);
      setSelectedProvince(address.rawDetails.province);
    } else {
      setAddressLine(address.addressLine);
    }
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
    setDistricts([]);
    setWards([]);
    setPendingDistrict("");
    setPendingWard("");
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
                onValueChange={(val) => {
                  setSelectedProvince(val || "");
                  setSelectedDistrict("");
                  setSelectedWard("");
                  setDistricts([]);
                  setWards([]);
                }}
              >
                <SelectTrigger className="mt-2 bg-background">
                  <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p.code} value={p.name}>
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
                onValueChange={(val) => {
                  setSelectedDistrict(val || "");
                  setSelectedWard("");
                  setWards([]);
                }}
                disabled={!selectedProvince}
              >
                <SelectTrigger className="mt-2 bg-background">
                  <SelectValue placeholder="Chọn Quận/Huyện" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.code} value={d.name}>
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
                    <SelectItem key={w.code} value={w.name}>
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
                <div className="flex-1 min-w-0">
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
                  {/* Full address breakdown */}
                  <div className="space-y-0.5">
                    {address.rawDetails?.addressLine && (
                      <p className="text-sm text-foreground">
                        {address.rawDetails.addressLine}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {[
                        address.rawDetails?.ward,
                        address.rawDetails?.district,
                        address.rawDetails?.province,
                      ]
                        .filter(Boolean)
                        .join(", ") || address.addressLine}
                    </p>
                  </div>
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

interface SavedCard {
  id: string;
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  type: "visa" | "mastercard" | "jcb" | "unknown";
  isDefault: boolean;
}

function PaymentSection({
  user,
}: {
  user: { id: string; email: string; name: string } | null;
}) {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const storageKey = useMemo(
    () => `mirai_user_payment_methods_${user?.id || "guest"}`,
    [user?.id],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as SavedCard[];
          Promise.resolve().then(() => setCards(parsed));
        } catch (e) {
          console.error("Failed to parse stored cards", e);
        }
      }
    }
  }, [storageKey]);

  const saveToStorage = (updatedCards: SavedCard[]) => {
    setCards(updatedCards);
    localStorage.setItem(storageKey, JSON.stringify(updatedCards));
  };

  const getCardType = (num: string) => {
    const cleanNumber = num.replace(/\D/g, "");
    if (cleanNumber.startsWith("4")) return "visa";
    if (/^5[1-5]/.test(cleanNumber)) return "mastercard";
    if (/^35/.test(cleanNumber)) return "jcb";
    return "unknown";
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // removes Vietnamese diacritics
      .replace(/[^A-Z\s]/g, ""); // only A-Z and spaces
    setCardName(value);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  const handleCardCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCardCvv(value);
  };

  const handleSaveCard = async () => {
    const cleanNumber = cardNumber.replace(/\D/g, "");
    if (cleanNumber.length !== 16) {
      toast.error("Số thẻ phải có đúng 16 chữ số! ❌");
      return;
    }
    if (!cardName.trim()) {
      toast.error("Vui lòng nhập tên chủ thẻ! ❌");
      return;
    }
    const expiryParts = cardExpiry.split("/");
    if (
      expiryParts.length !== 2 ||
      expiryParts[0].length !== 2 ||
      expiryParts[1].length !== 2
    ) {
      toast.error("Ngày hết hạn không đúng định dạng MM/YY! ❌");
      return;
    }
    const month = parseInt(expiryParts[0], 10);
    const year = parseInt(expiryParts[1], 10) + 2000;
    if (month < 1 || month > 12) {
      toast.error("Tháng hết hạn không hợp lệ (01 - 12)! ❌");
      return;
    }
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      toast.error("Thẻ đã hết hạn sử dụng! ❌");
      return;
    }
    if (cardCvv.length !== 3) {
      toast.error("Mã bảo mật CVV phải có đúng 3 chữ số! ❌");
      return;
    }

    setIsSaving(true);
    const saveToast = toast.loading("Đang liên kết thẻ... ⏳");

    setTimeout(() => {
      const type = getCardType(cleanNumber);
      const newCard: SavedCard = {
        id: Date.now().toString(),
        number: cleanNumber,
        name: cardName.trim(),
        expiry: cardExpiry,
        cvv: cardCvv,
        type,
        isDefault: cards.length === 0,
      };

      const updated = [...cards, newCard];
      saveToStorage(updated);
      setIsSaving(false);
      toast.success("Liên kết thẻ thành công! ✨", { id: saveToast });
      resetForm();
    }, 800);
  };

  const handleDeleteCard = (id: string) => {
    if (
      confirm("Bạn có chắc chắn muốn xóa phương thức thanh toán này không?")
    ) {
      const cardToDelete = cards.find((c) => c.id === id);
      const updated = cards.filter((c) => c.id !== id);

      if (cardToDelete?.isDefault && updated.length > 0) {
        updated[0].isDefault = true;
      }

      saveToStorage(updated);
      toast.success("Đã xóa thẻ thành công! 🗑️");
    }
  };

  const handleSetDefault = (id: string) => {
    const updated = cards.map((c) => ({
      ...c,
      isDefault: c.id === id,
    }));
    saveToStorage(updated);
    toast.success("Đã đặt làm phương thức thanh toán mặc định! ⭐");
  };

  const resetForm = () => {
    setIsAdding(false);
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCvv("");
  };

  const detectedType = getCardType(cardNumber);

  const getCardDesign = (type: string) => {
    switch (type) {
      case "visa":
        return {
          bg: "from-blue-600 via-indigo-700 to-indigo-900",
          logo: (
            <span className="text-2xl font-extrabold italic text-white tracking-widest">
              VISA
            </span>
          ),
        };
      case "mastercard":
        return {
          bg: "from-neutral-800 via-neutral-900 to-orange-950",
          logo: (
            <div className="flex -space-x-3 items-center">
              <div className="w-6 h-6 rounded-full bg-red-500 opacity-90"></div>
              <div className="w-6 h-6 rounded-full bg-amber-400 opacity-90"></div>
            </div>
          ),
        };
      case "jcb":
        return {
          bg: "from-red-500 via-red-600 to-rose-800",
          logo: (
            <span className="text-xl font-black text-white italic tracking-tighter bg-gradient-to-r from-blue-600 via-red-500 to-green-500 px-2 py-0.5 rounded">
              JCB
            </span>
          ),
        };
      default:
        return {
          bg: "from-neutral-700 via-neutral-800 to-neutral-900",
          logo: <CreditCard className="w-8 h-8 text-white opacity-80" />,
        };
    }
  };

  const cardDesign = getCardDesign(detectedType);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading text-2xl font-semibold text-(--mirai-sem-danger)">
          Phương Thức Thanh Toán
        </h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="flex gap-2">
            <Plus className="w-4 h-4" /> Thêm phương thức mới
          </Button>
        )}
      </div>

      {isAdding ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] bg-muted/20 p-6 rounded-xl border">
          <div className="space-y-5">
            <h3 className="font-medium text-lg text-foreground">
              Liên kết thẻ thanh toán quốc tế
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground flex justify-between">
                  <span>Số thẻ</span>
                  {detectedType !== "unknown" && (
                    <span className="text-xs uppercase font-bold text-(--mirai-sem-primary) tracking-wide">
                      {detectedType} detected
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Input
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4000 1234 5678 9010"
                    className="pr-10 tracking-widest font-mono text-base"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Tên chủ thẻ (In nổi trên thẻ)
                </label>
                <Input
                  value={cardName}
                  onChange={handleCardNameChange}
                  placeholder="NGUYEN VAN A"
                  className="uppercase tracking-wider font-medium text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">
                    Ngày hết hạn
                  </label>
                  <Input
                    value={cardExpiry}
                    onChange={handleCardExpiryChange}
                    placeholder="MM/YY"
                    className="text-center font-mono text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <span>Mã bảo mật CVV</span>
                    <span className="group relative cursor-pointer text-xs text-muted-foreground border border-muted-foreground rounded-full w-4 h-4 flex items-center justify-center font-mono">
                      ?
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-neutral-900 text-white text-[11px] p-2 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 font-sans normal-case leading-relaxed">
                        3 chữ số bảo mật ở mặt sau thẻ của bạn.
                      </span>
                    </span>
                  </label>
                  <div className="relative">
                    <Input
                      type="password"
                      value={cardCvv}
                      onChange={handleCardCvvChange}
                      placeholder="•••"
                      className="text-center font-mono text-base tracking-widest"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-dashed text-xs text-muted-foreground">
              <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p>
                Thông tin thẻ được mã hóa và bảo mật theo chuẩn **PCI-DSS**.
                Mirai cam kết không lưu thông tin thẻ nhạy cảm của bạn trên máy
                chủ của chúng tôi.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={resetForm} disabled={isSaving}>
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSaveCard}
                disabled={
                  isSaving ||
                  !cardNumber ||
                  !cardName ||
                  !cardExpiry ||
                  !cardCvv
                }
                className="bg-(--mirai-sem-danger) hover:bg-red-600 text-white"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Xác nhận liên kết
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-l pl-6 border-dashed">
            <p className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
              Xem trước thẻ của bạn
            </p>

            <div
              className={`relative w-full max-w-[320px] h-48 rounded-2xl text-white p-6 shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br ${cardDesign.bg} hover:scale-105 active:scale-100 select-none group`}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-60 pointer-events-none"></div>

              <div className="flex justify-between items-start h-full flex-col">
                <div className="flex justify-between w-full items-center">
                  <div className="h-9 w-11 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 rounded-md opacity-80 flex items-center justify-center shadow-inner">
                    <div className="w-7 h-5 border border-yellow-600/30 rounded grid grid-cols-3 gap-0.5 p-0.5">
                      <div className="border-r border-b border-yellow-600/30"></div>
                      <div className="border-r border-b border-yellow-600/30"></div>
                      <div className="border-b border-yellow-600/30"></div>
                      <div className="border-r border-yellow-600/30"></div>
                      <div className="border-r border-yellow-600/30"></div>
                      <div></div>
                    </div>
                  </div>
                  {cardDesign.logo}
                </div>

                <div className="w-full">
                  <div className="font-mono text-lg tracking-widest text-white/90 drop-shadow mb-4">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="truncate max-w-[170px]">
                      <div className="text-[9px] uppercase tracking-wider text-white/60 mb-0.5">
                        Card Holder
                      </div>
                      <div className="font-medium tracking-wide uppercase text-sm truncate">
                        {cardName || "TÊN CHỦ THẺ"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-white/60 mb-0.5">
                        Expires
                      </div>
                      <div className="font-mono text-sm tracking-wider">
                        {cardExpiry || "MM/YY"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium text-foreground mb-1">
                Chưa có phương thức thanh toán
              </h3>
              <p>Bạn chưa liên kết thẻ hay phương thức thanh toán nào.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {cards.map((card) => {
                const design = getCardDesign(card.type);
                return (
                  <div
                    key={card.id}
                    className={`relative rounded-2xl text-white p-5 shadow-lg overflow-hidden bg-gradient-to-br ${design.bg} flex flex-col justify-between h-40 group hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {!card.isDefault && (
                        <button
                          onClick={() => handleSetDefault(card.id)}
                          className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition-colors text-xs font-semibold"
                          title="Đặt làm mặc định"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                        title="Xóa thẻ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {design.logo}
                        {card.isDefault && (
                          <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded-full text-white/90">
                            Mặc định
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="font-mono text-base tracking-widest text-white/90 mb-2">
                        •••• •••• •••• {card.number.slice(-4)}
                      </div>
                      <div className="flex justify-between text-xs text-white/70">
                        <div className="uppercase tracking-wider truncate max-w-[180px]">
                          {card.name}
                        </div>
                        <div className="font-mono">{card.expiry}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Map numeric order status to Vietnamese label
const ORDER_STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: "Đã đặt", color: "bg-blue-100 text-blue-700" },
  1: { label: "Đang sản xuất", color: "bg-yellow-100 text-yellow-700" },
  2: { label: "Đang giao", color: "bg-orange-100 text-orange-700" },
  3: { label: "Đã giao", color: "bg-green-100 text-green-700" },
  4: { label: "Đã huỷ", color: "bg-red-100 text-red-700" },
};

const FILTER_STATUS_MAP: Record<string, number | null> = {
  all: null,
  "Đã đặt": 0,
  "Đang sản xuất": 1,
  "Đang giao": 2,
  "Đã giao": 3,
  "Đã huỷ": 4,
};

function OrdersSection({ initialFilter }: { initialFilter: string }) {
  const user = useDesignStore((state) => state.user);
  const [filter, setFilter] = useState(initialFilter);
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    orderApi
      .getOrdersByUserId(user.id)
      .then((data) => setOrders(data))
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại!");
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filteredOrders = useMemo(() => {
    const targetStatus = FILTER_STATUS_MAP[filter];
    if (targetStatus === null || targetStatus === undefined) return orders;
    return orders.filter((o) => o.status === targetStatus);
  }, [orders, filter]);

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
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-(--mirai-sem-primary)" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            Chưa có đơn hàng
          </h3>
          <p>
            {filter === "all"
              ? "Bạn chưa có đơn hàng nào."
              : `Không có đơn hàng ở trạng thái "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = ORDER_STATUS_MAP[order.status ?? -1] ?? {
              label: "Không rõ",
              color: "bg-gray-100 text-gray-600",
            };
            const createdDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "—";
            return (
              <div
                key={order.orderId}
                className="rounded-lg border bg-card p-5 hover:border-primary/50 transition-colors space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Đơn hàng #
                      {order.orderNumber ||
                        order.orderId?.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {createdDate}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <div className="divide-y divide-(--mirai-color-line)">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between py-2 text-sm"
                      >
                        <span className="text-foreground">
                          {item.productName || "Sản phẩm"}
                          {item.variantName ? ` — ${item.variantName}` : ""}
                          <span className="text-muted-foreground ml-1">
                            x{item.quantity}
                          </span>
                        </span>
                        <span className="text-foreground font-medium whitespace-nowrap">
                          {(
                            item.price ?? item.unitPrice * item.quantity
                          ).toLocaleString("vi-VN")}
                          ₫
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-end pt-1">
                  <span className="text-sm font-semibold text-foreground">
                    Tổng:{" "}
                    <span className="text-(--mirai-sem-danger)">
                      {order.totalAmount.toLocaleString("vi-VN")}₫
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
