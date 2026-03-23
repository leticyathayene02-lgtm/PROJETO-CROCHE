"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LifeBuoy, Mail, Send, Clock, CheckCircle2 } from "lucide-react";

const SUPPORT_EMAIL = "suporte.tramapro@gmail.com";

const CATEGORIES = [
  { value: "duvida", label: "Tenho uma dúvida" },
  { value: "bug", label: "Encontrei um problema" },
  { value: "sugestao", label: "Quero sugerir algo" },
  { value: "pagamento", label: "Problema com pagamento" },
  { value: "conta", label: "Problema com minha conta" },
  { value: "outro", label: "Outro assunto" },
];

export default function SuportePage() {
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend() {
    const prefix = category
      ? `[${CATEGORIES.find((c) => c.value === category)?.label}] `
      : "";
    const fullSubject = encodeURIComponent(`${prefix}${subject}`);
    const fullBody = encodeURIComponent(message);

    window.open(
      `mailto:${SUPPORT_EMAIL}?subject=${fullSubject}&body=${fullBody}`,
      "_blank"
    );
    setSent(true);
  }

  const canSend = subject.trim().length > 0 && message.trim().length > 0;

  if (sent) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              E-mail pronto para enviar!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Seu aplicativo de e-mail foi aberto com a mensagem preenchida.
              Basta clicar em <strong>Enviar</strong> no seu e-mail.
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-white/5 px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
              <Clock className="h-4 w-4 text-gray-400" />
              Respondemos em até 24 horas úteis
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSent(false);
                setSubject("");
                setMessage("");
                setCategory("");
              }}
              className="mt-2"
            >
              Enviar outra mensagem
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <LifeBuoy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          Suporte
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Precisa de ajuda? Envie uma mensagem e respondemos o mais rápido possível.
        </p>
      </div>

      {/* Contact info card */}
      <Card className="border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
            <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {SUPPORT_EMAIL}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Respondemos em até 24h úteis
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enviar mensagem</CardTitle>
          <CardDescription>
            Preencha os campos abaixo e abriremos seu e-mail com tudo pronto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione o assunto..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto *</Label>
            <Input
              id="subject"
              placeholder="Resumo da sua mensagem"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem *</Label>
            <Textarea
              id="message"
              placeholder="Descreva sua dúvida, problema ou sugestão com o máximo de detalhes possível..."
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSend}
            disabled={!canSend}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Send className="mr-2 h-4 w-4" />
            Abrir e-mail e enviar
          </Button>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Ao clicar, seu aplicativo de e-mail abrirá com a mensagem preenchida.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
