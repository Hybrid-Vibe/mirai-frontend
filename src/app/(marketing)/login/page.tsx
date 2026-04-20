import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="bg-background py-14">
      <div className="page-shell grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <section className="min-h-[620px] rounded-[4px] bg-[#F5F5F5] p-8">
          <div className="grid h-full place-content-center gap-5">
            <div className="mx-auto h-56 w-56 rounded-full bg-gradient-to-br from-[#4349E7] to-[#48E1ED]" />
            <div className="mx-auto h-40 w-72 rounded-3xl bg-gradient-to-br from-[#111216] to-[#2F2E30]" />
          </div>
        </section>

        <section>
          <h1 className="font-heading text-4xl font-semibold text-[#0F0F0F] md:text-5xl">Đăng nhập vào MIRAI</h1>
          <p className="mt-3 text-sm text-[#2F2E30]/70">Nhập thông tin của bạn bên dưới</p>

          <form className="mt-8 space-y-6">
            <input
              type="text"
              placeholder="Email or Phone Number"
              className="h-11 w-full border-b border-[#2F2E30]/40 bg-transparent text-sm outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              className="h-11 w-full border-b border-[#2F2E30]/40 bg-transparent text-sm outline-none"
            />
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                className="h-11 min-w-44 rounded-[4px] bg-[#48E1ED] px-6 text-sm font-semibold text-[#0F0F0F]"
              >
                Đăng nhập
              </button>
              <button type="button" className="text-sm font-medium text-[#4349E7]">
                Quên mật khẩu?
              </button>
            </div>
          </form>

          <p className="mt-8 text-sm text-[#2F2E30]/80">
            Chưa có tài khoản?{" "}
            <Link href="/signup" className="font-semibold underline">
              Tạo tài khoản
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
