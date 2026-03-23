import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Trama Pro <noreply@tramapro.com.br>";

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Redefinição de senha — Trama Pro",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 28px;">🧶</span>
          <span style="font-size: 18px; font-weight: bold; color: #9f1239; margin-left: 8px;">Trama Pro</span>
        </div>
        <h1 style="font-size: 22px; font-weight: bold; margin-bottom: 8px;">Redefinição de senha</h1>
        <p style="color: #555; margin-bottom: 24px;">
          Recebemos uma solicitação para redefinir a senha da sua conta.
          Clique no botão abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong>.
        </p>
        <a
          href="${resetUrl}"
          style="display: inline-block; background: #e11d48; color: #fff; font-weight: bold; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-size: 15px;"
        >
          Redefinir minha senha
        </a>
        <p style="margin-top: 24px; font-size: 13px; color: #888;">
          Se você não solicitou isso, ignore este e-mail. Sua senha não será alterada.
        </p>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #aaa;">© ${new Date().getFullYear()} Trama Pro. Todos os direitos reservados.</p>
      </div>
    `,
  });

  if (error) {
    console.error("[Email] Failed to send password reset email:", error);
    throw new Error("Falha ao enviar e-mail de recuperação.");
  }
}
