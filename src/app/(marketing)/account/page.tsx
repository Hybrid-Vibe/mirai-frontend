export default function AccountPage() {
  return (
    <main className="bg-background py-14">
      <div className="page-shell">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#2F2E30]/70">Home / My Account</p>
          <p className="text-sm text-[#2F2E30]">
            Welcome! <span className="font-semibold text-[#DB4444]">Sharon</span>
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[250px_1fr]">
          <aside>
            <h1 className="font-heading text-2xl font-semibold text-[#0F0F0F]">Quản Lý Tài Khoản</h1>
            <ul className="mt-5 space-y-2 text-sm text-[#2F2E30]/70">
              <li className="font-semibold text-[#DB4444]">Tài Khoản Của Tôi</li>
              <li>Địa Chỉ</li>
              <li>Phương Thức Thanh Toán</li>
            </ul>

            <h2 className="mt-8 font-heading text-2xl font-semibold text-[#0F0F0F]">Đơn Hàng Của Tôi</h2>
            <ul className="mt-5 space-y-2 text-sm text-[#2F2E30]/70">
              <li>Trả Hàng</li>
              <li>Huỷ Đơn</li>
            </ul>

            <h2 className="mt-8 font-heading text-2xl font-semibold text-[#0F0F0F]">My WishList</h2>
          </aside>

          <section className="rounded-[4px] border border-[color:var(--mirai-color-line)] bg-white p-8 lg:p-12">
            <h2 className="font-heading text-2xl font-semibold text-[#DB4444]">Chỉnh sửa thông tin</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {[
                { label: "Họ", value: "Nguyen" },
                { label: "Tên", value: "Sharon" },
                { label: "Email", value: "sharon@example.com" },
                { label: "Address", value: "Thu Duc, Ho Chi Minh City" },
              ].map((field) => (
                <label key={field.label} className="text-sm text-[#0F0F0F]">
                  {field.label}
                  <input
                    defaultValue={field.value}
                    className="mt-2 h-11 w-full rounded-[4px] border border-[color:var(--mirai-color-line)] bg-[#F5F5F5] px-4"
                  />
                </label>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="font-heading text-2xl font-semibold text-[#0F0F0F]">Password Changes</h3>
              {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                <input
                  key={label}
                  placeholder={label}
                  className="h-11 w-full rounded-[4px] border border-[color:var(--mirai-color-line)] bg-[#F5F5F5] px-4 text-sm"
                />
              ))}
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button type="button" className="h-11 min-w-28 text-sm font-semibold text-[#0F0F0F]">
                Huỷ
              </button>
              <button
                type="button"
                className="h-11 min-w-44 rounded-[4px] bg-[#48E1ED] px-6 text-sm font-semibold text-[#0F0F0F]"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
