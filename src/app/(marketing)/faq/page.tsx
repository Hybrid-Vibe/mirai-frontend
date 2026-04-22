import { HelpCircle, ChevronDown } from "lucide-react";

export const metadata = {
  title: "FAQs | MIRAI",
  description: "Các câu hỏi thường gặp về dịch vụ cá nhân hoá của MIRAI.",
};

const faqs = [
  {
    question: "Nền tảng MIRAI hoạt động như thế nào?",
    answer:
      "Bạn bắt đầu bằng việc chọn dòng điện thoại của mình. Tiếp theo, trong giao diện Customize, bạn có thể nhập các yêu cầu (prompt) bằng văn bản hoặc tải ảnh cá nhân lên. Trí tuệ nhân tạo (AI) của chúng tôi sẽ xử lý và tạo ra một bản xem trước (preview) thiết kế độc quyền. Nếu ưng ý, bạn có thể đặt hàng và chúng tôi sẽ in nó lên ốp lưng thực tế.",
  },
  {
    question: "Thời gian nhận hàng là bao lâu?",
    answer:
      "Vì là sản phẩm in ấn cá nhân hoá độc bản, thời gian gia công thường mất từ 1-2 ngày làm việc. Sau đó, tuỳ vào khu vực của bạn, đơn vị vận chuyển sẽ giao hàng trong vòng 2-4 ngày. Tổng cộng bạn sẽ nhận được ốp lưng trong khoảng 3-6 ngày kể từ lúc chốt thiết kế.",
  },
  {
    question: "AI của MIRAI có thể vẽ được mọi thứ tôi yêu cầu không?",
    answer:
      "AI của chúng tôi được huấn luyện để hiểu và tạo ra các phong cách nghệ thuật đa dạng (từ anime, chân dung, phong cảnh đến cyberpunk). Tuy nhiên, AI sẽ từ chối tạo các hình ảnh có nội dung bạo lực, nhạy cảm hoặc vi phạm tiêu chuẩn cộng đồng.",
  },
  {
    question: "Tôi có thể yêu cầu hoàn trả nếu không thích sản phẩm không?",
    answer:
      "Do đặc thù của sản phẩm in theo yêu cầu cá nhân (custom-made), MIRAI không hỗ trợ đổi/trả hàng trừ trường hợp sản phẩm bị lỗi do khâu sản xuất (sai màu sắc nghiêm trọng so với hệ màu in, in lệch) hoặc bị vỡ, hỏng do quá trình vận chuyển. Bạn vui lòng báo lỗi trong vòng 3 ngày kể từ khi nhận hàng.",
  },
  {
    question: "Tôi tải ảnh cá nhân lên để làm ốp lưng thì có bị lộ không?",
    answer:
      "Chắc chắn không. Hình ảnh cá nhân và thiết kế của bạn chỉ được lưu trữ tạm thời trên hệ thống bảo mật để phục vụ quá trình in ấn đơn hàng của chính bạn. Chúng tôi cam kết tuyệt đối không sử dụng thiết kế của bạn cho các mục đích thương mại khác. Bạn có thể xem thêm tại trang Chính sách Bảo mật.",
  },
];

export default function FAQPage() {
  return (
    <main className="bg-background pb-24 pt-12">
      <div className="page-shell max-w-3xl">
        <header className="mb-16 text-center">
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-(--mirai-sem-primary)/10 text-(--mirai-sem-primary)">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-4xl font-bold md:text-5xl">Câu hỏi thường gặp</h1>
          <p className="mt-4 text-muted-foreground">
            Giải đáp mọi thắc mắc của bạn về trải nghiệm "Mirror + AI".
          </p>
        </header>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-[12px] border border-(--mirai-color-line) bg-card p-6 transition-all hover:border-(--mirai-sem-primary)/50"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-lg font-semibold text-foreground outline-none [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="mt-4 leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-top-2 duration-300">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">Bạn vẫn còn thắc mắc khác?</p>
          <a
            href="mailto:support@mirai.vn"
            className="mt-4 inline-flex h-12 items-center justify-center rounded-[4px] bg-(--mirai-sem-text) px-8 text-sm font-semibold text-(--mirai-sem-background) transition-all hover:bg-(--mirai-sem-primary) hover:text-[#0F0F0F] active:scale-95"
          >
            Liên hệ với chúng tôi
          </a>
        </div>
      </div>
    </main>
  );
}
