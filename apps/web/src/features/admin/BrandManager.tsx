'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Tags } from 'lucide-react';
import { createBrandAction, updateBrandAction, deleteBrandAction } from './actions';
import { DeleteButton } from './DeleteButton';
import type { AdminBrand } from './types';

interface EditorState {
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  isActive: boolean;
}

function emptyEditor(): EditorState {
  return { name: '', slug: '', logoUrl: '', description: '', isActive: true };
}

function fromBrand(b: AdminBrand): EditorState {
  return {
    name: b.name,
    slug: b.slug,
    logoUrl: b.logoUrl ?? '',
    description: b.description ?? '',
    isActive: b.isActive,
  };
}

function toPayload(s: EditorState): Record<string, unknown> {
  return {
    name: s.name,
    slug: s.slug.trim() || undefined,
    logoUrl: s.logoUrl.trim() === '' ? null : s.logoUrl.trim(),
    description: s.description.trim() === '' ? null : s.description.trim(),
    isActive: s.isActive,
  };
}

type Mode = { kind: 'create' } | { kind: 'edit'; id: string } | null;

export function BrandManager({ brands }: { brands: AdminBrand[] }) {
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

  function openEdit(brand: AdminBrand) {
    setState(fromBrand(brand));
    setErrors({});
    setFormError(null);
    setMode({ kind: 'edit', id: brand.id });
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
          ? await createBrandAction(payload)
          : await updateBrandAction(mode.id, payload);
      if (result.ok) {
        setMode(null);
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
          <h1>Brands</h1>
          <p>{brands.length} brands available for product attribution.</p>
        </div>
        {!mode && (
          <button type="button" className="btn" onClick={openCreate}>
            <Plus className="ic" aria-hidden /> Add brand
          </button>
        )}
      </header>

      {mode && (
        <form className="adminbox adminform" onSubmit={onSubmit} noValidate>
          <h2 className="adminbox__title">{mode.kind === 'create' ? 'New brand' : 'Edit brand'}</h2>
          {formError && (
            <p className="formerror" role="alert">
              {formError}
            </p>
          )}
          <div className="adminform__grid adminform__grid--2">
            <div className="field">
              <label htmlFor="b-name">Name</label>
              <input
                id="b-name"
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
              <label htmlFor="b-slug">Slug</label>
              <input
                id="b-slug"
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
            <label htmlFor="b-logo">Logo URL</label>
            <input
              id="b-logo"
              className="input"
              type="url"
              value={state.logoUrl}
              onChange={(e) => set('logoUrl', e.target.value)}
              placeholder="https://…"
              aria-invalid={Boolean(err('logoUrl'))}
            />
            {err('logoUrl') && <span className="field__err">{err('logoUrl')}</span>}
          </div>
          <div className="field">
            <label htmlFor="b-desc">Description</label>
            <textarea
              id="b-desc"
              className="input"
              rows={3}
              value={state.description}
              onChange={(e) => set('description', e.target.value)}
              maxLength={500}
            />
            {err('description') && <span className="field__err">{err('description')}</span>}
          </div>
          <div className="checkrow">
            <input
              id="b-active"
              type="checkbox"
              checked={state.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
            />
            <span className="checkrow__txt">
              <b>Active</b>
              <span>Inactive brands stay attached to products but are hidden from filters.</span>
            </span>
          </div>
          <div className="adminform__actions">
            <button type="submit" className="btn" disabled={pending}>
              {pending && <Loader2 className="ic spin" aria-hidden />}
              {mode.kind === 'create' ? 'Create brand' : 'Save changes'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setMode(null)} disabled={pending}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {brands.length === 0 ? (
        <div className="empty">
          <Tags className="ic" aria-hidden />
          <p>No brands yet. Add brands to attribute and filter products.</p>
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
                {brands.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span className="celltitle__name">{b.name}</span>
                    </td>
                    <td className="muted">/{b.slug}</td>
                    <td className="num">{b.productCount}</td>
                    <td>
                      <span className={`tag ${b.isActive ? 'is-active' : 'is-archived'}`}>
                        {b.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div className="rowactions">
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(b)}>
                          Edit
                        </button>
                        <DeleteButton action={deleteBrandAction} id={b.id} noun="brand" />
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
