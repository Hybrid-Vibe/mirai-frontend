import { Shield, Lock, Eye, Database, Server } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | MIRAI",
  description: "Chính sách bảo mật thông tin và dữ liệu cá nhân tại MIRAI.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-background pb-24 pt-12">
      <div className="page-shell max-w-4xl">
        <header className="mb-16 text-center">
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-(--mirai-sem-primary)/10 text-(--mirai-sem-primary)">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-4xl font-bold md:text-5xl">Chính sách Bảo mật</h1>
          <p className="mt-4 text-muted-foreground">Cập nhật lần cuối: Tháng 4, 2026</p>
        </header>

        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-12">
          <section>
            <h2 className="flex items-center gap-3 font-heading text-2xl font-semibold text-foreground">
              <Eye className="h-6 w-6 text-(--mirai-sem-primary)" />
              1. Thu thập thông tin
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Tại MIRAI, chúng tôi tin rằng "Mirror + AI" là sự phản chiếu chính xác cá tính của bạn. Để mang lại trải nghiệm cá nhân hoá tốt nhất (ví dụ: tạo ốp lưng bằng AI), chúng tôi có thể thu thập các thông tin sau:
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>Thông tin định danh: Họ tên, email, số điện thoại, địa chỉ giao hàng.</li>
              <li>Dữ liệu cá nhân hoá: Hình ảnh tải lên, câu lệnh (prompts) thiết kế, lịch sử mua hàng.</li>
              <li>Dữ liệu thiết bị & Analytics: Địa chỉ IP, loại trình duyệt, thời gian truy cập nhằm tối ưu hoá UI/UX.</li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-3 font-heading text-2xl font-semibold text-foreground">
              <Lock className="h-6 w-6 text-(--mirai-sem-primary)" />
              2. Sử dụng thông tin
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Thông tin của bạn được sử dụng vào các mục đích chính:
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>Xử lý đơn hàng và giao sản phẩm phụ kiện cá nhân hoá đến tay bạn.</li>
              <li>Hỗ trợ AI học hỏi (dựa trên dữ liệu ẩn danh) để đưa ra các gợi ý thiết kế ốp lưng chính xác hơn.</li>
              <li>Gửi email xác nhận, cập nhật tình trạng đơn hàng và thông báo khuyến mãi (bạn có thể huỷ đăng ký bất cứ lúc nào).</li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-3 font-heading text-2xl font-semibold text-foreground">
              <Database className="h-6 w-6 text-(--mirai-sem-primary)" />
              3. Bảo vệ dữ liệu thiết kế
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Tất cả các hình ảnh cá nhân và thiết kế AI được tạo ra bởi bạn thuộc về quyền riêng tư của bạn. MIRAI cam kết không sử dụng hình ảnh cá nhân hoá của khách hàng cho mục đích quảng cáo thương mại nếu chưa có sự đồng ý bằng văn bản.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-3 font-heading text-2xl font-semibold text-foreground">
              <Server className="h-6 w-6 text-(--mirai-sem-primary)" />
              4. Chia sẻ thông tin với bên thứ ba
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Chúng tôi tuyệt đối không bán, trao đổi hoặc cho thuê thông tin cá nhân của bạn. Thông tin chỉ được chia sẻ trong các trường hợp bắt buộc như:
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>Đối tác vận chuyển (ví dụ: GHN, Viettel Post) để giao hàng.</li>
              <li>Cổng thanh toán an toàn để xử lý giao dịch.</li>
              <li>Yêu cầu pháp lý từ các cơ quan có thẩm quyền.</li>
            </ul>
          </section>

          <div className="mt-12 rounded-xl bg-(--mirai-color-surface-muted) p-6">
            <h3 className="font-heading text-lg font-semibold text-foreground">Bạn có thắc mắc?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Nếu có bất kỳ câu hỏi nào về Chính sách Bảo mật, vui lòng liên hệ với nhóm Hybrid Vibe tại <a href="mailto:privacy@mirai.vn" className="text-(--mirai-sem-primary) hover:underline">privacy@mirai.vn</a>.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
