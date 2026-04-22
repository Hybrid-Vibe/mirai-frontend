import { Mail, MapPin, Phone, Send, Clock } from "lucide-react";

export const metadata = {
  title: "Contact Us | MIRAI",
  description: "Liên hệ với nhóm Hybrid Vibe - MIRAI.",
};

export default function ContactPage() {
  return (
    <main className="bg-background pb-24 pt-12">
      <div className="page-shell max-w-6xl">
        <header className="mb-16 text-center">
          <h1 className="font-heading text-4xl font-bold md:text-5xl">Liên hệ MIRAI</h1>
          <p className="mt-4 text-muted-foreground">
            Chúng tôi luôn ở đây để lắng nghe và hỗ trợ bạn.
          </p>
        </header>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-8">
            <h2 className="font-heading text-2xl font-bold text-foreground">
              Thông tin liên hệ
            </h2>
            <p className="text-muted-foreground">
              Nhóm Hybrid Vibe rất mong nhận được phản hồi từ bạn. Dù là thắc mắc về quá trình tạo ốp lưng AI hay góp ý về dịch vụ, hãy liên lạc với chúng tôi!
            </p>

            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--mirai-sem-primary)/10 text-(--mirai-sem-primary)">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">Văn phòng</h3>
                  <p className="mt-1 text-muted-foreground">
                    123, Lê Văn Việt, phường Hiệp Phú,<br />
                    Thủ Đức, TPHCM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--mirai-sem-accent)/10 text-(--mirai-sem-accent)">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">Điện thoại</h3>
                  <p className="mt-1 text-muted-foreground">+88015-88888-9999</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--mirai-sem-primary)/10 text-(--mirai-sem-primary)">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">Email</h3>
                  <p className="mt-1 text-muted-foreground">miraicases@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--mirai-sem-accent)/10 text-(--mirai-sem-accent)">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">Giờ làm việc</h3>
                  <p className="mt-1 text-muted-foreground">Thứ 2 - Thứ 6: 08:00 - 18:00</p>
                  <p className="text-muted-foreground">Thứ 7 - CN: 09:00 - 15:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-[16px] border border-(--mirai-color-line) bg-card p-8 shadow-sm lg:p-10">
            <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">
              Gửi tin nhắn cho chúng tôi
            </h2>
            <form className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Họ và tên
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full rounded-[4px] border border-(--mirai-color-line) bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-(--mirai-sem-primary)"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="VD: email@example.com"
                    className="w-full rounded-[4px] border border-(--mirai-color-line) bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-(--mirai-sem-primary)"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-foreground">
                  Chủ đề
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Bạn cần hỗ trợ về vấn đề gì?"
                  className="w-full rounded-[4px] border border-(--mirai-color-line) bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-(--mirai-sem-primary)"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">
                  Nội dung tin nhắn
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Hãy chia sẻ chi tiết ở đây..."
                  className="w-full resize-y rounded-[4px] border border-(--mirai-color-line) bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-(--mirai-sem-primary)"
                  required
                />
              </div>

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-[4px] bg-(--mirai-sem-text) py-4 text-sm font-bold text-(--mirai-sem-background) transition-all hover:bg-(--mirai-sem-primary) hover:text-[#0F0F0F] active:scale-[0.98]"
              >
                <Send className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                Gửi tin nhắn
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
