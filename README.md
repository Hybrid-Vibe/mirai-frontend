# MIRAI Frontend (Next.js Application)

Repository Frontend chính thức của hệ sinh thái **MIRAI** — Nền tảng thương mại điện tử mua sắm và tùy biến ốp lưng điện thoại thế hệ mới ứng dụng công nghệ AI.

> [!NOTE]
>
> - Đây là dự án phục vụ môn học **EXE201 (Experiential Entrepreneurship)** tại trường **FPT University**.
> - **Trạng thái:** Dự án **chưa hoàn thiện hoàn toàn**.
> - **Bản Demo Web tạm thời:** [miraicase.vercel.app](https://miraicase.vercel.app)
> - **Repository Backend:** [github.com/Hybrid-Vibe/mirai-backend](https://github.com/Hybrid-Vibe/mirai-backend)

Hiện tại, dự án đã hoàn thành giai đoạn Mockup và đã **tích hợp phần lớn logic nghiệp vụ (Business Logic)** kết nối trực tiếp với hệ thống **Backend ASP.NET Core** thông qua API Client chuẩn hóa RESTful.

---

## Tính năng & Phân hệ Hiện tại

### 1. Trình thiết kế Ốp lưng tùy biến (Customize Engine)

- Tùy chỉnh trực quan ốp lưng cho nhiều dòng điện thoại thông dụng.
- Công nghệ vẽ trên canvas/3D, hỗ trợ chèn text, upload hình ảnh cá nhân.
- **Tích hợp Generative AI:** Kết nối với mô hình AI vẽ ảnh để tạo các thiết kế độc bản theo mô tả của người dùng và lưu trữ tức thì.

### 2. Luồng Mua sắm & Giỏ hàng Dynamic (Shop Flow)

- **Shop & Tìm kiếm thông minh:** Bộ lọc động (filter) đa dạng theo thương hiệu, danh mục, khoảng giá, và sắp xếp sản phẩm.
- **Giỏ hàng real-time:** Lưu trữ và quản lý đồng bộ trạng thái giữa Local State (Zustand) và cơ sở dữ liệu Backend qua `CartItemController` (đồng bộ UUID giỏ hàng, cập nhật số lượng, xóa sản phẩm).
- **Quy trình Thanh toán:** Checkout đồng bộ thông tin giao hàng, tự động tính tổng tiền và chuyển tiếp qua cổng thanh toán VNPay / COD.

### 3. Quản lý Tài khoản & Hồ sơ khách hàng (Customer Account)

- **Supabase Auth Sync:** Quản lý đăng nhập, đăng ký đồng bộ liền mạch tài khoản Supabase với tài khoản người dùng của cơ sở dữ liệu .NET.
- **Hồ sơ cá nhân:** Cập nhật thông tin tài khoản, thay đổi mật khẩu an toàn và quản lý danh sách sổ địa chỉ nhận hàng (`AddressController`).
- **Lịch sử đơn hàng:** Tra cứu trực tiếp danh sách đơn hàng đã đặt kèm trạng thái thanh toán và vận chuyển thông qua endpoint tối ưu dành riêng cho khách hàng `/Order/Orders-History-By-User/{userId}`.

### 4. Phân hệ Quản trị Admin Dashboard

- **Thống kê doanh thu:** Biểu đồ doanh thu động trực quan lấy số liệu thực tế qua `/Admin/dashboard/summary` và `/Admin/dashboard/revenue-chart`.
- **Quản lý Đơn hàng:** Danh sách đơn hàng toàn hệ thống kèm tính năng cập nhật trạng thái đơn hàng (`OrderStatus`) và trạng thái thanh toán (`PaymentStatus`) trực tiếp.
- **Quản lý danh mục & thực thể:** Điều phối danh sách người dùng, phê duyệt đánh giá (`Reviews`), và cấu hình vận chuyển (`Shippings`).

---

## Tech Stack & Thư viện sử dụng

- **Core Framework:** Next.js 16 (App Router) & React 19.
- **Ngôn ngữ:** TypeScript (Type-safe tuyệt đối).
- **State Management:** Zustand (đồng bộ hóa dữ liệu giỏ hàng và thiết kế của user).
- **Styling & UI:** Tailwind CSS v4, Lucide Icons, Framer Motion, Shadcn UI Components.
- **API Client:** Axios (quản lý Bearer Token trong local storage, tự động đính kèm Header Auth, tự động định dạng chuẩn hóa cấu trúc dữ liệu qua `normalizeArray`).
- **Security & Quality:** Husky, Eslint, Prettier, Gitleaks.

---

## Chạy dự án ở Local

### Yêu cầu hệ thống:

- **Node.js** phiên bản 20+
- **Backend ASP.NET Core** đang chạy song song (mặc định tại cổng `http://localhost:5236`)

### Các bước cài đặt:

1. **Cài đặt thư viện:**

   ```bash
   npm install
   ```

2. **Cấu hình môi trường (`.env` hoặc `.env.local`):**

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5236
   AI_IMAGE_PROVIDER=replicate
   REPLICATE_IMAGE_MODELS=google/imagen-4,black-forest-labs/flux-1.1-pro,ideogram-ai/ideogram-v3-turbo,black-forest-labs/flux-dev
   REPLICATE_IMAGE_MODEL=google/imagen-4
   REPLICATE_API_TOKEN=r8_...
   ```

   Với chức năng **AI Generate**, app sẽ ưu tiên Replicate `google/imagen-4`
   khi có `REPLICATE_API_TOKEN`; nếu model đầu tiên bị quota/rate limit hoặc
   tạm không khả dụng, server sẽ tự thử model tiếp theo trong
   `REPLICATE_IMAGE_MODELS`. Nếu muốn quay lại provider Gemini cũ, đặt
   `AI_IMAGE_PROVIDER=gemini` và cấu hình `GEMINI_API_KEY`.

3. **Chạy ở chế độ phát triển (Development):**

   ```bash
   npm run dev
   ```

4. **Kiểm tra chất lượng mã nguồn trước khi commit (Pre-push check):**
   ```bash
   npm run type-check   # Kiểm tra lỗi biên dịch TypeScript
   npm run lint         # Kiểm tra lỗi chuẩn định dạng code (ESLint)
   npm run build        # Build thử bản Production để đảm bảo không lỗi biên dịch
   ```

---

## Tài khoản thử nghiệm (Test Accounts)

Dưới đây là thông tin tài khoản dùng thử để kiểm thử các chức năng trên trang demo hoặc local:

### 1. Tài khoản đăng nhập hệ thống

- **Tài khoản Admin:**
  - **Email:** `hihi@gmail.com`
  - **Mật khẩu (Password):** `hihi`
- **Tài khoản Khách hàng (Customer):**
  - **Email:** `hehe@gmail.com`
  - **Mật khẩu (Password):** `hehe`

### 2. Tài khoản thử nghiệm thanh toán cổng VNPAY (Thanh toán Success)

Sử dụng thông tin thẻ test của VNPAY dưới đây để thực hiện thanh toán giả định thành công:

- **Ngân hàng:** NCB
- **Số thẻ (Card Number):** `9704198526191432198`
- **Tên chủ thẻ (Card Holder):** NGUYEN VAN A
- **Ngày phát hành (Issue Date):** `07/15`
- **Mật khẩu OTP:** `123456`

---

## Trạng thái & Tiến độ Dự án

- [x] **Xây dựng layout & cấu trúc router chính theo thiết kế Figma**
- [x] **Tích hợp API Client kết nối Backend ASP.NET Core**
- [x] **Đồng bộ hóa hệ thống Giỏ hàng (Cart) và Địa chỉ nhận hàng**
- [x] **Tích hợp API lịch sử đơn hàng tối ưu cho Khách hàng (`Orders-History-By-User`)**
- [x] **Tích hợp Phân hệ Quản trị Admin (Summary Dashboard, Live Order Management)**
- [x] **Thiết lập quy trình kiểm tra chất lượng tự động pre-push (Typecheck, Lint, Security Scan)**
- [x] **Tích hợp hoàn thiện cổng thanh toán Online (VNPAY IPN webhook)**
- [x] **Triển khai ứng dụng lên Production (Đã có bản demo web tạm thời trên Vercel tại [miraicase.vercel.app](https://miraicase.vercel.app))**
