import { FileText, AlertCircle, RefreshCw, Scale } from "lucide-react";

export const metadata = {
  title: "Terms of Use | MIRAI",
  description: "Điều khoản sử dụng dịch vụ và nền tảng MIRAI.",
};

export default function TermsOfUsePage() {
  return (
    <main className="bg-background pb-24 pt-12">
      <div className="page-shell max-w-4xl">
        <header className="mb-16 text-center">
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-(--mirai-sem-accent)/10 text-(--mirai-sem-accent)">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-4xl font-bold md:text-5xl">
            Điều khoản Sử dụng
          </h1>
          <p className="mt-4 text-muted-foreground">
            Cập nhật lần cuối: Tháng 4, 2026
          </p>
        </header>

        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-12">
          <section>
            <h2 className="flex items-center gap-3 font-heading text-2xl font-semibold text-foreground">
              <Scale className="h-6 w-6 text-(--mirai-sem-accent)" />
              1. Chấp thuận Điều khoản
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Bằng việc truy cập vào website và sử dụng nền tảng tạo phụ kiện AI
              của MIRAI, bạn đồng ý tuân thủ các Điều khoản Sử dụng này. Nếu
              không đồng ý với bất kỳ phần nào của điều khoản, vui lòng ngừng sử
              dụng dịch vụ.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-3 font-heading text-2xl font-semibold text-foreground">
              <AlertCircle className="h-6 w-6 text-(--mirai-sem-accent)" />
              2. Nội dung Người dùng & Trí tuệ Nhân tạo (AI)
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Nền tảng của chúng tôi (Mirror + AI) cho phép bạn tải hình ảnh lên
              và tạo thiết kế mới bằng AI. Bạn phải đảm bảo rằng:
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>Bạn có bản quyền hợp pháp đối với những hình ảnh tải lên.</li>
              <li>
                Câu lệnh thiết kế (prompts) không chứa từ ngữ, nội dung vi phạm
                pháp luật, đồi truỵ, hoặc xúc phạm danh dự cá nhân/tổ chức.
              </li>
              <li>
                MIRAI có quyền từ chối in ấn và giao hàng nếu sản phẩm thiết kế
                vi phạm quy chuẩn đạo đức và pháp luật Việt Nam.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-3 font-heading text-2xl font-semibold text-foreground">
              <RefreshCw className="h-6 w-6 text-(--mirai-sem-accent)" />
              3. Đặt hàng, Thanh toán & Hoàn trả
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Các sản phẩm tại MIRAI là phụ kiện cá nhân hoá (in theo yêu cầu
              độc bản). Do đó:
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                Đơn hàng chỉ được xử lý sau khi bạn xác nhận thiết kế (Preview)
                và thanh toán thành công (hoặc xác nhận COD).
              </li>
              <li>
                Vì tính chất độc bản (custom-made), chúng tôi{" "}
                <strong className="text-foreground">
                  không chấp nhận đổi trả
                </strong>{" "}
                trừ trường hợp sản phẩm bị lỗi do nhà sản xuất (sai màu sắc
                nghiêm trọng so với bản preview, lỗi phôi ốp lưng, hỏng hóc do
                vận chuyển).
              </li>
              <li>
                Thời gian khiếu nại là 3 ngày kể từ lúc nhận hàng thành công.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-3 font-heading text-2xl font-semibold text-foreground">
              <FileText className="h-6 w-6 text-(--mirai-sem-accent)" />
              4. Quyền Sở hữu Trí tuệ
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Logo, thương hiệu, giao diện web, mã nguồn và thuật toán sinh ảnh
              của MIRAI (thuộc nhóm Hybrid Vibe) là tài sản trí tuệ được bảo hộ.
              Bạn không được sao chép, tái sử dụng một phần hoặc toàn bộ tài sản
              này nếu không có sự cho phép. Tuy nhiên, quyền sở hữu đối với
              thiết kế ốp lưng cụ thể mà AI tạo ra sẽ thuộc về bạn - người đã
              cung cấp prompt và ý tưởng.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
