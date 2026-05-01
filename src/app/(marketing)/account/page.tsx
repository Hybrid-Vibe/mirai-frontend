"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AccountPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [firstName, setFirstName] = useState("Nguyen");
  const [lastName, setLastName] = useState("Sharon");
  const [email, setEmail] = useState("sharon@example.com");
  const [address, setAddress] = useState("Thu Duc, Ho Chi Minh City");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <main className="bg-background py-16">
      <div className="page-shell">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Home / My Account</p>
          <p className="text-sm text-foreground">
            Welcome!{" "}
            <span className="font-semibold text-(--mirai-sem-danger)">
              Sharon
            </span>
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside>
            <h1 className="font-heading text-3xl font-semibold text-foreground">
              Quản Lý Tài Khoản
            </h1>
            <ul className="mt-5 space-y-2 text-base text-muted-foreground">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveSection("profile")}
                  className={
                    activeSection === "profile"
                      ? "font-semibold text-(--mirai-sem-danger)"
                      : ""
                  }
                >
                  Tài Khoản Của Tôi
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveSection("address")}
                  className={
                    activeSection === "address"
                      ? "font-semibold text-(--mirai-sem-danger)"
                      : ""
                  }
                >
                  Địa Chỉ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveSection("payment")}
                  className={
                    activeSection === "payment"
                      ? "font-semibold text-(--mirai-sem-danger)"
                      : ""
                  }
                >
                  Phương Thức Thanh Toán
                </button>
              </li>
            </ul>

            <h2 className="mt-8 font-heading text-2xl font-semibold text-foreground">
              Đơn Hàng Của Tôi
            </h2>
            <ul className="mt-5 space-y-2 text-base text-muted-foreground">
              <li>Trả Hàng</li>
              <li>Huỷ Đơn</li>
            </ul>

            <h2 className="mt-8 font-heading text-2xl font-semibold text-foreground">
              My WishList
            </h2>
          </aside>

          <section className="rounded-[4px] border border-(--mirai-color-line) bg-card p-8 lg:p-10">
            <h2 className="font-heading text-2xl font-semibold text-(--mirai-sem-danger)">
              Chỉnh sửa thông tin
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <label className="text-sm text-foreground">
                Họ
                <Input
                  className="mt-2"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </label>
              <label className="text-sm text-foreground">
                Tên
                <Input
                  className="mt-2"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </label>
              <label className="text-sm text-foreground">
                Email
                <Input
                  className="mt-2"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="text-sm text-foreground">
                Address
                <Input
                  className="mt-2"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
              </label>
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="font-heading text-xl font-semibold text-foreground">
                Password Changes
              </h3>
              {["Current Password", "New Password", "Confirm New Password"].map(
                (label) => (
                  <Input
                    key={label}
                    placeholder={label}
                    className="h-11 rounded-[4px] bg-(--mirai-sem-surface-muted)"
                  />
                ),
              )}
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <Button type="button" variant="ghost" className="min-w-28">
                Huỷ
              </Button>
              <Button type="button" className="min-w-44" onClick={handleSave}>
                {saved ? "Đã lưu" : "Lưu Thay Đổi"}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
