"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cart-store";
import { useDesignStore } from "@/lib/store";
import { orderApi, paymentApi } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const formatPrice = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export default function CheckoutPage() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const user = useDesignStore((state) => state.user);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [coupon, setCoupon] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("cod");
  const [saveInfo, setSaveInfo] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const prefilledRef = useRef(false);
  // Prefill user data if logged in
  useEffect(() => {
    if (user && !prefilledRef.current) {
      const parts = user.name.split(" ");
      const fName = parts[parts.length - 1] || "";
      const lName = parts.slice(0, -1).join(" ") || "";

      setFirstName(fName);
      setLastName(lName);
      setEmail(user.email);
      prefilledRef.current = true;
    }
  }, [user]);

  const subtotal = getSubtotal();
  const total = subtotal;

  const hasError =
    !firstName.trim() ||
    !address.trim() ||
    !city.trim() ||
    !phone.trim() ||
    !email.trim() ||
    cartItems.length === 0;

  const handleOrder = async () => {
    setSubmitted(true);
    if (hasError) {
      if (cartItems.length === 0) toast.error("Giỏ hàng của bạn đang trống.");
      return;
    }

    setIsProcessing(true);
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
      toast.success("Đặt hàng thành công!");

      // 2. Handle Payment
      if (paymentMethod === "online") {
        toast.info("Đang chuyển đến trang thanh toán...");
        try {
          const paymentUrlData = await paymentApi.createPaymentUrl({
            orderId: orderResponse.orderId,
            amount: total,
          });
          if (paymentUrlData.paymentUrl) {
            // Use replace for external redirects to avoid history stack issues
            // and satisfy strict linting rules by treating it as a final action
            window.location.replace(paymentUrlData.paymentUrl);
            return;
          }
        } catch (paymentErr) {
          console.error("Payment URL creation failed", paymentErr);
          toast.error(
            "Không thể khởi tạo thanh toán trực tuyến. Vui lòng thử lại.",
          );
        }
      }

      // 3. Post-order cleanup
      clearCart();
      router.push("/account"); // Redirect to orders page
    } catch (err) {
      console.error("Order creation failed", err);
      toast.error("Đã có lỗi xảy ra trong quá trình đặt hàng.");
    } finally {
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
            <form className="mt-8 space-y-5">
              <label className="block text-sm text-muted-foreground">
                Tên*
                <Input
                  className="mt-2"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Nhập tên"
                  aria-invalid={submitted && !firstName.trim()}
                />
              </label>
              <label className="block text-sm text-muted-foreground">
                Họ & Tên lót
                <Input
                  className="mt-2"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Nhập họ và tên lót"
                />
              </label>
              <label className="block text-sm text-muted-foreground">
                Địa Chỉ Nhận Hàng*
                <Input
                  className="mt-2"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Số nhà, tên đường..."
                  aria-invalid={submitted && !address.trim()}
                />
              </label>
              <label className="block text-sm text-muted-foreground">
                Ghi chú thêm (tùy chọn)
                <Input
                  className="mt-2"
                  placeholder="Ví dụ: Giao giờ hành chính"
                />
              </label>
              <label className="block text-sm text-muted-foreground">
                Tỉnh/ Thành Phố*
                <Input
                  className="mt-2"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Ví dụ: TP. Hồ Chí Minh"
                  aria-invalid={submitted && !city.trim()}
                />
              </label>
              <label className="block text-sm text-muted-foreground">
                Số Điện Thoại*
                <Input
                  className="mt-2"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="09xx xxx xxx"
                  aria-invalid={submitted && !phone.trim()}
                />
              </label>
              <label className="block text-sm text-muted-foreground">
                Email nhận thông báo*
                <Input
                  className="mt-2"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="example@gmail.com"
                  aria-invalid={submitted && !email.trim()}
                />
              </label>

              <label className="mt-5 flex items-center gap-3 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveInfo}
                  onChange={(event) => setSaveInfo(event.target.checked)}
                  className="h-4 w-4 accent-(--mirai-sem-accent) rounded border-gray-300"
                />
                Lưu thông tin này để thanh toán nhanh hơn lần sau
              </label>
              {submitted && hasError && (
                <p className="text-sm text-(--mirai-sem-danger) font-medium">
                  {cartItems.length === 0
                    ? "Giỏ hàng trống"
                    : "Vui lòng điền đầy đủ các trường bắt buộc (*)."}
                </p>
              )}
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
