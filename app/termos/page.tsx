import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Trama Pro",
  description: "Termos de uso da plataforma Trama Pro",
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400"
        >
          ← Voltar ao início
        </Link>

        <h1 className="font-heading text-3xl font-bold text-rose-900 dark:text-rose-100 sm:text-4xl">
          Termos de Uso
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Última atualização: 23 de março de 2026
        </p>

        <div className="prose prose-gray mt-10 max-w-none dark:prose-invert prose-headings:font-heading prose-headings:text-rose-900 dark:prose-headings:text-rose-200 prose-a:text-rose-600 dark:prose-a:text-rose-400">
          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao acessar ou utilizar a plataforma <strong>Trama Pro</strong> (&ldquo;Plataforma&rdquo;), você concorda
            em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte
            destes termos, não utilize a Plataforma.
          </p>

          <h2>2. Descrição do Serviço</h2>
          <p>
            A Trama Pro é uma plataforma de gestão voltada para artesãs e empreendedoras do segmento de
            crochê e artesanato. Oferecemos ferramentas de:
          </p>
          <ul>
            <li>Precificação de produtos artesanais</li>
            <li>Controle de estoque de materiais</li>
            <li>Gestão financeira (receitas e despesas)</li>
            <li>Cadastro de produtos e clientes</li>
            <li>Gestão de pedidos</li>
          </ul>

          <h2>3. Cadastro e Conta</h2>
          <p>
            Para utilizar a Plataforma, você deve criar uma conta fornecendo informações verdadeiras e
            atualizadas. Você é responsável por manter a confidencialidade de sua senha e por todas as
            atividades realizadas em sua conta.
          </p>

          <h2>4. Planos e Pagamentos</h2>
          <p>
            A Trama Pro oferece um plano gratuito com funcionalidades limitadas e planos pagos com
            recursos adicionais. Os pagamentos são processados de forma segura através de provedores
            terceiros (Stripe). Ao assinar um plano pago, você concorda com a cobrança recorrente até
            o cancelamento.
          </p>
          <p>
            Você pode cancelar sua assinatura a qualquer momento. O acesso ao plano pago permanece ativo
            até o final do período já pago.
          </p>

          <h2>5. Uso Aceitável</h2>
          <p>Você concorda em não:</p>
          <ul>
            <li>Utilizar a Plataforma para fins ilegais ou não autorizados</li>
            <li>Tentar acessar contas de outros usuários</li>
            <li>Interferir no funcionamento da Plataforma</li>
            <li>Reproduzir, duplicar ou revender qualquer parte do serviço sem autorização</li>
          </ul>

          <h2>6. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo da Plataforma (design, código, textos, logotipos) é de propriedade da Trama
            Pro e está protegido por leis de propriedade intelectual. Os dados que você insere na
            Plataforma permanecem de sua propriedade.
          </p>

          <h2>7. Disponibilidade do Serviço</h2>
          <p>
            Nos esforçamos para manter a Plataforma disponível 24/7, mas não garantimos funcionamento
            ininterrupto. Podemos realizar manutenções programadas e notificaremos os usuários quando
            possível.
          </p>

          <h2>8. Limitação de Responsabilidade</h2>
          <p>
            A Trama Pro é uma ferramenta de auxílio à gestão. Não nos responsabilizamos por decisões
            comerciais tomadas com base nas informações fornecidas pela Plataforma. Os cálculos de
            precificação são sugestões e devem ser validados pelo usuário.
          </p>

          <h2>9. Rescisão</h2>
          <p>
            Podemos suspender ou encerrar sua conta caso haja violação destes Termos. Você pode excluir
            sua conta a qualquer momento entrando em contato conosco.
          </p>

          <h2>10. Alterações nos Termos</h2>
          <p>
            Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações
            significativas serão comunicadas por e-mail ou notificação na Plataforma. O uso continuado
            após as alterações constitui aceitação dos novos termos.
          </p>

          <h2>11. Contato</h2>
          <p>
            Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail:{" "}
            <a href="mailto:contato@tramapro.com.br">contato@tramapro.com.br</a>
          </p>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-6 dark:border-gray-800">
          <Link
            href="/privacidade"
            className="text-sm text-rose-600 transition-colors hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300"
          >
            Ver Política de Privacidade →
          </Link>
        </div>
      </div>
    </div>
  );
}
