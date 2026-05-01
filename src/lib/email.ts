// ----------------------------------------------------------------------
// Resend Email Integration
// Docs: https://resend.com/docs
// ----------------------------------------------------------------------

import { Resend } from "resend";
import type { EmailTemplateType, SendEmailResult } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "MIRAI <noreply@mirai.vn>";

// ----------------------------------------------------------------------
// Email Templates (HTML)
// Each template receives dynamic data and returns an HTML string.
// In production, you'd likely use React Email or a templating engine.
// ----------------------------------------------------------------------

function getEmailSubject(template: EmailTemplateType, data: Record<string, unknown>): string {
  const subjects: Record<EmailTemplateType, string> = {
    order_confirmation: `MIRAI — Xác nhận đơn hàng #${data.orderNumber ?? ""}`,
    order_shipped: `MIRAI — Đơn hàng #${data.orderNumber ?? ""} đã được giao cho đơn vị vận chuyển`,
    order_delivered: `MIRAI — Đơn hàng #${data.orderNumber ?? ""} đã giao thành công`,
    order_cancelled: `MIRAI — Đơn hàng #${data.orderNumber ?? ""} đã bị hủy`,
    welcome: "Chào mừng bạn đến với MIRAI! 🎨",
    password_reset: "MIRAI — Đặt lại mật khẩu",
  };
  return subjects[template];
}

function renderTemplate(template: EmailTemplateType, data: Record<string, unknown>): string {
  const baseStyle = `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 32px 24px;
    background: #fafafa;
    color: #1a1a1a;
  `;
  const headerStyle = `
    text-align: center;
    padding-bottom: 24px;
    border-bottom: 2px solid #5ce1e6;
    margin-bottom: 24px;
  `;
  const brandStyle = `
    font-size: 28px;
    font-weight: 800;
    color: #5ce1e6;
    letter-spacing: 2px;
  `;
  const buttonStyle = `
    display: inline-block;
    background: #5ce1e6;
    color: #000;
    padding: 12px 32px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    margin-top: 16px;
  `;

  switch (template) {
    case "welcome":
      return `
        <div style="${baseStyle}">
          <div style="${headerStyle}"><span style="${brandStyle}">MIRAI</span></div>
          <h2>Chào mừng ${data.fullName ?? "bạn"}! 🎉</h2>
          <p>Cảm ơn bạn đã tham gia MIRAI — nền tảng thiết kế ốp lưng điện thoại bằng AI.</p>
          <p>Bắt đầu tạo thiết kế đầu tiên của bạn ngay:</p>
          <a href="${data.appUrl ?? "https://mirai.vn"}/customize" style="${buttonStyle}">Bắt đầu thiết kế</a>
          <p style="margin-top: 32px; font-size: 13px; color: #888;">Nếu bạn không tạo tài khoản này, hãy bỏ qua email này.</p>
        </div>
      `;

    case "order_confirmation":
      return `
        <div style="${baseStyle}">
          <div style="${headerStyle}"><span style="${brandStyle}">MIRAI</span></div>
          <h2>Đơn hàng #${data.orderNumber} đã được xác nhận! ✅</h2>
          <p>Cảm ơn ${data.customerName ?? "bạn"} đã đặt hàng tại MIRAI.</p>
          <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; font-weight: 600;">Mã đơn hàng</td>
              <td style="padding: 8px 0; text-align: right;">${data.orderNumber}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; font-weight: 600;">Tổng tiền</td>
              <td style="padding: 8px 0; text-align: right;">${data.totalAmount}đ</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600;">Phương thức thanh toán</td>
              <td style="padding: 8px 0; text-align: right;">${data.paymentMethod ?? "COD"}</td>
            </tr>
          </table>
          <a href="${data.appUrl ?? "https://mirai.vn"}/account/orders" style="${buttonStyle}">Xem đơn hàng</a>
        </div>
      `;

    case "order_shipped":
      return `
        <div style="${baseStyle}">
          <div style="${headerStyle}"><span style="${brandStyle}">MIRAI</span></div>
          <h2>Đơn hàng #${data.orderNumber} đang trên đường đến bạn! 🚚</h2>
          <p>Đơn hàng của bạn đã được giao cho đơn vị vận chuyển <strong>${data.carrier ?? "GHN"}</strong>.</p>
          <p><strong>Mã vận đơn:</strong> ${data.trackingCode ?? "Đang cập nhật"}</p>
          <a href="${data.trackingUrl ?? "#"}" style="${buttonStyle}">Theo dõi đơn hàng</a>
        </div>
      `;

    case "order_delivered":
      return `
        <div style="${baseStyle}">
          <div style="${headerStyle}"><span style="${brandStyle}">MIRAI</span></div>
          <h2>Đơn hàng #${data.orderNumber} đã giao thành công! 🎉</h2>
          <p>Chúng tôi hy vọng bạn hài lòng với sản phẩm. Hãy để lại đánh giá nhé!</p>
          <a href="${data.appUrl ?? "https://mirai.vn"}/account/orders" style="${buttonStyle}">Đánh giá sản phẩm</a>
        </div>
      `;

    case "order_cancelled":
      return `
        <div style="${baseStyle}">
          <div style="${headerStyle}"><span style="${brandStyle}">MIRAI</span></div>
          <h2>Đơn hàng #${data.orderNumber} đã bị hủy</h2>
          <p>Đơn hàng của bạn đã được hủy. ${data.reason ? `Lý do: ${data.reason}` : ""}</p>
          <p>Nếu bạn đã thanh toán, số tiền sẽ được hoàn lại trong 3-5 ngày làm việc.</p>
          <a href="${data.appUrl ?? "https://mirai.vn"}/contact" style="${buttonStyle}">Liên hệ hỗ trợ</a>
        </div>
      `;

    case "password_reset":
      return `
        <div style="${baseStyle}">
          <div style="${headerStyle}"><span style="${brandStyle}">MIRAI</span></div>
          <h2>Đặt lại mật khẩu</h2>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Nhấn nút bên dưới để đặt mật khẩu mới. Link này có hiệu lực trong 1 giờ.</p>
          <a href="${data.resetUrl ?? "#"}" style="${buttonStyle}">Đặt lại mật khẩu</a>
          <p style="margin-top: 32px; font-size: 13px; color: #888;">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
        </div>
      `;

    default:
      return `<p>Template not found.</p>`;
  }
}

// ----------------------------------------------------------------------
// Public API
// ----------------------------------------------------------------------

/**
 * Send a transactional email using Resend.
 */
export async function sendEmail(
  to: string,
  template: EmailTemplateType,
  data: Record<string, unknown>
): Promise<SendEmailResult> {
  try {
    const subject = getEmailSubject(template, data);
    const html = renderTemplate(template, data);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (result.error) {
      return {
        success: false,
        messageId: null,
        error: result.error.message,
      };
    }

    return {
      success: true,
      messageId: result.data?.id ?? null,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      messageId: null,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

/**
 * Send a welcome email to a newly registered user.
 */
export async function sendWelcomeEmail(
  to: string,
  fullName: string
): Promise<SendEmailResult> {
  return sendEmail(to, "welcome", {
    fullName,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  });
}

/**
 * Send an order confirmation email.
 */
export async function sendOrderConfirmationEmail(
  to: string,
  data: {
    orderNumber: string;
    customerName: string;
    totalAmount: string;
    paymentMethod: string;
  }
): Promise<SendEmailResult> {
  return sendEmail(to, "order_confirmation", {
    ...data,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  });
}

/**
 * Send a password reset email.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<SendEmailResult> {
  return sendEmail(to, "password_reset", { resetUrl });
}
