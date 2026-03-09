import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
};

@Injectable()
export class AuthMailerService {
  private readonly logger = new Logger(AuthMailerService.name);
  private readonly resendApiKey: string;
  private readonly resendFromEmail: string;

  constructor(@Inject(ConfigService) private configService: ConfigService) {
    this.resendApiKey = this.configService.getOrThrow<string>("RESEND_API_KEY");
    this.resendFromEmail = this.configService.getOrThrow<string>("RESEND_FROM_EMAIL");
  }

  async sendVerificationOtp(args: {
    to: string;
    name: string;
    otp: string;
    expiresInMinutes: number;
    idempotencyKey: string;
  }) {
    const subject = "Verify your Advanced Quiz account";
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <p>Hi ${escapeHtml(args.name)},</p>
        <p>Your verification code is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px">${args.otp}</p>
        <p>This code expires in ${args.expiresInMinutes} minutes.</p>
        <p>If you did not create this account, you can ignore this email.</p>
      </div>
    `;
    const text = [
      `Hi ${args.name},`,
      "",
      `Your verification code is: ${args.otp}`,
      `This code expires in ${args.expiresInMinutes} minutes.`,
      "",
      "If you did not create this account, you can ignore this email.",
    ].join("\n");

    await this.sendEmail({
      to: args.to,
      subject,
      html,
      text,
      idempotencyKey: args.idempotencyKey,
    });
  }

  async sendPasswordResetEmail(args: {
    to: string;
    name: string;
    resetUrl: string;
    expiresInMinutes: number;
    idempotencyKey: string;
  }) {
    const subject = "Reset your Advanced Quiz password";
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <p>Hi ${escapeHtml(args.name)},</p>
        <p>We received a request to reset your password.</p>
        <p>
          <a
            href="${escapeAttribute(args.resetUrl)}"
            style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600"
          >
            Reset password
          </a>
        </p>
        <p>This link expires in ${args.expiresInMinutes} minutes.</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
      </div>
    `;
    const text = [
      `Hi ${args.name},`,
      "",
      "We received a request to reset your password.",
      `Reset your password: ${args.resetUrl}`,
      `This link expires in ${args.expiresInMinutes} minutes.`,
      "",
      "If you did not request a password reset, you can ignore this email.",
    ].join("\n");

    await this.sendEmail({
      to: args.to,
      subject,
      html,
      text,
      idempotencyKey: args.idempotencyKey,
    });
  }

  private async sendEmail(args: SendEmailArgs) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.resendApiKey}`,
        "Content-Type": "application/json",
        ...(args.idempotencyKey
          ? { "Idempotency-Key": args.idempotencyKey }
          : {}),
      },
      body: JSON.stringify({
        from: this.resendFromEmail,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text,
      }),
    });

    if (response.ok) {
      return;
    }

    const responseText = await response.text();
    this.logger.error(
      `Resend email request failed with ${response.status}: ${responseText}`,
    );
    throw new Error("Unable to send email");
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value);
}
