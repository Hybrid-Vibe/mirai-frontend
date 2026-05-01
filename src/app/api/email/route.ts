// POST /api/email — Send transactional emails via Resend
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import type { EmailTemplateType } from "@/types";

const VALID_TEMPLATES: EmailTemplateType[] = [
  "order_confirmation",
  "order_shipped",
  "order_delivered",
  "order_cancelled",
  "welcome",
  "password_reset",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, template, data } = body;

    if (!to || !template) {
      return NextResponse.json(
        { error: "to and template are required" },
        { status: 400 }
      );
    }

    if (!VALID_TEMPLATES.includes(template)) {
      return NextResponse.json(
        { error: `Invalid template. Use: ${VALID_TEMPLATES.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await sendEmail(to, template, data ?? {});

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("[API] Email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
