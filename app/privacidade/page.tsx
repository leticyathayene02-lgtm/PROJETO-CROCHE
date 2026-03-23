import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Trama Pro",
  description: "Política de privacidade da plataforma Trama Pro",
};

export default function PrivacidadePage() {
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
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Última atualização: 23 de março de 2026
        </p>

        <div className="prose prose-gray mt-10 max-w-none dark:prose-invert prose-headings:font-heading prose-headings:text-rose-900 dark:prose-headings:text-rose-200 prose-a:text-rose-600 dark:prose-a:text-rose-400">
          <h2>1. Informações que Coletamos</h2>
          <p>Coletamos as seguintes informações quando você utiliza a Trama Pro:</p>
          <ul>
            <li>
              <strong>Dados de cadastro:</strong> nome, e-mail e senha (armazenada de forma criptografada
              com bcrypt)
            </li>
            <li>
              <strong>Dados de uso:</strong> produtos cadastrados, materiais, cálculos de precificação,
              transações financeiras, pedidos e clientes
            </li>
            <li>
              <strong>Dados de pagamento:</strong> processados diretamente pelo Stripe — não armazenamos
              dados de cartão de crédito em nossos servidores
            </li>
            <li>
              <strong>Dados técnicos:</strong> endereço IP, tipo de navegador e dados de acesso para
              fins de segurança
            </li>
          </ul>

          <h2>2. Como Utilizamos suas Informações</h2>
          <p>Utilizamos seus dados para:</p>
          <ul>
            <li>Fornecer e manter os serviços da Plataforma</li>
            <li>Processar pagamentos e gerenciar assinaturas</li>
            <li>Enviar comunicações importantes sobre sua conta</li>
            <li>Melhorar a experiência do usuário e desenvolver novas funcionalidades</li>
            <li>Garantir a segurança da Plataforma</li>
          </ul>

          <h2>3. Armazenamento e Segurança</h2>
          <p>
            Seus dados são armazenados em servidores seguros com criptografia. Senhas são protegidas
            com hash bcrypt e nunca armazenadas em texto puro. Utilizamos sessões com cookies httpOnly
            para proteger sua autenticação.
          </p>
          <p>
            Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não
            autorizado, alteração, divulgação ou destruição.
          </p>

          <h2>4. Compartilhamento de Dados</h2>
          <p>
            <strong>Não vendemos seus dados.</strong> Compartilhamos informações apenas com:
          </p>
          <ul>
            <li>
              <strong>Stripe:</strong> para processamento de pagamentos
            </li>
            <li>
              <strong>Provedores de infraestrutura:</strong> para hospedagem e funcionamento da
              Plataforma (ex: Vercel, banco de dados)
            </li>
          </ul>
          <p>
            Todos os terceiros com quem compartilhamos dados estão sujeitos a obrigações de
            confidencialidade.
          </p>

          <h2>5. Seus Direitos (LGPD)</h2>
          <p>
            Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), você tem
            direito a:
          </p>
          <ul>
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou desatualizados</li>
            <li>Solicitar a exclusão de seus dados</li>
            <li>Revogar o consentimento para uso de seus dados</li>
            <li>Solicitar a portabilidade dos seus dados</li>
            <li>Obter informações sobre o compartilhamento de seus dados</li>
          </ul>
          <p>
            Para exercer qualquer desses direitos, entre em contato pelo e-mail:{" "}
            <a href="mailto:contato@tramapro.com.br">contato@tramapro.com.br</a>
          </p>

          <h2>6. Cookies</h2>
          <p>Utilizamos cookies essenciais para:</p>
          <ul>
            <li>
              <strong>Sessão de autenticação:</strong> cookie httpOnly chamado &quot;session&quot; para
              manter você logado (válido por 30 dias)
            </li>
            <li>
              <strong>Preferência de tema:</strong> para lembrar sua escolha entre modo claro e escuro
            </li>
          </ul>
          <p>
            Não utilizamos cookies de rastreamento ou publicidade de terceiros.
          </p>

          <h2>7. Retenção de Dados</h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa. Após a exclusão da conta, seus dados
            serão removidos em até 30 dias, exceto quando a retenção for necessária por obrigação legal.
          </p>

          <h2>8. Menores de Idade</h2>
          <p>
            A Trama Pro não é direcionada a menores de 18 anos. Não coletamos intencionalmente dados de
            menores. Se tomarmos conhecimento de que coletamos dados de um menor, tomaremos medidas para
            excluí-los.
          </p>

          <h2>9. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças
            significativas por e-mail ou aviso na Plataforma. Recomendamos revisar esta página
            regularmente.
          </p>

          <h2>10. Contato</h2>
          <p>
            Para dúvidas sobre esta Política de Privacidade ou sobre o tratamento de seus dados, entre
            em contato:{" "}
            <a href="mailto:contato@tramapro.com.br">contato@tramapro.com.br</a>
          </p>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-6 dark:border-gray-800">
          <Link
            href="/termos"
            className="text-sm text-rose-600 transition-colors hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300"
          >
            Ver Termos de Uso →
          </Link>
        </div>
      </div>
    </div>
  );
}
