"use client";

import { useState } from "react";
import { FileText, MessageCircle, Check } from "lucide-react";

const paymentStatusLabels: Record<string, string> = {
  UNPAID: "Não pago",
  HALF_PAID: "50% pago",
  PAID: "Pago",
};

type OrderData = {
  id: string;
  customerName: string;
  itemDescription: string;
  amount: number;
  dueDate: string;
  orderDate: string;
  paymentStatus: string;
  notes?: string;
};

function formatCurrency(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function ReceiptActions({ order }: { order: OrderData }) {
  const [copied, setCopied] = useState(false);

  function buildWhatsAppText() {
    const status = paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus;
    return [
      `Olá, ${order.customerName}! 🧶`,
      ``,
      `Segue o resumo da sua encomenda:`,
      `📦 Peça: ${order.itemDescription}`,
      `💰 Valor: ${formatCurrency(order.amount)}`,
      `✅ Pagamento: ${status}`,
      `📅 Data prevista de entrega: ${formatDate(order.dueDate)}`,
      order.notes ? `📝 Observações: ${order.notes}` : null,
      ``,
      `Qualquer dúvida, estou à disposição! 🌸`,
    ]
      .filter((l) => l !== null)
      .join("\n");
  }

  async function handleCopyWhatsApp() {
    try {
      await navigator.clipboard.writeText(buildWhatsAppText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: prompt with text
      prompt("Copie o texto abaixo:", buildWhatsAppText());
    }
  }

  function handlePrintPdf() {
    const status = paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus;
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Recibo – ${order.customerName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1a1a1a; padding: 40px; max-width: 680px; margin: 0 auto; }
    .header { border-bottom: 2px solid #e11d48; padding-bottom: 16px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
    .logo { font-size: 28px; }
    .brand { font-size: 20px; font-weight: 700; color: #e11d48; }
    .brand-sub { font-size: 12px; color: #6b7280; }
    h2 { font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .label { color: #6b7280; font-size: 13px; }
    .value { font-size: 13px; font-weight: 500; }
    .total-row { display: flex; justify-content: space-between; padding: 12px 0; margin-top: 8px; }
    .total-label { font-size: 16px; font-weight: 700; }
    .total-value { font-size: 18px; font-weight: 700; color: #e11d48; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
    .badge-unpaid { background: #fee2e2; color: #b91c1c; }
    .badge-half { background: #fef3c7; color: #b45309; }
    .badge-paid { background: #d1fae5; color: #065f46; }
    .notes { margin-top: 20px; padding: 12px; background: #f9fafb; border-radius: 8px; font-size: 13px; color: #4b5563; }
    .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🧶</div>
    <div>
      <div class="brand">Trama Pro</div>
      <div class="brand-sub">Orçamento / Recibo de Encomenda</div>
    </div>
  </div>
  <h2>Dados do Pedido</h2>
  <div class="row"><span class="label">Cliente</span><span class="value">${order.customerName}</span></div>
  <div class="row"><span class="label">Peça/Produto</span><span class="value">${order.itemDescription}</span></div>
  <div class="row"><span class="label">Data do Pedido</span><span class="value">${formatDate(order.orderDate)}</span></div>
  <div class="row"><span class="label">Entrega Prevista</span><span class="value">${formatDate(order.dueDate)}</span></div>
  <div class="row">
    <span class="label">Status de Pagamento</span>
    <span class="value">
      <span class="badge ${order.paymentStatus === "PAID" ? "badge-paid" : order.paymentStatus === "HALF_PAID" ? "badge-half" : "badge-unpaid"}">${status}</span>
    </span>
  </div>
  <div class="total-row">
    <span class="total-label">Valor Total</span>
    <span class="total-value">${formatCurrency(order.amount)}</span>
  </div>
  ${order.notes ? `<div class="notes"><strong>Observações:</strong> ${order.notes}</div>` : ""}
  <div class="footer">Gerado por Trama Pro · tramapro.com.br · #${order.id.slice(-6).toUpperCase()}</div>
</body>
</html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 300);
  }

  return (
    <div className="flex flex-wrap gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-white/3">
      <button
        onClick={handlePrintPdf}
        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-800/50 dark:bg-rose-950/30 dark:text-rose-400"
      >
        <FileText className="h-4 w-4" />
        Gerar PDF / Recibo
      </button>

      <button
        onClick={handleCopyWhatsApp}
        className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100 dark:border-green-800/50 dark:bg-green-950/30 dark:text-green-400"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copiado!
          </>
        ) : (
          <>
            <MessageCircle className="h-4 w-4" />
            Copiar mensagem WhatsApp
          </>
        )}
      </button>
    </div>
  );
}
