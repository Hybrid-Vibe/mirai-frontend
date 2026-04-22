# MIRAI Frontend (Phase 1: UI Mockup)

Đây là repo frontend chính thức cho website MIRAI.
Hiện tại dự án đang ở giai đoạn đầu tiên: UI Mockup theo thiết kế Figma.

## Lưu ý quan trọng

- Đây là frontend thật của website MIRAI, nhưng chưa đến giai đoạn production-ready.
- Hiện tại dự án tập trung vào UI/UX, bố cục, màu sắc, typography và component layout.
- Chưa hoàn tất business logic, backend, auth thật, thanh toán thật, xử lý đơn hàng thật.

## Mục tiêu hiện tại

- Tái hiện giao diện theo Figma (pixel-oriented).
- Hoàn thiện luồng màn hình chính ở mức giao diện:
  - Home
  - Customize
  - Shop
  - Cart
  - Checkout
  - Wishlist
  - Login / Signup
  - Account

## Tech stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Zustand

## Chạy dự án local

Yêu cầu:

- Node.js 20+ (khuyến nghị)
- npm

Lệnh chạy:

```bash
npm install
npm run dev
```

Mở trình duyệt tại:

```text
http://localhost:3000
```

## Trạng thái dự án

- [x] Có bộ khung giao diện theo design
- [x] Có route cho các màn hình chính
- [ ] Chưa kết nối backend production
- [ ] Chưa có quy trình thanh toán thật
- [ ] Chưa là phiên bản sẵn sàng phát hành

## Ghi chú

Mục tiêu hiện tại là hoàn thiện giao diện và luồng trang theo Figma, sau đó mới tiếp tục backend/business logic ở các phase tiếp theo.
