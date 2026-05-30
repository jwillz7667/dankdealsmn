'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, FolderTree } from 'lucide-react';
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from './actions';
import { DeleteButton } from './DeleteButton';
import type { AdminCategory } from './types';

interface EditorState {
  name: string;
  slug: string;
  blurb: string;
  iconKey: string;
  sortOrder: string;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
}

function emptyEditor(): EditorState {
  return {
    name: '',
    slug: '',
    blurb: '',
    iconKey: '',
    sortOrder: '0',
    isActive: true,
    metaTitle: '',
    metaDescription: '',
  };
}

function fromCategory(c: AdminCategory): EditorState {
  return {
    name: c.name,
    slug: c.slug,
    blurb: c.blurb ?? '',
    iconKey: c.iconKey ?? '',
    sortOrder: String(c.sortOrder),
    isActive: c.isActive,
    metaTitle: c.metaTitle ?? '',
    metaDescription: c.metaDescription ?? '',
  };
}

function toPayload(s: EditorState): Record<string, unknown> {
  return {
    name: s.name,
    slug: s.slug.trim() || undefined,
    blurb: s.blurb.trim() === '' ? null : s.blurb.trim(),
    iconKey: s.iconKey.trim() === '' ? null : s.iconKey.trim(),
    sortOrder: s.sortOrder.trim() === '' ? 0 : Number(s.sortOrder),
    isActive: s.isActive,
    metaTitle: s.metaTitle.trim() === '' ? null : s.metaTitle.trim(),
    metaDescription: s.metaDescription.trim() === '' ? null : s.metaDescription.trim(),
  };
}

type Mode = { kind: 'create' } | { kind: 'edit'; id: string } | null;

export function CategoryManager({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [state, setState] = useState<EditorState>(emptyEditor);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setState(emptyEditor());
    setErrors({});
    setFormError(null);
    setMode({ kind: 'create' });
  }

  function openEdit(category: AdminCategory) {
    setState(fromCategory(category));
    setErrors({});
    setFormError(null);
    setMode({ kind: 'edit', id: category.id });
  }

  function close() {
    setMode(null);
  }

  function set<K extends keyof EditorState>(key: K, value: EditorState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!mode) return;
    setErrors({});
    setFormError(null);
    const payload = toPayload(state);

    startTransition(async () => {
      const result =
        mode.kind === 'create'
          ? await createCategoryAction(payload)
          : await updateCategoryAction(mode.id, payload);
      if (result.ok) {
        close();
        router.refresh();
      } else {
        setFormError(result.error);
        if (result.fieldErrors) setErrors(result.fieldErrors);
      }
    });
  }

  const err = (key: string) => errors[key];

  return (
    <div className="adminpage">
      <header className="adminpage__head">
        <div>
          <h1>Categories</h1>
          <p>{categories.length} categories organize the storefront menu.</p>
        </div>
        {!mode && (
          <button type="button" className="btn" onClick={openCreate}>
            <Plus className="ic" aria-hidden /> Add category
          </button>
        )}
      </header>

      {mode && (
        <form className="adminbox adminform" onSubmit={onSubmit} noValidate>
          <h2 className="adminbox__title">{mode.kind === 'create' ? 'New category' : 'Edit category'}</h2>
          {formError && (
            <p className="formerror" role="alert">
              {formError}
            </p>
          )}
          <div className="adminform__grid adminform__grid--2">
            <div className="field">
              <label htmlFor="c-name">Name</label>
              <input
                id="c-name"
                className="input"
                value={state.name}
                onChange={(e) => set('name', e.target.value)}
                aria-invalid={Boolean(err('name'))}
                maxLength={80}
                required
              />
              {err('name') && <span className="field__err">{err('name')}</span>}
            </div>
            <div className="field">
              <label htmlFor="c-slug">Slug</label>
              <input
                id="c-slug"
                className="input"
                value={state.slug}
                onChange={(e) => set('slug', e.target.value)}
                placeholder="auto-generated"
                maxLength={100}
              />
              {err('slug') && <span className="field__err">{err('slug')}</span>}
            </div>
          </div>
          <div className="field">
            <label htmlFor="c-blurb">Blurb</label>
            <input
              id="c-blurb"
              className="input"
              value={state.blurb}
              onChange={(e) => set('blurb', e.target.value)}
              maxLength={240}
            />
            {err('blurb') && <span className="field__err">{err('blurb')}</span>}
          </div>
          <div className="adminform__grid adminform__grid--2">
            <div className="field">
              <label htmlFor="c-icon">Icon key</label>
              <input
                id="c-icon"
                className="input"
                value={state.iconKey}
                onChange={(e) => set('iconKey', e.target.value)}
                placeholder="e.g. flower"
                maxLength={40}
              />
              {err('iconKey') && <span className="field__err">{err('iconKey')}</span>}
            </div>
            <div className="field">
              <label htmlFor="c-sort">Sort order</label>
              <input
                id="c-sort"
                className="input"
                type="number"
                step="1"
                value={state.sortOrder}
                onChange={(e) => set('sortOrder', e.target.value)}
              />
              {err('sortOrder') && <span className="field__err">{err('sortOrder')}</span>}
            </div>
          </div>
          <div className="adminform__grid adminform__grid--2">
            <div className="field">
              <label htmlFor="c-metatitle">Meta title</label>
              <input
                id="c-metatitle"
                className="input"
                value={state.metaTitle}
                onChange={(e) => set('metaTitle', e.target.value)}
                maxLength={70}
              />
              {err('metaTitle') && <span className="field__err">{err('metaTitle')}</span>}
            </div>
            <div className="field">
              <label htmlFor="c-metadesc">Meta description</label>
              <input
                id="c-metadesc"
                className="input"
                value={state.metaDescription}
                onChange={(e) => set('metaDescription', e.target.value)}
                maxLength={180}
              />
              {err('metaDescription') && <span className="field__err">{err('metaDescription')}</span>}
            </div>
          </div>
          <div className="checkrow">
            <input
              id="c-active"
              type="checkbox"
              checked={state.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
            />
            <span className="checkrow__txt">
              <b>Active</b>
              <span>Inactive categories are hidden from the storefront menu.</span>
            </span>
          </div>
          <div className="adminform__actions">
            <button type="submit" className="btn" disabled={pending}>
              {pending && <Loader2 className="ic spin" aria-hidden />}
              {mode.kind === 'create' ? 'Create category' : 'Save changes'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={close} disabled={pending}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {categories.length === 0 ? (
        <div className="empty">
          <FolderTree className="ic" aria-hidden />
          <p>No categories yet. Add your first one to start building the menu.</p>
        </div>
      ) : (
        <div className="adminbox" style={{ padding: 0 }}>
          <div className="tablewrap">
            <table className="datatable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th className="num">Products</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="celltitle__name">{c.name}</span>
                    </td>
                    <td className="muted">/{c.slug}</td>
                    <td className="num">{c.productCount}</td>
                    <td>
                      <span className={`tag ${c.isActive ? 'is-active' : 'is-archived'}`}>
                        {c.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div className="rowactions">
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(c)}>
                          Edit
                        </button>
                        <DeleteButton action={deleteCategoryAction} id={c.id} noun="category" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
