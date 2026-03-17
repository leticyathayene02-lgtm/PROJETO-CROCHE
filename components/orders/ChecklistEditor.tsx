"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { updateChecklist } from "@/lib/orders/actions";
import { CHECKLIST_TEMPLATES, type ChecklistItem } from "@/lib/orders/validators";

export function ChecklistEditor({
  orderId,
  initialItems,
}: {
  orderId: string;
  initialItems: ChecklistItem[];
}) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [newText, setNewText] = useState("");
  const [isPending, startTransition] = useTransition();

  function save(newItems: ChecklistItem[]) {
    setItems(newItems);
    startTransition(async () => {
      await updateChecklist(orderId, newItems);
    });
  }

  function toggle(idx: number) {
    const updated = items.map((item, i) =>
      i === idx ? { ...item, done: !item.done } : item
    );
    save(updated);
  }

  function remove(idx: number) {
    save(items.filter((_, i) => i !== idx));
  }

  function addItem(text: string) {
    if (!text.trim()) return;
    save([...items, { text: text.trim(), done: false }]);
    setNewText("");
  }

  function addTemplate(text: string) {
    if (items.some((i) => i.text === text)) return;
    save([...items, { text, done: false }]);
  }

  const done = items.filter((i) => i.done).length;

  return (
    <div className="space-y-3">
      {/* Progress */}
      {items.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/8">
            <div
              className="h-full rounded-full bg-rose-500 transition-all"
              style={{ width: `${Math.round((done / items.length) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-400">
            {done}/{items.length}
          </span>
        </div>
      )}

      {/* Items */}
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2 group">
            <button
              onClick={() => toggle(idx)}
              disabled={isPending}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                item.done
                  ? "border-rose-500 bg-rose-500 text-white"
                  : "border-gray-300 bg-white dark:border-white/20 dark:bg-white/5"
              }`}
            >
              {item.done && (
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className={`flex-1 text-sm ${item.done ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-200"}`}>
              {item.text}
            </span>
            <button
              onClick={() => remove(idx)}
              disabled={isPending}
              className="hidden text-gray-300 transition hover:text-red-400 group-hover:block dark:text-white/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>

      {/* Add item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem(newText))}
          placeholder="Novo item..."
          className="flex-1 rounded-lg border border-rose-200 bg-white/80 px-3 py-1.5 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-rose-500 dark:focus:ring-rose-500/20"
          disabled={isPending}
        />
        <button
          onClick={() => addItem(newText)}
          disabled={isPending || !newText.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white transition hover:bg-rose-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Templates */}
      <div className="flex flex-wrap gap-1.5">
        {CHECKLIST_TEMPLATES.map((tpl) => (
          <button
            key={tpl}
            onClick={() => addTemplate(tpl)}
            disabled={isPending || items.some((i) => i.text === tpl)}
            className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-800/50 dark:bg-rose-950/30 dark:text-rose-400"
          >
            + {tpl}
          </button>
        ))}
      </div>
    </div>
  );
}
