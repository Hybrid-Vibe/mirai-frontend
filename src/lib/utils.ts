import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Translates raw technical/system errors (from network, Supabase, database, or NextAuth)
 * into friendly, polite, and user-understandable Vietnamese messages.
 *
 * @param error - The raw error object or string
 * @param fallback - The default fallback message if the error cannot be specifically translated
 * @returns User-friendly error message in Vietnamese
 */
export function getFriendlyErrorMessage(
  error: unknown,
  fallback = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau! ⚙️",
): string {
  if (!error) return fallback;

  let msg = "";
  let status: number | undefined;

  // Extract message and status from various error structures
  if (typeof error === "string") {
    msg = error;
  } else if (error instanceof Error) {
    msg = error.message;
  }

  if (error && typeof error === "object") {
    // Axios or API Response structures
    const err = error as {
      response?: {
        status?: number;
        data?: {
          message?: string;
          error?: string;
          code?: string;
          msg?: string;
        };
      };
      message?: string;
      code?: string;
    };

    status = err.response?.status;
    msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.response?.data?.msg ||
      err.message ||
      msg;
  }

  const cleanMsg = (msg || "").toLowerCase().trim();

  // 1. Network and API-level Errors
  if (
    cleanMsg.includes("network error") ||
    cleanMsg.includes("failed to fetch")
  ) {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng của bạn! 🌐";
  }
  if (cleanMsg.includes("timeout") || cleanMsg.includes("exceeded")) {
    return "Thời gian kết nối quá hạn. Vui lòng thử lại sau! ⏱️";
  }

  // 2. Supabase & Database specific errors
  if (
    cleanMsg.includes("unique_violation") ||
    cleanMsg.includes("already exists") ||
    cleanMsg.includes("duplicate key")
  ) {
    if (cleanMsg.includes("email") || cleanMsg.includes("users")) {
      return "Địa chỉ email này đã được đăng ký. Vui lòng sử dụng email khác! ✉️";
    }
    return "Dữ liệu này đã tồn tại trong hệ thống! 📂";
  }
  if (
    cleanMsg.includes("violates foreign key") ||
    cleanMsg.includes("foreign_key_violation")
  ) {
    return "Không thể thực hiện tác vụ do ràng buộc dữ liệu liên quan! 🔗";
  }
  if (
    cleanMsg.includes("invalid input syntax") ||
    cleanMsg.includes("invalid input") ||
    cleanMsg.includes("violates check constraint")
  ) {
    return "Dữ liệu nhập vào không hợp lệ hoặc sai định dạng. Vui lòng kiểm tra lại! 📝";
  }

  // 3. NextAuth / Supabase Auth specific errors
  if (
    cleanMsg.includes("invalid login credentials") ||
    cleanMsg.includes("invalid credentials") ||
    cleanMsg.includes("username and password do not match")
  ) {
    return "Tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại! 🔑";
  }
  if (
    cleanMsg.includes("email not confirmed") ||
    cleanMsg.includes("email_not_confirmed")
  ) {
    return "Tài khoản của bạn chưa được xác nhận email. Vui lòng kiểm tra hộp thư! 📧";
  }
  if (
    cleanMsg.includes("user_already_exists") ||
    cleanMsg.includes("user already exists")
  ) {
    return "Tài khoản với email này đã tồn tại. Bạn có muốn đăng nhập không? 👤";
  }
  if (
    cleanMsg.includes("password is too short") ||
    cleanMsg.includes("signup-password") ||
    cleanMsg.includes("weak_password")
  ) {
    return "Mật khẩu quá ngắn. Vui lòng nhập mật khẩu tối thiểu 6 ký tự! 🔒";
  }
  if (
    cleanMsg.includes("rate limit") ||
    cleanMsg.includes("too many requests") ||
    status === 429
  ) {
    return "Bạn đang thực hiện thao tác quá nhanh. Vui lòng thử lại sau ít phút! ⏳";
  }
  if (
    cleanMsg.includes("user not found") ||
    cleanMsg.includes("user-not-found")
  ) {
    return "Không tìm thấy tài khoản người dùng tương ứng! 🔍";
  }
  if (
    cleanMsg.includes("invalid grant") ||
    cleanMsg.includes("refresh token has expired")
  ) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại! 🔄";
  }

  // 4. HTTP Status Code Mapping
  if (status === 400) {
    return "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào! ⚠️";
  }
  if (status === 401) {
    return "Bạn chưa đăng nhập hoặc không có quyền truy cập. Vui lòng đăng nhập lại! 🚫";
  }
  if (status === 403) {
    return "Bạn không có quyền thực hiện hành động này! 🔐";
  }
  if (status === 404) {
    return "Không tìm thấy tài nguyên hoặc trang yêu cầu! 🔍";
  }
  if (status === 500) {
    return "Máy chủ đang gặp sự cố hệ thống. Chúng tôi đang xử lý, vui lòng thử lại sau! ⚙️";
  }
  if (status === 503) {
    return "Dịch vụ hiện không khả dụng. Vui lòng thử lại sau! 🛠️";
  }

  // 5. Fallback to original Vietnamese message if it is already localized nicely
  // Otherwise, return fallback
  if (msg && /[\u00C0-\u1EF9]/g.test(msg)) {
    return msg;
  }

  return fallback;
}
