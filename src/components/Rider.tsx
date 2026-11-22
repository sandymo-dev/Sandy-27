"use client";

import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { SectionTitle, inputDark } from "@/components/ui";
import type { FoodIdeaGroup } from "@/lib/types";

export const MAX_ITEMS = 10;
const MAX_ITEM_LENGTH = 60;

/** Splits a saved "a, b, c" food string into items, matching ideas case-insensitively. */
export function parseFood(food: string | null, ideas: string[]): string[] {
  const items: string[] = [];
  for (const part of (food ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)) {
    const value = ideas.find((i) => i.toLowerCase() === part.toLowerCase()) ?? part;
    if (!items.some((x) => same(x, value))) items.push(value);
  }
  return items;
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
/** Commas are the separator in storage, so they can't live inside one item. */
const clean = (s: string) => s.replace(/,/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_ITEM_LENGTH);

type Props = {
  ideaGroups: FoodIdeaGroup[];
  others: { name: string; what: string }[];
  items: string[];
  onItemsChange: (items: string[]) => void;
};

export function Rider({ ideaGroups, others, items, onItemsChange }: Props) {
  const ideas = ideaGroups.flatMap((g) => g.items);
  const [showOthers, setShowOthers] = useState(true);
  const [showIdeas, setShowIdeas] = useState(true);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<{
    index: number;
    value: string;
  } | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const isIdea = (item: string) => ideas.some((i) => same(i, item));
  const has = (item: string) => items.some((x) => same(x, item));
  const full = items.length >= MAX_ITEMS;

  // Who else is already bringing each idea (ideas stay pickable, doubles are fine).
  const bringers = new Map<string, string[]>();
  for (const o of others) {
    for (const part of o.what.split(",").map((s) => s.trim())) {
      const idea = ideas.find((i) => same(i, part));
      if (idea) bringers.set(idea, [...(bringers.get(idea) ?? []), o.name]);
    }
  }

  function toggleIdea(idea: string) {
    setNote(null);
    if (has(idea)) onItemsChange(items.filter((x) => !same(x, idea)));
    else if (!full) onItemsChange([...items, idea]);
  }

  function addDraft() {
    const value = clean(draft);
    if (!value) return;
    if (has(value)) {
      setNote(`"${value}" is already on your list.`);
      return;
    }
    if (full) {
      setNote(`That's ${MAX_ITEMS} things already. Generous!`);
      return;
    }
    const idea = ideas.find((i) => same(i, value));
    onItemsChange([...items, idea ?? value]);
    setDraft("");
    setNote(null);
  }

  function saveEdit() {
    if (!editing) return;
    const value = clean(editing.value);
    if (!value) {
      remove(editing.index);
    } else if (items.some((x, i) => i !== editing.index && same(x, value))) {
      setNote(`"${value}" is already on your list.`);
      return;
    } else {
      onItemsChange(items.map((x, i) => (i === editing.index ? value : x)));
      setNote(null);
    }
    setEditing(null);
  }

  function remove(index: number) {
    onItemsChange(items.filter((_, i) => i !== index));
    if (editing?.index === index) setEditing(null);
    setNote(null);
  }

  const chip = "min-h-10 border-2 border-paper px-3.5 font-anton text-base tracking-[0.08em] uppercase";

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle>THE RIDER</SectionTitle>
      <span className="text-sm text-mist">What are you bringing backstage? Pick some or write your own.</span>

      {/* Already backstage */}
      <div className="flex flex-col gap-2.5 border-[3px] border-dashed border-paper px-4 py-3.5">
        <Toggle id="rider-others" open={showOthers} onToggle={() => setShowOthers((v) => !v)} count={others.length}>
          ALREADY BACKSTAGE
        </Toggle>
        {showOthers && (
          <div id="rider-others" className="flex flex-col gap-2.5">
            {others.length === 0 ? (
              <span className="font-marker text-[15px] text-mist">Nobody yet. Be the first!</span>
            ) : (
              others.map((o, i) => (
                <div key={i} className="flex justify-between gap-3 text-[15px]">
                  <span className="font-extrabold">{o.name}</span>
                  <span className="text-right font-marker">{o.what}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {/* What I'm bringing */}
        <div className="flex flex-col gap-2 bg-paper px-4 py-3.5 text-ink hard-shadow">
          <span className="font-anton text-base tracking-[0.16em]">
            I&apos;M BRINGING{items.length > 0 && ` (${items.length})`}
          </span>
          {items.length === 0 ? (
            <span className="font-marker text-[15px] text-ash">Nothing yet. Tap an idea or add your own.</span>
          ) : (
            <ul className="flex flex-col">
              {items.map((item, i) => {
                const custom = !isIdea(item);
                const isEditing = editing?.index === i;
                return (
                  <li
                    key={`${item}-${i}`}
                    className="flex min-h-11 items-center gap-2 border-b-2 border-ink/15 last:border-b-0"
                  >
                    {isEditing ? (
                      <input
                        autoFocus
                        aria-label={`Edit ${item}`}
                        value={editing.value}
                        maxLength={MAX_ITEM_LENGTH}
                        onChange={(e) => setEditing({ index: i, value: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveEdit();
                          } else if (e.key === "Escape") {
                            setEditing(null);
                          }
                        }}
                        onBlur={saveEdit}
                        className="h-9 min-w-0 flex-1 border-2 border-ink bg-paper px-2 font-body text-base font-semibold text-ink"
                      />
                    ) : (
                      <span className="min-w-0 flex-1 truncate text-[16px] font-extrabold">
                        {item}
                        {custom && <span className="ml-2 font-marker text-[13px] font-normal text-ash">your own</span>}
                      </span>
                    )}
                    {custom && !isEditing && (
                      <IconButton label={`Edit ${item}`} onClick={() => setEditing({ index: i, value: item })}>
                        <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 0 0 0-1.41l-2.33-2.33a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.82-1.84z" />
                      </IconButton>
                    )}
                    {isEditing ? (
                      <IconButton label="Save" onMouseDown={(e) => e.preventDefault()} onClick={saveEdit}>
                        <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                      </IconButton>
                    ) : (
                      <IconButton label={`Remove ${item}`} onClick={() => remove(i)}>
                        <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                      </IconButton>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Ideas */}
        <div className="flex flex-col gap-2.5">
          <Toggle id="rider-ideas" open={showIdeas} onToggle={() => setShowIdeas((v) => !v)} count={ideas.length}>
            IDEAS
          </Toggle>
          {showIdeas && (
            <div id="rider-ideas" className="flex flex-col gap-3.5">
              {ideaGroups.map((g) => (
                <div key={g.group} className="flex flex-col gap-2">
                  <span className="font-anton text-sm tracking-[0.18em] text-smoke uppercase">{g.group}</span>
                  <div className="flex flex-wrap gap-2">
                    {g.items.map((idea) => {
                      const on = has(idea);
                      const who = bringers.get(idea) ?? [];
                      return (
                        <button
                          key={idea}
                          type="button"
                          disabled={!on && full}
                          aria-pressed={on}
                          title={who.length ? `Also bringing: ${who.join(", ")}` : undefined}
                          onClick={() => toggleIdea(idea)}
                          className={`${chip} flex items-center gap-1.5 disabled:cursor-not-allowed ${on ? "bg-paper text-ink" : "text-paper"}`}
                        >
                          {on && <span aria-hidden>✓</span>}
                          {idea}
                          {who.length > 0 && (
                            <span
                              className={`ml-0.5 font-body text-[11px] font-bold tracking-normal normal-case ${on ? "text-ash" : "text-smoke"}`}
                              aria-label={`${who.length} other${who.length > 1 ? "s" : ""} bringing this`}
                            >
                              ×{who.length}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          {showIdeas && bringers.size > 0 && (
            <span className="text-[13px] text-smoke">×2 = already being brought by 2 others. Doubles are welcome!</span>
          )}
        </div>

        {/* Add your own */}
        <label htmlFor="food-custom" className="mt-1 font-anton text-sm tracking-[0.18em] text-smoke">
          SOMETHING ELSE
        </label>
        <div className="flex gap-2">
          <input
            id="food-custom"
            value={draft}
            disabled={full}
            onChange={(e) => {
              setDraft(e.target.value);
              setNote(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDraft();
              }
            }}
            placeholder={full ? "List is full" : "e.g. Mom's sambal"}
            maxLength={MAX_ITEM_LENGTH}
            autoComplete="off"
            enterKeyHint="done"
            className={`${inputDark} min-w-0 flex-1 disabled:opacity-40`}
          />
          <button
            type="button"
            onClick={addDraft}
            disabled={full || !clean(draft)}
            className="h-12 shrink-0 border-[3px] border-paper bg-paper px-4 font-anton text-lg tracking-[0.1em] text-ink disabled:opacity-40"
          >
            ADD
          </button>
        </div>
        {note && <span className="font-marker text-[15px]">{note}</span>}
      </div>

      <span className="text-[15px] font-semibold text-mist">
        Not sure yet? Leave it empty and come back to it later.
      </span>
    </section>
  );
}

function Toggle({
  id,
  open,
  onToggle,
  count,
  children,
}: {
  id: string;
  open: boolean;
  onToggle: () => void;
  count: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={id}
      onClick={onToggle}
      className="-my-1 flex min-h-10 items-center justify-between gap-3 text-left"
    >
      <span className="font-anton text-base tracking-[0.16em]">{children}</span>
      <span className="flex items-center gap-1.5 font-anton text-sm tracking-[0.14em] text-smoke">
        {open ? "HIDE" : `SHOW${count ? ` (${count})` : ""}`}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          aria-hidden
          className={open ? "rotate-180" : ""}
          fill="currentColor"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </span>
    </button>
  );
}

function IconButton({
  label,
  children,
  ...rest
}: { label: string; children: ReactNode } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-ink text-ink active:bg-ink active:text-paper disabled:opacity-40"
      {...rest}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        {children}
      </svg>
    </button>
  );
}
