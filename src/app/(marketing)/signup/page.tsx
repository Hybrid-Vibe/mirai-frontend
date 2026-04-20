import Link from "next/link";

export default function SignupPage() {
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
          <h1 className="font-heading text-4xl font-semibold text-[#0F0F0F] md:text-5xl">Tạo một tài khoản</h1>
          <p className="mt-3 text-sm text-[#2F2E30]/70">Nhập thông tin của bạn bên dưới</p>

          <form className="mt-8 space-y-6">
            {["Name", "Email or Phone Number", "Password"].map((field) => (
              <input
                key={field}
                type={field === "Password" ? "password" : "text"}
                placeholder={field}
                className="h-11 w-full border-b border-[#2F2E30]/40 bg-transparent text-sm outline-none"
              />
            ))}
            <button
              type="submit"
              className="h-11 w-full rounded-[4px] bg-[#48E1ED] px-6 text-sm font-semibold text-[#0F0F0F]"
            >
              Tạo tài khoản
            </button>
          </form>

          <button
            type="button"
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-3 rounded-[4px] border border-[#2F2E30]/40 bg-white text-sm"
          >
            <span className="text-lg">G</span>
            Sign up with Google
          </button>

          <p className="mt-8 text-sm text-[#2F2E30]/80">
            Bạn đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold underline">
              Đăng nhập
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
