"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const checkoutItems = [
  { id: "co-1", name: "Ốp Lưng ASA STAR HEART", price: 85000 },
  { id: "co-2", name: "Ốp Lưng Customize", price: 150000 },
];

const formatPrice = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export default function CheckoutPage() {
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

  const subtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + item.price, 0),
    [],
  );
  const total = subtotal;

  const hasError =
    !firstName.trim() ||
    !address.trim() ||
    !city.trim() ||
    !phone.trim() ||
    !email.trim();

  const handleOrder = () => {
    setSubmitted(true);
    if (hasError) {
      return;
    }
  };

  return (
    <main className="bg-background py-16">
      <div className="page-shell">
        <p className="text-sm text-muted-foreground">
          Tài khoản / Tài Khoản Của Tôi / Sản phẩm / Giỏ Hàng /{" "}
          <span className="font-semibold text-foreground">Thanh Toán</span>
        </p>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_520px]">
          <section>
            <h1 className="font-heading text-4xl font-semibold text-foreground">
              Chi tiết thanh toán
            </h1>
            <form className="mt-8 space-y-5">
              <label className="block text-sm text-muted-foreground">
                Họ*
                <Input
                  className="mt-2"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  aria-invalid={submitted && !firstName.trim()}
                />
              </label>
              <label className="block text-sm text-muted-foreground">
                Tên
                <Input
                  className="mt-2"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </label>
              <label className="block text-sm text-muted-foreground">
                Địa Chỉ*
                <Input
                  className="mt-2"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  aria-invalid={submitted && !address.trim()}
                />
              </label>
              <label className="block text-sm text-muted-foreground">
                Apartment, floor, etc. (optional)
                <Input className="mt-2" />
              </label>
              <label className="block text-sm text-muted-foreground">
                Tỉnh/ Thành Phố*
                <Input
                  className="mt-2"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  aria-invalid={submitted && !city.trim()}
                />
              </label>
              <label className="block text-sm text-muted-foreground">
                Số Điện Thoại *
                <Input
                  className="mt-2"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  aria-invalid={submitted && !phone.trim()}
                />
              </label>
              <label className="block text-sm text-muted-foreground">
                Email *
                <Input
                  className="mt-2"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={submitted && !email.trim()}
                />
              </label>

              <label className="mt-5 flex items-center gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={saveInfo}
                  onChange={(event) => setSaveInfo(event.target.checked)}
                  className="h-4 w-4 accent-(--mirai-sem-accent)"
                />
                Lưu thông tin này để thanh toán nhanh hơn lần sau
              </label>
              {submitted && hasError && (
                <p className="text-sm text-(--mirai-sem-danger)">
                  Vui lòng điền đầy đủ các trường bắt buộc (*).
                </p>
              )}
            </form>
          </section>

          <section className="rounded-[4px] border border-(--mirai-color-line) bg-card p-6 lg:p-8">
            <div className="space-y-4 text-sm text-foreground">
              {checkoutItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-11 w-8 rounded-md bg-gradient-to-b from-(--mirai-sem-text-muted) to-(--mirai-sem-accent)" />
                    <span>{item.name}</span>
                  </div>
                  <span>{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-(--mirai-color-line) pb-3">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-(--mirai-color-line) pb-3">
                <span>Shipping:</span>
                <span>Miễn phí</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total:</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3 text-sm">
              <label className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment-method"
                    className="h-4 w-4"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                  />
                  Thanh Toán Trực Tuyến
                </span>
                <span className="text-xs text-muted-foreground">MOMO  VISA  MC</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment-method"
                  className="h-4 w-4"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                COD
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <Input
                placeholder="Mã giảm giá"
                value={coupon}
                onChange={(event) => setCoupon(event.target.value)}
              />
              <Button type="button" className="min-w-36 rounded-[4px]">
                Áp Dụng
              </Button>
            </div>

            <Button
              type="button"
              onClick={handleOrder}
              className="mt-6 min-w-44 rounded-[4px]"
            >
              {hasError && submitted ? "Kiểm tra lại thông tin" : "Order"}
            </Button>
          </section>
        </div>
      </div>
    </main>
  );
}
