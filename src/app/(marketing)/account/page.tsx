"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDesignStore } from "@/lib/store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AuthGuard } from "@/components/common/guards/auth-guard";
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
import { useTranslation } from "@/providers/language-context";

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
  const { locale } = useTranslation();
  const user = useDesignStore((state) => state.user);
  const [activeSection, setActiveSection] = useState("profile");
  const [orderFilter, setOrderFilter] = useState("all");

  const handleOrderSection = (filter: string) => {
    setActiveSection("orders");
    setOrderFilter(filter);
  };

  return (
    <AuthGuard>
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
              {locale === "vi" ? "Xin chào, " : "Welcome, "}
              <span className="font-semibold text-(--mirai-sem-danger)">
                {user?.name || "Guest"}
              </span>
            </p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[220px_1fr]">
            <aside>
              <h1 className="font-heading text-3xl font-semibold text-foreground transition-colors">
                <span className="text-foreground">
                  {locale === "vi" ? "Quản Lý Tài Khoản" : "Manage Account"}
                </span>
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
                    {locale === "vi" ? "Tài Khoản Của Tôi" : "My Profile"}
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
                    {locale === "vi" ? "Địa Chỉ" : "Addresses"}
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
                    {locale === "vi"
                      ? "Phương Thức Thanh Toán"
                      : "Payment Methods"}
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
                  {locale === "vi" ? "Đơn Hàng Của Tôi" : "My Orders"}
                </button>
              </h2>
              <ul className="mt-5 space-y-2 text-base text-muted-foreground">
                {[
                  { key: "Đã đặt", en: "Placed" },
                  { key: "Đang sản xuất", en: "In Production" },
                  { key: "Đang giao", en: "Shipping" },
                  { key: "Đã giao", en: "Delivered" },
                  { key: "Đã huỷ", en: "Cancelled" },
                ].map(({ key, en }) => (
                  <li key={key}>
                    <button
                      onClick={() => handleOrderSection(key)}
                      className={`hover:text-foreground transition-colors ${
                        activeSection === "orders" && orderFilter === key
                          ? "text-foreground font-medium"
                          : ""
                      }`}
                    >
                      {locale === "en" ? en : key}
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
    </AuthGuard>
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
  const { locale, t } = useTranslation();
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
      setPhoneError(
        locale === "vi"
          ? "Số điện thoại không được để trống."
          : "Phone number cannot be empty.",
      );
      toast.error(
        locale === "vi"
          ? "Vui lòng nhập số điện thoại!"
          : "Please enter a phone number!",
      );
      return;
    }

    const phoneRegex = /^(0|84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      setPhoneError(
        locale === "vi"
          ? "Số điện thoại không hợp lệ. Định dạng đúng: 0912345678 (10 chữ số)"
          : "Invalid phone number. Expected format: 0912345678 (10 digits)",
      );
      toast.error(
        locale === "vi"
          ? "Số điện thoại không đúng định dạng Việt Nam. ❌"
          : "Invalid phone number format. ❌",
      );
      return;
    }

    if (showPasswordChange) {
      if (newPassword !== confirmPassword) {
        setPasswordError(
          locale === "vi"
            ? "Mật khẩu xác nhận không khớp."
            : "Passwords do not match.",
        );
        return;
      }
      if (!validatePassword(newPassword)) {
        setPasswordError(
          locale === "vi"
            ? "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
            : "Password must be at least 8 characters including uppercase, lowercase, number and special character.",
        );
        return;
      }
    }

    setIsSaving(true);
    const saveToast = toast.loading(t("account.saving"));

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
            locale === "vi"
              ? "Không thể cập nhật bảng dữ liệu người dùng. Vui lòng kiểm tra lại phiên đăng nhập."
              : "Failed to update user data. Please check your login session.",
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
              locale === "vi"
                ? "Phiên đăng nhập đã hết hạn hoặc không tồn tại. Vui lòng đăng nhập lại để đổi mật khẩu!"
                : "Session expired or not found. Please log in again to change your password!",
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

      toast.success(
        locale === "vi"
          ? "Cập nhật thông tin thành công! ✨"
          : "Profile updated successfully! ✨",
        { id: saveToast },
      );
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
          locale === "vi"
            ? "Không thể cập nhật hồ sơ. Vui lòng thử lại!"
            : "Failed to update profile. Please try again!",
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
      toast.error(
        locale === "vi"
          ? "Vui lòng chọn file hình ảnh hợp lệ!"
          : "Please select a valid image file!",
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        locale === "vi"
          ? "Kích thước hình ảnh không được vượt quá 5MB!"
          : "Image size must not exceed 5MB!",
      );
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
    const uploadToast = toast.loading(
      locale === "vi"
        ? "Đang tải ảnh đại diện lên... ⏳"
        : "Uploading avatar... ⏳",
    );

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

      toast.success(
        locale === "vi"
          ? "Cập nhật ảnh đại diện thành công! ✨"
          : "Avatar updated successfully! ✨",
        {
          id: uploadToast,
        },
      );
      setIsCropOpen(false);
    } catch (err: unknown) {
      console.error("Failed to upload avatar:", err);
      const msg =
        err instanceof Error
          ? err.message
          : locale === "vi"
            ? "Không thể tải lên ảnh đại diện. Vui lòng thử lại!"
            : "Failed to upload avatar. Please try again!";
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
          {t("account.my_profile")}
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
          {isEditing ? t("account.cancel") : t("account.edit")}
        </Button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("account.last_name")}
              </label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isEditing}
                placeholder={t("account.placeholder_lastname")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("account.first_name")}
              </label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!isEditing}
                placeholder={t("account.placeholder_firstname")}
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
              {t("account.phone")}
            </label>
            <Input
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, ""); // only digits
                setPhone(val);
                if (val.trim() === "") {
                  setPhoneError(
                    locale === "vi"
                      ? "Số điện thoại không được để trống."
                      : "Phone number cannot be empty.",
                  );
                } else if (!/^(0|84)(3|5|7|8|9)[0-9]{8}$/.test(val)) {
                  setPhoneError(
                    locale === "vi"
                      ? "Số điện thoại không hợp lệ."
                      : "Invalid phone number.",
                  );
                } else {
                  setPhoneError("");
                }
              }}
              disabled={!isEditing}
              placeholder={
                isEditing
                  ? t("account.placeholder_phone_edit")
                  : t("account.placeholder_phone_empty")
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
                    {t("account.change_password")}
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("account.change_password")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      {t("account.current_password")}
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
                      {t("account.new_password")}
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
                          {t("account.pwd_requirements")}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div
                            className={`flex items-center gap-1.5 transition-colors duration-200 ${hasMinLength ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                          >
                            <Check
                              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${hasMinLength ? "text-green-600 scale-110" : "text-muted-foreground/40"}`}
                            />
                            <span>{t("auth.pwd_min_len")}</span>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 transition-colors duration-200 ${hasUppercase ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                          >
                            <Check
                              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${hasUppercase ? "text-green-600 scale-110" : "text-muted-foreground/40"}`}
                            />
                            <span>{t("auth.pwd_uppercase")}</span>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 transition-colors duration-200 ${hasLowercase ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                          >
                            <Check
                              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${hasLowercase ? "text-green-600 scale-110" : "text-muted-foreground/40"}`}
                            />
                            <span>{t("auth.pwd_lowercase")}</span>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 transition-colors duration-200 ${hasNumber ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                          >
                            <Check
                              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${hasNumber ? "text-green-600 scale-110" : "text-muted-foreground/40"}`}
                            />
                            <span>{t("auth.pwd_number")}</span>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 transition-colors duration-200 ${hasSpecialChar ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                          >
                            <Check
                              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${hasSpecialChar ? "text-green-600 scale-110" : "text-muted-foreground/40"}`}
                            />
                            <span>{t("auth.pwd_special")}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      {t("account.confirm_new_password")}
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
                            ? t("account.pwd_match")
                            : t("account.pwd_mismatch")}
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
                    {t("account.cancel")}
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {t("account.save_changes")}
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
                {t("account.save_changes")}
              </Button>
            </div>
          )}

          {saved && (
            <p className="text-sm font-medium text-green-600 animate-in fade-in slide-in-from-bottom-1">
              {locale === "vi"
                ? "Cập nhật thành công!"
                : "Updated successfully!"}
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
              <span className="text-xs font-medium text-white">
                {locale === "vi" ? "Thay đổi" : "Change"}
              </span>
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
              {locale === "vi"
                ? "Chọn ảnh đại diện mới"
                : "Click to change your avatar"}
            </p>
          </div>
          <div className="w-full pt-4 space-y-2">
            <Button variant="outline" className="w-full">
              {locale === "vi" ? "Đặt lại mật khẩu" : "Reset Password"}
            </Button>
          </div>
        </div>
      </div>

      {/* Crop & adjust avatar dialog */}
      <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl bg-background border border-border p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {locale === "vi" ? "Căn chỉnh ảnh đại diện" : "Adjust Avatar"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4 flex flex-col items-center">
            {/* Circular preview */}
            <div className="relative h-56 w-56 overflow-hidden rounded-full border border-border bg-muted ring-2 ring-primary/20 ring-offset-2">
              {selectedImageSrc && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedImageSrc}
                    alt={locale === "vi" ? "Xem trước" : "Preview"}
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

            {/* Slider controls */}
            <div className="w-full space-y-4 pt-4">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase block">
                  {locale === "vi" ? "Độ thu phóng (Zoom)" : "Zoom"}
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
                    {locale === "vi" ? "Dịch chuyển ngang" : "Horizontal Shift"}
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
                    {locale === "vi" ? "Dịch chuyển dọc" : "Vertical Shift"}
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
              {locale === "vi" ? "Hủy" : "Cancel"}
            </Button>
            <Button
              onClick={handleCropSubmit}
              disabled={isUploading}
              className="rounded-xl flex-1"
            >
              {locale === "vi" ? "Cắt & Tải lên" : "Crop & Upload"}
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
  const { locale } = useTranslation();
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
        toast.error(
          locale === "vi"
            ? "Không thể tải danh sách địa chỉ"
            : "Failed to load addresses",
        );
      } finally {
        setLoading(false);
      }
    },
    [user, locale],
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
      setPhoneError(
        locale === "vi"
          ? "Số điện thoại không hợp lệ."
          : "Invalid phone number.",
      );
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
        toast.success(
          locale === "vi"
            ? "Đã cập nhật địa chỉ thành công! ✨"
            : "Address updated successfully! ✨",
        );
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
        toast.success(
          locale === "vi"
            ? "Đã thêm địa chỉ mới thành công! ✨"
            : "New address added successfully! ✨",
        );
      }
      fetchAddresses();
      resetForm();
    } catch (err) {
      console.error("Failed to save address", err);
      toast.error(
        locale === "vi"
          ? "Có lỗi xảy ra khi lưu địa chỉ. Vui lòng thử lại!"
          : "Failed to save address. Please try again!",
      );
    }
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    toast.success(locale === "vi" ? "Đã xóa địa chỉ!" : "Address deleted!");
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
          {locale === "vi" ? "Địa Chỉ Của Bạn" : "Your Addresses"}
        </h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="flex gap-2">
            <Plus className="w-4 h-4" />{" "}
            {locale === "vi" ? "Thêm địa chỉ mới" : "Add new address"}
          </Button>
        )}
      </div>

      {isAdding ? (
        <div className="space-y-4 bg-muted/30 p-6 rounded-lg border">
          <h3 className="font-medium text-lg mb-4">
            {editingId
              ? locale === "vi"
                ? "Sửa địa chỉ"
                : "Edit address"
              : locale === "vi"
                ? "Thêm địa chỉ mới"
                : "Add new address"}
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              {locale === "vi" ? "Tỉnh/Thành phố" : "Province/City"}
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
                  <SelectValue
                    placeholder={
                      locale === "vi"
                        ? "Chọn Tỉnh/Thành phố"
                        : "Select Province/City"
                    }
                  />
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
              {locale === "vi" ? "Quận/Huyện" : "District"}
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
                  <SelectValue
                    placeholder={
                      locale === "vi" ? "Chọn Quận/Huyện" : "Select District"
                    }
                  />
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
              {locale === "vi" ? "Phường/Xã" : "Ward"}
              <Select
                value={selectedWard}
                onValueChange={(val) => setSelectedWard(val || "")}
                disabled={!selectedDistrict}
              >
                <SelectTrigger className="mt-2 bg-background">
                  <SelectValue
                    placeholder={
                      locale === "vi" ? "Chọn Phường/Xã" : "Select Ward"
                    }
                  />
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
              {locale === "vi" ? "Số điện thoại" : "Phone number"}
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
            {locale === "vi" ? "Địa chỉ cụ thể" : "Specific address"}
            <Input
              className="mt-2"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder={
                locale === "vi"
                  ? "Số nhà, tên đường..."
                  : "House number, street name..."
              }
            />
          </label>

          <label className="flex items-center gap-2 text-sm mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-gray-300"
            />
            {locale === "vi"
              ? "Đặt làm địa chỉ mặc định"
              : "Set as default address"}
          </label>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={resetForm}>
              {locale === "vi" ? "Huỷ" : "Cancel"}
            </Button>
            <Button onClick={handleSaveAddress}>
              {locale === "vi" ? "Lưu địa chỉ" : "Save address"}
            </Button>
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
              <p>
                {locale === "vi"
                  ? "Bạn chưa có địa chỉ nào."
                  : "You have no saved addresses."}
              </p>
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
                        {locale === "vi" ? "Mặc định" : "Default"}
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
  const { locale } = useTranslation();
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
      toast.error(
        locale === "vi"
          ? "Số thẻ phải có đúng 16 chữ số! ❌"
          : "Card number must be exactly 16 digits! ❌",
      );
      return;
    }
    if (!cardName.trim()) {
      toast.error(
        locale === "vi"
          ? "Vui lòng nhập tên chủ thẻ! ❌"
          : "Please enter the cardholder name! ❌",
      );
      return;
    }
    const expiryParts = cardExpiry.split("/");
    if (
      expiryParts.length !== 2 ||
      expiryParts[0].length !== 2 ||
      expiryParts[1].length !== 2
    ) {
      toast.error(
        locale === "vi"
          ? "Ngày hết hạn không đúng định dạng MM/YY! "
          : "Expiry date must be in MM/YY format!",
      );
      return;
    }
    const month = parseInt(expiryParts[0], 10);
    const year = parseInt(expiryParts[1], 10) + 2000;
    if (month < 1 || month > 12) {
      toast.error(
        locale === "vi"
          ? "Tháng hết hạn không hợp lệ (01 - 12)! "
          : "Invalid expiry month (01 - 12)!",
      );
      return;
    }
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      toast.error(
        locale === "vi" ? "Thẻ đã hết hạn sử dụng! " : "Card has expired!",
      );
      return;
    }
    if (cardCvv.length !== 3) {
      toast.error(
        locale === "vi"
          ? "Mã bảo mật CVV phải có đúng 3 chữ số! "
          : "CVV must be exactly 3 digits!",
      );
      return;
    }

    setIsSaving(true);
    const saveToast = toast.loading(
      locale === "vi" ? "Đang liên kết thẻ... " : "Linking card... ",
    );

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
      toast.success(
        locale === "vi"
          ? "Liên kết thẻ thành công! "
          : "Card linked successfully! ",
        { id: saveToast },
      );
      resetForm();
    }, 800);
  };

  const handleDeleteCard = (id: string) => {
    if (
      confirm(
        locale === "vi"
          ? "Bạn có chắc chắn muốn xóa phương thức thanh toán này không?"
          : "Are you sure you want to remove this payment method?",
      )
    ) {
      const cardToDelete = cards.find((c) => c.id === id);
      const updated = cards.filter((c) => c.id !== id);

      if (cardToDelete?.isDefault && updated.length > 0) {
        updated[0].isDefault = true;
      }

      saveToStorage(updated);
      toast.success(
        locale === "vi"
          ? "Đã xóa thẻ thành công! "
          : "Card removed successfully! ",
      );
    }
  };

  const handleSetDefault = (id: string) => {
    const updated = cards.map((c) => ({
      ...c,
      isDefault: c.id === id,
    }));
    saveToStorage(updated);
    toast.success(
      locale === "vi"
        ? "Đã đặt làm phương thức thanh toán mặc định!"
        : "Set as default payment method!",
    );
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
          {locale === "vi" ? "Phương Thức Thanh Toán" : "Payment Methods"}
        </h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="flex gap-2">
            <Plus className="w-4 h-4" />{" "}
            {locale === "vi" ? "Thêm phương thức mới" : "Add new method"}
          </Button>
        )}
      </div>

      {isAdding ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] bg-muted/20 p-6 rounded-xl border">
          <div className="space-y-5">
            <h3 className="font-medium text-lg text-foreground">
              {locale === "vi"
                ? "Liên kết thẻ thanh toán quốc tế"
                : "Link International Payment Card"}
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground flex justify-between">
                  <span>{locale === "vi" ? "Số thẻ" : "Card number"}</span>
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
                  {locale === "vi"
                    ? "Tên chủ thẻ (In nổi trên thẻ)"
                    : "Cardholder name (as printed on card)"}
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
                    {locale === "vi" ? "Ngày hết hạn" : "Expiry date"}
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
                    <span>
                      {locale === "vi" ? "Mã bảo mật CVV" : "CVV security code"}
                    </span>
                    <span className="group relative cursor-pointer text-xs text-muted-foreground border border-muted-foreground rounded-full w-4 h-4 flex items-center justify-center font-mono">
                      ?
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-neutral-900 text-white text-[11px] p-2 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 font-sans normal-case leading-relaxed">
                        {locale === "vi"
                          ? "3 chữ số bảo mật ở mặt sau thẻ của bạn."
                          : "3-digit security code on the back of your card."}
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
                {locale === "vi"
                  ? "Thông tin thẻ được mã hóa và bảo mật theo chuẩn **PCI-DSS**. Mirai cam kết không lưu thông tin thẻ nhạy cảm của bạn trên máy chủ của chúng tôi."
                  : "Card information is encrypted and secured to **PCI-DSS** standards. Mirai does not store your sensitive card data on our servers."}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={resetForm} disabled={isSaving}>
                {locale === "vi" ? "Hủy bỏ" : "Cancel"}
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
                {locale === "vi" ? "Xác nhận liên kết" : "Confirm link"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-l pl-6 border-dashed">
            <p className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
              {locale === "vi" ? "Xem trước thẻ của bạn" : "Your card preview"}
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
                        {locale === "vi" ? "Chủ thẻ" : "Card Holder"}
                      </div>
                      <div className="font-medium tracking-wide uppercase text-sm truncate">
                        {cardName ||
                          (locale === "vi" ? "TÊN CHỦ THẺ" : "CARDHOLDER NAME")}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-white/60 mb-0.5">
                        {locale === "vi" ? "Hết hạn" : "Expires"}
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
                {locale === "vi"
                  ? "Chưa có phương thức thanh toán"
                  : "No payment methods yet"}
              </h3>
              <p>
                {locale === "vi"
                  ? "Bạn chưa liên kết thẻ hay phương thức thanh toán nào."
                  : "You have not linked any card or payment method."}
              </p>
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
                          title={
                            locale === "vi"
                              ? "Đặt làm mặc định"
                              : "Set as default"
                          }
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                        title={locale === "vi" ? "Xóa thẻ" : "Remove card"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {design.logo}
                        {card.isDefault && (
                          <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded-full text-white/90">
                            {locale === "vi" ? "Mặc định" : "Default"}
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

// Map numeric order status to bilingual label
const ORDER_STATUS_MAP_VI: Record<number, { label: string; color: string }> = {
  1: { label: "Đã tạo", color: "bg-blue-100 text-blue-700" },
  2: { label: "Đã xác nhận", color: "bg-purple-100 text-purple-700" },
  3: { label: "Đang giao", color: "bg-orange-100 text-orange-700" },
  4: { label: "Đã giao", color: "bg-green-100 text-green-700" },
  5: { label: "Đã huỷ", color: "bg-red-100 text-red-700" },
};

const ORDER_STATUS_MAP_EN: Record<number, { label: string; color: string }> = {
  1: { label: "Placed", color: "bg-blue-100 text-blue-700" },
  2: { label: "Confirmed", color: "bg-purple-100 text-purple-700" },
  3: { label: "Shipping", color: "bg-orange-100 text-orange-700" },
  4: { label: "Delivered", color: "bg-green-100 text-green-700" },
  5: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

const FILTER_STATUS_MAP: Record<string, number | null> = {
  all: null,
  "Đã tạo": 1,
  "Đã xác nhận": 2,
  "Đang giao": 3,
  "Đã giao": 4,
  "Đã huỷ": 5,
};

function OrdersSection({ initialFilter }: { initialFilter: string }) {
  const { locale } = useTranslation();
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
        setError(
          locale === "vi"
            ? "Không thể tải danh sách đơn hàng. Vui lòng thử lại!"
            : "Failed to load orders. Please try again!",
        );
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          {locale === "vi" ? "Đơn Hàng Của Tôi" : "My Orders"}{" "}
          {filter !== "all" && `(${filter})`}
        </h2>

        <div className="flex gap-2">
          <Select
            value={filter}
            onValueChange={(val) => setFilter(val || "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder={
                  locale === "vi" ? "Lọc trạng thái" : "Filter status"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {locale === "vi" ? "Tất cả trạng thái" : "All statuses"}
              </SelectItem>
              <SelectItem value="Đã tạo">
                {locale === "vi" ? "Đã tạo" : "Placed"}
              </SelectItem>
              <SelectItem value="Đã xác nhận">
                {locale === "vi" ? "Đã xác nhận" : "Confirmed"}
              </SelectItem>
              <SelectItem value="Đang giao">
                {locale === "vi" ? "Đang giao" : "Shipping"}
              </SelectItem>
              <SelectItem value="Đã giao">
                {locale === "vi" ? "Đã giao" : "Delivered"}
              </SelectItem>
              <SelectItem value="Đã huỷ">
                {locale === "vi" ? "Đã huỷ" : "Cancelled"}
              </SelectItem>
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
            {locale === "vi" ? "Chưa có đơn hàng" : "No orders yet"}
          </h3>
          <p>
            {filter === "all"
              ? locale === "vi"
                ? "Bạn chưa có đơn hàng nào."
                : "You have no orders yet."
              : locale === "vi"
                ? `Không có đơn hàng ở trạng thái "${filter}".`
                : `No orders with status "${filter}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusMap =
              locale === "en" ? ORDER_STATUS_MAP_EN : ORDER_STATUS_MAP_VI;
            const statusInfo = statusMap[order.status ?? -1] ?? {
              label: locale === "vi" ? "Không rõ" : "Unknown",
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
                      {locale === "vi" ? "Đơn hàng #" : "Order #"}
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
                          {item.productName ||
                            (locale === "vi" ? "Sản phẩm" : "Product")}
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
                    {locale === "vi" ? "Tổng:" : "Total:"}{" "}
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
