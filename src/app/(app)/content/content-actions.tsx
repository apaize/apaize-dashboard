'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { addBannedWord, removeBannedWord, toggleSparkActive, toggleThemePublished } from './actions';

export function AddBannedWordForm() {
  const [word, setWord] = useState('');
  const [severity, setSeverity] = useState<'block' | 'flag' | 'crisis'>('flag');
  const [category, setCategory] = useState('general');
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!word) return;
        start(async () => {
          await addBannedWord(word, severity, category);
          setWord('');
        });
      }}
      className="flex gap-2 mb-4 flex-wrap"
    >
      <input
        type="text"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="nouveau mot"
        className="flex-1 min-w-32 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-medium)] text-sm"
      />
      <select
        value={severity}
        onChange={(e) => setSeverity(e.target.value as any)}
        className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-medium)] text-sm"
      >
        <option value="flag">flag</option>
        <option value="block">block</option>
        <option value="crisis">crisis</option>
      </select>
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="catégorie"
        className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-medium)] text-sm w-32"
      />
      <button
        type="submit"
        disabled={!word || pending}
        className="px-4 py-2 rounded-lg bg-[var(--serenity)] hover:bg-[var(--serenity-dark)] text-white text-sm font-bold disabled:opacity-50 flex items-center gap-1"
      >
        <Plus size={14} /> Ajouter
      </button>
    </form>
  );
}

export function DeleteBannedWordBtn({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => {
        if (confirm('Supprimer ce mot ?')) start(() => removeBannedWord(id));
      }}
      disabled={pending}
      className="text-[var(--coral)] hover:bg-[var(--coral)]/15 p-1.5 rounded-lg"
    >
      <Trash2 size={12} />
    </button>
  );
}

export function ToggleSpark({ sparkKey, isActive }: { sparkKey: string; isActive: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => toggleSparkActive(sparkKey, isActive))}
      disabled={pending}
      title={isActive ? 'Désactiver' : 'Activer'}
      className={isActive ? 'text-[var(--breath)]' : 'text-[var(--text-muted)]'}
    >
      {isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
    </button>
  );
}

export function ToggleThemePublish({ id, isPublished }: { id: string; isPublished: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => toggleThemePublished(id, isPublished))}
      disabled={pending}
      className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
        isPublished
          ? 'bg-[var(--breath)]/15 text-[var(--breath)] border border-[var(--breath)]/30'
          : 'bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30'
      }`}
    >
      {isPublished ? 'Publié' : 'Brouillon'}
    </button>
  );
}
