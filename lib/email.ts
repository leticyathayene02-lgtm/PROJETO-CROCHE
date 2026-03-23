import "server-only";
import { Resend } from "resend";

// ─────────────────────────────────────────
// Config
// ─────────────────────────────────────────

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured.");
  return new Resend(key);
}

const FROM = "Trama Pro <noreply@tramapro.com.br>";

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

// ─────────────────────────────────────────
// Layout base HTML (reutilizável)
// ─────────────────────────────────────────

function emailLayout(opts: {
  preheader?: string;
  title: string;
  body: string;
  cta?: { label: string; url: string };
  footer?: string;
}) {
  const year = new Date().getFullYear();
  const appUrl = getAppUrl();

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${opts.title}</title>
</head>
<body style="margin:0; padding:0; background:#fdf2f8; font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  ${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</div>` : ""}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f8;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#9f1239,#e11d48); padding:28px 32px; text-align:center;">
              <span style="font-size:32px;">🧶</span>
              <span style="font-size:22px; font-weight:bold; color:#ffffff; margin-left:8px; vertical-align:middle;">Trama Pro</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 16px;">
              <h1 style="font-size:22px; font-weight:700; color:#1f2937; margin:0 0 16px;">${opts.title}</h1>
              ${opts.body}
            </td>
          </tr>

          <!-- CTA Button -->
          ${opts.cta ? `
          <tr>
            <td style="padding:8px 32px 24px; text-align:center;">
              <a href="${opts.cta.url}" style="display:inline-block; background:#e11d48; color:#ffffff; font-weight:600; padding:14px 32px; border-radius:10px; text-decoration:none; font-size:15px;">
                ${opts.cta.label}
              </a>
            </td>
          </tr>` : ""}

          <!-- Footer note -->
          ${opts.footer ? `
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="font-size:13px; color:#9ca3af; margin:0; line-height:1.5;">${opts.footer}</p>
            </td>
          </tr>` : ""}

          <!-- Divider + Legal -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none; border-top:1px solid #f3e8ff; margin:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 24px; text-align:center;">
              <a href="${appUrl}" style="color:#e11d48; text-decoration:none; font-size:12px; font-weight:600;">tramapro.site</a>
              <p style="font-size:11px; color:#d1d5db; margin:8px 0 0;">
                © ${year} Trama Pro. Todos os direitos reservados.<br/>
                <a href="${appUrl}/privacidade" style="color:#d1d5db; text-decoration:underline;">Privacidade</a>
                &nbsp;·&nbsp;
                <a href="${appUrl}/termos" style="color:#d1d5db; text-decoration:underline;">Termos</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ─────────────────────────────────────────
// Helper para enviar
// ─────────────────────────────────────────

async function send(to: string, subject: string, html: string) {
  const { error } = await getResend().emails.send({ from: FROM, to, subject, html });
  if (error) {
    console.error(`[Email] Failed to send "${subject}" to ${to}:`, error);
    throw new Error(`Falha ao enviar e-mail: ${subject}`);
  }
  console.log(`[Email] Sent "${subject}" to ${to}`);
}

// ─────────────────────────────────────────
// 1. Boas-vindas (cadastro)
// ─────────────────────────────────────────

export async function sendWelcomeEmail(email: string, name?: string | null) {
  const firstName = name?.split(" ")[0] || "artesã";
  const appUrl = getAppUrl();

  const html = emailLayout({
    preheader: `Bem-vinda à Trama Pro, ${firstName}! Sua jornada de sucesso começa agora.`,
    title: `Bem-vinda, ${firstName}! 🎉`,
    body: `
      <p style="color:#4b5563; line-height:1.6; margin:0 0 16px;">
        Que alegria ter você com a gente! A <strong>Trama Pro</strong> foi feita especialmente
        para artesãs como você — que querem <strong>precificar com confiança</strong>,
        organizar seu ateliê e vender com lucro real.
      </p>
      <p style="color:#4b5563; line-height:1.6; margin:0 0 16px;">
        Seu período de teste gratuito de <strong>3 dias</strong> já está ativo. Aproveite para explorar:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
        <tr>
          <td style="padding:6px 0; color:#4b5563; font-size:14px;">✨ &nbsp;Calcule o preço justo dos seus produtos</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#4b5563; font-size:14px;">📦 &nbsp;Controle seu estoque de linhas e materiais</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#4b5563; font-size:14px;">💰 &nbsp;Acompanhe suas finanças com clareza</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#4b5563; font-size:14px;">📋 &nbsp;Gerencie pedidos e clientes</td>
        </tr>
      </table>
    `,
    cta: { label: "Acessar meu ateliê", url: `${appUrl}/app/overview` },
    footer: "Qualquer dúvida, é só responder este e-mail. Estamos aqui para ajudar!",
  });

  await send(email, "Bem-vinda à Trama Pro! 🧶", html);
}

// ─────────────────────────────────────────
// 2. Pagamento confirmado
// ─────────────────────────────────────────

export async function sendPaymentConfirmedEmail(
  email: string,
  name?: string | null,
  details?: { value?: number; periodEnd?: Date }
) {
  const firstName = name?.split(" ")[0] || "artesã";
  const appUrl = getAppUrl();

  const valueStr = details?.value
    ? `R$ ${details.value.toFixed(2).replace(".", ",")}`
    : "R$ 19,90";
  const periodEndStr = details?.periodEnd
    ? details.periodEnd.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  const html = emailLayout({
    preheader: `Pagamento confirmado! Seu plano Premium está ativo.`,
    title: "Pagamento confirmado! ✅",
    body: `
      <p style="color:#4b5563; line-height:1.6; margin:0 0 16px;">
        Oi, <strong>${firstName}</strong>! Recebemos seu pagamento com sucesso.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="background:#f0fdf4; border-radius:10px; padding:16px; width:100%; margin:0 0 16px;">
        <tr>
          <td style="padding:12px 16px;">
            <p style="margin:0 0 8px; font-size:14px; color:#166534;"><strong>Plano:</strong> Premium</p>
            <p style="margin:0 0 8px; font-size:14px; color:#166534;"><strong>Valor:</strong> ${valueStr}/mês</p>
            ${periodEndStr ? `<p style="margin:0; font-size:14px; color:#166534;"><strong>Próxima renovação:</strong> ${periodEndStr}</p>` : ""}
          </td>
        </tr>
      </table>
      <p style="color:#4b5563; line-height:1.6; margin:0 0 8px;">
        Agora você tem acesso completo a todas as ferramentas — cálculos ilimitados,
        controle financeiro completo e muito mais. 🚀
      </p>
    `,
    cta: { label: "Ir para o painel", url: `${appUrl}/app/overview` },
  });

  await send(email, "Pagamento confirmado — Trama Pro Premium ✅", html);
}

// ─────────────────────────────────────────
// 3. Assinatura expirando (lembrete)
// ─────────────────────────────────────────

export async function sendSubscriptionExpiringEmail(
  email: string,
  name?: string | null,
  daysLeft?: number
) {
  const firstName = name?.split(" ")[0] || "artesã";
  const appUrl = getAppUrl();
  const days = daysLeft ?? 3;

  const urgencyColor = days <= 1 ? "#dc2626" : "#d97706";
  const urgencyBg = days <= 1 ? "#fef2f2" : "#fffbeb";

  const html = emailLayout({
    preheader: `${firstName}, sua assinatura expira em ${days} dia${days !== 1 ? "s" : ""}. Renove para não perder acesso.`,
    title: `Sua assinatura expira em ${days} dia${days !== 1 ? "s" : ""} ⏰`,
    body: `
      <p style="color:#4b5563; line-height:1.6; margin:0 0 16px;">
        Oi, <strong>${firstName}</strong>! Passando para lembrar que seu plano
        <strong>Premium</strong> da Trama Pro está prestes a expirar.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="background:${urgencyBg}; border-radius:10px; width:100%; margin:0 0 16px;">
        <tr>
          <td style="padding:16px;">
            <p style="margin:0; font-size:15px; color:${urgencyColor}; font-weight:600; text-align:center;">
              ⚠️ Restam ${days} dia${days !== 1 ? "s" : ""} de acesso Premium
            </p>
          </td>
        </tr>
      </table>
      <p style="color:#4b5563; line-height:1.6; margin:0 0 16px;">
        Sem o plano Premium, você volta para o plano gratuito com limites de
        3 cálculos/mês, 5 transações e 3 produtos. Renove agora para continuar
        com acesso ilimitado!
      </p>
    `,
    cta: { label: "Renovar assinatura", url: `${appUrl}/app/settings/billing` },
    footer: "Se já realizou o pagamento, desconsidere este e-mail.",
  });

  await send(email, `Sua assinatura expira em ${days} dia${days !== 1 ? "s" : ""} — Trama Pro`, html);
}

// ─────────────────────────────────────────
// 4. Redefinição de senha (refatorado)
// ─────────────────────────────────────────

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const html = emailLayout({
    preheader: "Você solicitou a redefinição de senha da sua conta Trama Pro.",
    title: "Redefinição de senha 🔑",
    body: `
      <p style="color:#4b5563; line-height:1.6; margin:0 0 16px;">
        Recebemos uma solicitação para redefinir a senha da sua conta.
        Clique no botão abaixo para criar uma nova senha.
      </p>
      <p style="color:#4b5563; line-height:1.6; margin:0 0 16px;">
        O link é válido por <strong>1 hora</strong>.
      </p>
    `,
    cta: { label: "Redefinir minha senha", url: resetUrl },
    footer: "Se você não solicitou isso, ignore este e-mail. Sua senha não será alterada.",
  });

  await send(email, "Redefinição de senha — Trama Pro", html);
}
