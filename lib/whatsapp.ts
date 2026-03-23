import "server-only";

export async function sendWhatsappOtp(phone: string, code: string): Promise<void> {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;

  if (!instanceId || !token) {
    throw new Error("WhatsApp não configurado. Defina ZAPI_INSTANCE_ID e ZAPI_TOKEN.");
  }

  // Z-API expects digits only, with country code (e.g. 5511999999999)
  const digits = phone.replace(/\D/g, "");
  const phoneFormatted = digits.startsWith("55") ? digits : `55${digits}`;

  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(clientToken ? { "client-token": clientToken } : {}),
    },
    body: JSON.stringify({
      phone: phoneFormatted,
      message: `🧶 *Trama Pro*\n\nSeu código de recuperação de senha é:\n\n*${code}*\n\nVálido por 10 minutos.\nSe não foi você, ignore esta mensagem.`,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[WhatsApp] Z-API error:", errText);
    throw new Error("Falha ao enviar mensagem WhatsApp. Verifique o número e tente novamente.");
  }
}
