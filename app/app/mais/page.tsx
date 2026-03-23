import Link from "next/link";
import { requireWorkspace } from "@/lib/workspace";
import {
  Package,
  ShoppingBag,
  Users,
  Archive,
  Wrench,
  Settings,
  UserCircle,
  LifeBuoy,
  ChevronRight,
} from "lucide-react";

const ITEMS = [
  {
    href: "/app/materials",
    icon: Package,
    label: "Materiais",
    desc: "Fios, olhos, enchimentos e insumos",
    color: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
  },
  {
    href: "/app/products",
    icon: ShoppingBag,
    label: "Produtos",
    desc: "Catálogo de peças e coleções",
    color: "bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400",
  },
  {
    href: "/app/customers",
    icon: Users,
    label: "Clientes",
    desc: "Histórico e dados das clientes",
    color: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
  },
  {
    href: "/app/inventory",
    icon: Archive,
    label: "Estoque",
    desc: "Peças prontas para venda",
    color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
  },
  {
    href: "/app/overhead",
    icon: Wrench,
    label: "Custos Fixos",
    desc: "Aluguel, luz, internet e outros",
    color: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
  },
  {
    href: "/app/settings/billing",
    icon: Settings,
    label: "Assinatura",
    desc: "Plano e limites de uso",
    color: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400",
  },
  {
    href: "/app/settings/profile",
    icon: UserCircle,
    label: "Perfil",
    desc: "Nome, senha e valor da hora",
    color: "bg-gray-50 dark:bg-white/8 text-gray-600 dark:text-gray-400",
  },
  {
    href: "/app/suporte",
    icon: LifeBuoy,
    label: "Suporte",
    desc: "Dúvidas, problemas ou sugestões",
    color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
  },
];

export default async function MaisPage() {
  const { workspace } = await requireWorkspace();

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Menu</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{workspace.name}</p>
      </div>

      <nav className="space-y-2">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-[oklch(0.18_0.01_280)] px-4 py-3.5 shadow-sm transition-all active:scale-[0.98] hover:shadow-md"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
