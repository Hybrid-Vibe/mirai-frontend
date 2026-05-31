"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cart-store";
import { useDesignStore } from "@/lib/store";
import { orderApi, paymentApi, addressApi } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader2, MapPin, Check, Plus } from "lucide-react";
import { AddressResponseDto } from "@/types/api";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationItem {
  code: number | string;
  name: string;
}

const formatPrice = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

interface ValidationErrors {
  firstName?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const user = useDesignStore((state) => state.user);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [coupon, setCoupon] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("cod");
  const [saveInfo, setSaveInfo] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Provinces, districts, wards selector states
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [wards, setWards] = useState<LocationItem[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [pendingDistrict, setPendingDistrict] = useState("");
  const [pendingWard, setPendingWard] = useState("");

  // Address repository state
  const [savedAddresses, setSavedAddresses] = useState<AddressResponseDto[]>(
    [],
  );
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  // Validation state
  const [errors, setErrors] = useState<ValidationErrors>({});

  const prefilledRef = useRef(false);

  // Address selection handlers defined first to prevent access before declaration
  const handleSelectAddress = (addr: AddressResponseDto) => {
    setSelectedAddressId(addr.addressId);

    // Split recipientName into first and last name
    const nameParts = (addr.recipientName || "").trim().split(" ");
    const fName = nameParts[nameParts.length - 1] || "";
    const lName = nameParts.slice(0, -1).join(" ") || "";

    setFirstName(fName);
    setLastName(lName);

    setAddress(addr.addressLine || "");
    setCity(addr.province || addr.city || "");
    setPhone(addr.recipientPhone || "");
    setErrors({});

    // Set dynamic dropdown selectors
    setSelectedProvince(addr.province || addr.city || "");
    setPendingDistrict(addr.district || "");
    setPendingWard(addr.ward || "");
  };

  const handleSelectCustomAddress = () => {
    setSelectedAddressId("custom");
    setFirstName("");
    setLastName("");
    setAddress("");
    setCity("");
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);
    setPhone("");
    setErrors({});
  };

  // Fetch provinces on mount
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Error fetching provinces", err));
  }, []);

  // Fetch districts when province changes
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

  // Fetch wards when district changes
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

  // Prefill default user data if logged in
  useEffect(() => {
    if (user && !prefilledRef.current) {
      const parts = user.name.split(" ");
      const fName = parts[parts.length - 1] || "";
      const lName = parts.slice(0, -1).join(" ") || "";

      setFirstName(fName);
      setLastName(lName);
      setEmail(user.email);

      if (typeof window !== "undefined") {
        const savedLocal = localStorage.getItem(`mirai_profile_${user.id}`);
        if (savedLocal) {
          try {
            const localData = JSON.parse(savedLocal) as { phone?: string };
            if (localData.phone) {
              Promise.resolve().then(() => setPhone(localData.phone!));
            }
          } catch (e) {
            console.error("Failed to parse local profile:", e);
          }
        }
      }
      prefilledRef.current = true;
    }
  }, [user]);

  // Load saved addresses when user is logged in
  useEffect(() => {
    if (user?.id) {
      Promise.resolve().then(() => {
        setIsLoadingAddresses(true);
        addressApi
          .getAddressByUserId(user.id)
          .then((data) => {
            setSavedAddresses(data || []);
            // Automatically select default address if available
            const defaultAddr = data?.find((addr) => addr.isDefault);
            if (defaultAddr) {
              handleSelectAddress(defaultAddr);
            }
          })
          .catch((err) => {
            console.error("Failed to fetch user addresses:", err);
          })
          .finally(() => {
            setIsLoadingAddresses(false);
          });
      });
    } else {
      Promise.resolve().then(() => {
        setSavedAddresses([]);
      });
    }
  }, [user]);

  const subtotal = getSubtotal();
  const total = subtotal;

  const validateForm = (): boolean => {
    const tempErrors: ValidationErrors = {};
    if (!firstName.trim()) {
      tempErrors.firstName = "Vui lòng nhập tên nhận hàng.";
    }
    if (!address.trim()) {
      tempErrors.address = "Vui lòng nhập địa chỉ nhận hàng.";
    }
    if (!selectedProvince) {
      tempErrors.city = "Vui lòng chọn tỉnh/thành phố.";
    }
    if (!phone.trim()) {
      tempErrors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!/^(0|84)(3|5|7|8|9)[0-9]{8}$/.test(phone.trim())) {
      tempErrors.phone =
        "Số điện thoại không hợp lệ (phải gồm 10 chữ số bắt đầu bằng 03, 05, 07, 08, 09).";
    }
    if (!email.trim()) {
      tempErrors.email = "Vui lòng nhập email nhận thông báo.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      tempErrors.email =
        "Địa chỉ email không hợp lệ (ví dụ: name@example.com).";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleOrder = async () => {
    const isValid = validateForm();
    if (cartItems.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống.");
      return;
    }

    if (!isValid) {
      toast.error("Vui lòng kiểm tra và điền đầy đủ các thông tin cần thiết.");
      return;
    }

    setIsProcessing(true);
    // SINGLE LOADING TOAST INITIALIZATION
    const toastId = toast.loading("Đang xử lý đặt hàng...");

    try {
      // 1. Create Order
      const orderRequest = {
        userId: (user as unknown as { id: string })?.id || "guest",
        note: "", // added note
        products: cartItems.map((item) => ({
          variantId: item.id,
          quantity: item.quantity,
        })),
      };

      const orderResponse = await orderApi.createOrder(orderRequest);

      // Save address if checked
      if (saveInfo && user?.id) {
        try {
          const recipientName =
            `${lastName} ${firstName}`.trim() || firstName.trim();
          await addressApi.createAddress({
            userId: user.id,
            recipientName,
            recipientPhone: phone,
            addressLine: address,
            province: selectedProvince,
            city: selectedProvince,
            district: selectedDistrict,
            ward: selectedWard,
            note: "Lưu từ trang Checkout",
          });
          toast.success("Đã lưu địa chỉ vào kho địa chỉ của bạn.");
        } catch (saveErr) {
          console.error("Failed to save checkout address:", saveErr);
        }
      }

      // 2. Handle Payment
      if (paymentMethod === "online") {
        toast.loading("Đang khởi tạo cổng thanh toán trực tuyến...", {
          id: toastId,
        });
        try {
          const paymentUrlData = await paymentApi.createPaymentUrl({
            orderId: orderResponse.orderId,
            amount: total,
          });
          if (paymentUrlData.paymentUrl) {
            toast.success("Chuyển đến trang thanh toán...", { id: toastId });
            setTimeout(() => {
              window.location.replace(paymentUrlData.paymentUrl);
            }, 800);
            return;
          }
        } catch (paymentErr) {
          console.error("Payment URL creation failed", paymentErr);
          toast.error(
            "Không thể khởi tạo thanh toán trực tuyến. Vui lòng thử lại.",
            { id: toastId },
          );
          setIsProcessing(false);
          return;
        }
      }

      // 3. COD flow
      toast.success("Đặt hàng thành công!", { id: toastId });
      clearCart();
      setTimeout(() => {
        router.push("/account"); // Redirect to orders page
      }, 1200);
    } catch (err) {
      console.error("Order creation failed", err);
      toast.error("Đã có lỗi xảy ra trong quá trình đặt hàng.", {
        id: toastId,
      });
      setIsProcessing(false);
    }
  };

  return (
    <main className="bg-background py-16">
      <div className="page-shell">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/account">Tài khoản</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/shop">Sản phẩm</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/cart">Giỏ Hàng</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Thanh Toán</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_520px]">
          <section>
            <h1 className="font-heading text-4xl font-semibold text-foreground">
              Chi tiết thanh toán
            </h1>

            {/* SAVED ADDRESS SELECTOR GRID */}
            {user && (
              <div className="mt-8 mb-6 p-6 rounded-xl border border-(--mirai-color-line) bg-card/20 backdrop-blur-md">
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-(--mirai-sem-primary)" />
                  Chọn từ địa chỉ đã lưu
                </h2>
                {isLoadingAddresses ? (
                  <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-(--mirai-sem-primary)" />
                    Đang tải danh sách địa chỉ...
                  </div>
                ) : savedAddresses.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.addressId;
                      return (
                        <button
                          key={addr.addressId}
                          type="button"
                          onClick={() => handleSelectAddress(addr)}
                          className={`text-left p-3.5 rounded-lg border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                            isSelected
                              ? "border-(--mirai-sem-primary) bg-(--mirai-sem-primary)/5 shadow-[0_0_15px_rgba(var(--mirai-sem-primary-rgb),0.1)]"
                              : "border-(--mirai-color-line) bg-card/45 hover:border-foreground/20 hover:bg-card/75"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1.5 w-full">
                            <span className="font-semibold text-foreground text-xs line-clamp-1">
                              {addr.recipientName || user.name}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[9px] bg-(--mirai-sem-primary)/10 text-(--mirai-sem-primary) px-1.5 py-0.5 rounded-full font-medium shrink-0">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mb-1">
                            {addr.recipientPhone}
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {[
                              addr.addressLine,
                              addr.ward,
                              addr.district,
                              addr.city,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          {isSelected && (
                            <div className="absolute top-0 right-0 w-6 h-6 bg-(--mirai-sem-primary) rounded-bl-full flex items-center justify-center pl-1.5 pb-1.5">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={handleSelectCustomAddress}
                      className={`text-left p-3.5 rounded-lg border border-dashed transition-all duration-300 flex flex-col justify-center items-center gap-1.5 min-h-[100px] ${
                        selectedAddressId === "custom"
                          ? "border-(--mirai-sem-primary) bg-(--mirai-sem-primary)/5"
                          : "border-(--mirai-color-line) bg-card/45 hover:border-foreground/20 hover:bg-card/75"
                      }`}
                    >
                      <Plus className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-xs text-foreground text-center">
                        Nhập địa chỉ mới
                      </span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Bạn chưa lưu địa chỉ nào. Vui lòng nhập thông tin giao hàng
                    bên dưới.
                  </p>
                )}
              </div>
            )}

            <form className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-muted-foreground">
                    Tên*
                    <Input
                      className={`mt-1.5 ${errors.firstName ? "border-(--mirai-sem-danger) focus-visible:ring-(--mirai-sem-danger)" : ""}`}
                      value={firstName}
                      onChange={(event) => {
                        setFirstName(event.target.value);
                        if (errors.firstName)
                          setErrors((prev) => ({
                            ...prev,
                            firstName: undefined,
                          }));
                        if (selectedAddressId && selectedAddressId !== "custom")
                          setSelectedAddressId("custom");
                      }}
                      onBlur={() => {
                        if (!firstName.trim()) {
                          setErrors((prev) => ({
                            ...prev,
                            firstName: "Vui lòng nhập tên nhận hàng.",
                          }));
                        }
                      }}
                      placeholder="Nhập tên"
                      aria-invalid={!!errors.firstName}
                    />
                  </label>
                  {errors.firstName && (
                    <p className="mt-1 text-xs font-medium text-(--mirai-sem-danger) animate-in fade-in duration-200">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground">
                    Họ & Tên lót
                    <Input
                      className="mt-1.5"
                      value={lastName}
                      onChange={(event) => {
                        setLastName(event.target.value);
                        if (selectedAddressId && selectedAddressId !== "custom")
                          setSelectedAddressId("custom");
                      }}
                      placeholder="Nhập họ và tên lót"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground">
                  Địa Chỉ Nhận Hàng*
                  <Input
                    className={`mt-1.5 ${errors.address ? "border-(--mirai-sem-danger) focus-visible:ring-(--mirai-sem-danger)" : ""}`}
                    value={address}
                    onChange={(event) => {
                      setAddress(event.target.value);
                      if (errors.address)
                        setErrors((prev) => ({ ...prev, address: undefined }));
                      if (selectedAddressId && selectedAddressId !== "custom")
                        setSelectedAddressId("custom");
                    }}
                    onBlur={() => {
                      if (!address.trim()) {
                        setErrors((prev) => ({
                          ...prev,
                          address: "Vui lòng nhập địa chỉ nhận hàng.",
                        }));
                      }
                    }}
                    placeholder="Số nhà, tên đường..."
                    aria-invalid={!!errors.address}
                  />
                </label>
                {errors.address && (
                  <p className="mt-1 text-xs font-medium text-(--mirai-sem-danger) animate-in fade-in duration-200">
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm text-muted-foreground">
                    Tỉnh/Thành phố*
                    <Select
                      value={selectedProvince}
                      onValueChange={(val) => {
                        setSelectedProvince(val || "");
                        setSelectedDistrict("");
                        setSelectedWard("");
                        setDistricts([]);
                        setWards([]);
                        setCity(val || "");
                        if (errors.city)
                          setErrors((prev) => ({ ...prev, city: undefined }));
                        if (selectedAddressId && selectedAddressId !== "custom")
                          setSelectedAddressId("custom");
                      }}
                    >
                      <SelectTrigger className="mt-1.5 bg-background">
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
                  {errors.city && (
                    <p className="mt-1 text-xs font-medium text-(--mirai-sem-danger) animate-in fade-in duration-200">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground">
                    Quận/Huyện*
                    <Select
                      value={selectedDistrict}
                      onValueChange={(val) => {
                        setSelectedDistrict(val || "");
                        setSelectedWard("");
                        setWards([]);
                        if (selectedAddressId && selectedAddressId !== "custom")
                          setSelectedAddressId("custom");
                      }}
                      disabled={!selectedProvince}
                    >
                      <SelectTrigger className="mt-1.5 bg-background">
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
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground">
                    Phường/Xã*
                    <Select
                      value={selectedWard}
                      onValueChange={(val) => {
                        setSelectedWard(val || "");
                        if (selectedAddressId && selectedAddressId !== "custom")
                          setSelectedAddressId("custom");
                      }}
                      disabled={!selectedDistrict}
                    >
                      <SelectTrigger className="mt-1.5 bg-background">
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
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-muted-foreground">
                    Số Điện Thoại*
                    <Input
                      className={`mt-1.5 ${errors.phone ? "border-(--mirai-sem-danger) focus-visible:ring-(--mirai-sem-danger)" : ""}`}
                      value={phone}
                      onChange={(event) => {
                        setPhone(event.target.value);
                        if (errors.phone)
                          setErrors((prev) => ({ ...prev, phone: undefined }));
                        if (selectedAddressId && selectedAddressId !== "custom")
                          setSelectedAddressId("custom");
                      }}
                      onBlur={() => {
                        if (!phone.trim()) {
                          setErrors((prev) => ({
                            ...prev,
                            phone: "Vui lòng nhập số điện thoại.",
                          }));
                        } else if (
                          !/^(0|84)(3|5|7|8|9)[0-9]{8}$/.test(phone.trim())
                        ) {
                          setErrors((prev) => ({
                            ...prev,
                            phone:
                              "Số điện thoại không hợp lệ (gồm 10 số bắt đầu bằng 03, 05, 07, 08, 09).",
                          }));
                        }
                      }}
                      placeholder="09xx xxx xxx"
                      aria-invalid={!!errors.phone}
                    />
                  </label>
                  {errors.phone && (
                    <p className="mt-1 text-xs font-medium text-(--mirai-sem-danger) animate-in fade-in duration-200">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground">
                    Email nhận thông báo*
                    <Input
                      className={`mt-1.5 ${errors.email ? "border-(--mirai-sem-danger) focus-visible:ring-(--mirai-sem-danger)" : ""}`}
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (errors.email)
                          setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      onBlur={() => {
                        if (!email.trim()) {
                          setErrors((prev) => ({
                            ...prev,
                            email: "Vui lòng nhập email nhận thông báo.",
                          }));
                        } else if (
                          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                        ) {
                          setErrors((prev) => ({
                            ...prev,
                            email:
                              "Địa chỉ email không hợp lệ (ví dụ: name@example.com).",
                          }));
                        }
                      }}
                      placeholder="example@gmail.com"
                      aria-invalid={!!errors.email}
                    />
                  </label>
                  {errors.email && (
                    <p className="mt-1 text-xs font-medium text-(--mirai-sem-danger) animate-in fade-in duration-200">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground">
                  Ghi chú thêm (tùy chọn)
                  <Input
                    className="mt-1.5"
                    placeholder="Ví dụ: Giao giờ hành chính"
                  />
                </label>
              </div>

              <label className="mt-5 flex items-center gap-3 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveInfo}
                  onChange={(event) => setSaveInfo(event.target.checked)}
                  className="h-4 w-4 accent-(--mirai-sem-accent) rounded border-gray-300"
                />
                Lưu thông tin này để thanh toán nhanh hơn lần sau
              </label>
            </form>
          </section>

          <section className="rounded-[4px] border border-(--mirai-color-line) bg-card p-6 lg:p-8 h-fit sticky top-24">
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              Đơn hàng của bạn
            </h2>
            <div className="space-y-4 text-sm text-foreground max-h-[300px] overflow-y-auto pr-2">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-12 w-10 shrink-0 rounded-md bg-muted overflow-hidden border border-(--mirai-color-line)">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-b from-muted to-muted/50" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          SL: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-muted-foreground">
                  Chưa có sản phẩm nào.
                </p>
              )}
            </div>

            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-(--mirai-color-line) pb-3">
                <span>Tạm tính:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-(--mirai-color-line) pb-3">
                <span>Phí vận chuyển:</span>
                <span className="text-green-600 font-medium">Miễn phí</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-base font-semibold">Tổng cộng:</span>
                <span className="text-xl font-bold text-(--mirai-sem-danger)">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <p className="text-sm font-semibold text-foreground">
                Phương thức thanh toán
              </p>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg border border-(--mirai-color-line) cursor-pointer hover:bg-muted transition-colors">
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment-method"
                      className="h-4 w-4 accent-(--mirai-sem-primary)"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                    />
                    <span className="text-sm font-medium">
                      Thanh Toán Trực Tuyến
                    </span>
                  </span>
                  <div className="flex gap-1">
                    <span
                      className="h-4 w-6 bg-blue-600 rounded-sm"
                      title="VISA"
                    ></span>
                    <span
                      className="h-4 w-6 bg-red-500 rounded-sm"
                      title="MOMO"
                    ></span>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-(--mirai-color-line) cursor-pointer hover:bg-muted transition-colors">
                  <input
                    type="radio"
                    name="payment-method"
                    className="h-4 w-4 accent-(--mirai-sem-primary)"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <span className="text-sm font-medium">
                    Thanh toán khi nhận hàng (COD)
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Input
                placeholder="Mã giảm giá"
                value={coupon}
                onChange={(event) => setCoupon(event.target.value)}
                className="rounded-[4px]"
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 rounded-[4px]"
              >
                Áp Dụng
              </Button>
            </div>

            <Button
              type="button"
              onClick={handleOrder}
              disabled={isProcessing}
              className="mt-8 w-full h-12 text-base font-bold bg-(--mirai-sem-primary) hover:bg-(--mirai-sem-primary)/90 text-foreground rounded-[4px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận đặt hàng"
              )}
            </Button>

            <p className="mt-4 text-[11px] text-center text-muted-foreground">
              Bằng cách nhấn nút, bạn đồng ý với các Điều khoản & Chính sách của
              Mirai.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
