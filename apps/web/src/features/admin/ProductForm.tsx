'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import type { Badge, PotencyUnit, ProductStatus, StrainType } from '@/lib/api/types';
import { createProductAction, updateProductAction } from './actions';
import type { AdminBrand, AdminCategory, AdminProduct } from './types';

const STRAINS: { value: StrainType; label: string }[] = [
  { value: 'INDICA', label: 'Indica' },
  { value: 'SATIVA', label: 'Sativa' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'CBD', label: 'CBD' },
];
const STATUSES: { value: ProductStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ARCHIVED', label: 'Archived' },
];
const BADGES: { value: Badge; label: string }[] = [
  { value: 'DEAL', label: 'Deal' },
  { value: 'NEW', label: 'New' },
  { value: 'BEST', label: 'Best seller' },
];

interface FormState {
  name: string;
  slug: string;
  categoryId: string;
  brandId: string;
  strainType: StrainType;
  thcValue: string;
  thcUnit: PotencyUnit;
  cbdValue: string;
  cbdUnit: PotencyUnit;
  price: string;
  compareAt: string;
  size: string;
  badges: Badge[];
  effects: string;
  shortDescription: string;
  description: string;
  status: ProductStatus;
  isFeatured: boolean;
  trackInventory: boolean;
  inventoryQty: string;
  position: string;
  metaTitle: string;
  metaDescription: string;
}

function emptyState(categories: AdminCategory[]): FormState {
  return {
    name: '',
    slug: '',
    categoryId: categories[0]?.id ?? '',
    brandId: '',
    strainType: 'HYBRID',
    thcValue: '',
    thcUnit: 'PERCENT',
    cbdValue: '',
    cbdUnit: 'PERCENT',
    price: '',
    compareAt: '',
    size: '',
    badges: [],
    effects: '',
    shortDescription: '',
    description: '',
    status: 'ACTIVE',
    isFeatured: false,
    trackInventory: false,
    inventoryQty: '0',
    position: '0',
    metaTitle: '',
    metaDescription: '',
  };
}

function fromProduct(p: AdminProduct): FormState {
  return {
    name: p.name,
    slug: p.slug,
    categoryId: p.categoryId,
    brandId: p.brandId ?? '',
    strainType: p.strainType,
    thcValue: p.thc && p.thc.value !== null ? String(p.thc.value) : '',
    thcUnit: p.thc?.unit ?? 'PERCENT',
    cbdValue: p.cbd && p.cbd.value !== null ? String(p.cbd.value) : '',
    cbdUnit: p.cbd?.unit ?? 'PERCENT',
    price: (p.priceCents / 100).toString(),
    compareAt: p.compareAtCents !== null ? (p.compareAtCents / 100).toString() : '',
    size: p.size,
    badges: [...p.badges],
    effects: p.effects.join(', '),
    shortDescription: p.shortDescription ?? '',
    description: p.description,
    status: p.status,
    isFeatured: p.isFeatured,
    trackInventory: p.trackInventory,
    inventoryQty: String(p.inventoryQty),
    position: String(p.position),
    metaTitle: p.metaTitle ?? '',
    metaDescription: p.metaDescription ?? '',
  };
}

/** Dollars string → integer cents; empty/non-numeric → undefined so Zod flags it. */
function toCents(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? Math.round(n * 100) : undefined;
}

function toNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

function toPayload(s: FormState): Record<string, unknown> {
  return {
    name: s.name,
    slug: s.slug.trim() || undefined,
    categoryId: s.categoryId,
    brandId: s.brandId || null,
    strainType: s.strainType,
    thcValue: s.thcValue.trim() === '' ? null : toNumber(s.thcValue),
    thcUnit: s.thcUnit,
    cbdValue: s.cbdValue.trim() === '' ? null : toNumber(s.cbdValue),
    cbdUnit: s.cbdUnit,
    priceCents: toCents(s.price),
    compareAtCents: s.compareAt.trim() === '' ? null : toCents(s.compareAt),
    size: s.size,
    badges: s.badges,
    effects: s.effects
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean),
    shortDescription: s.shortDescription.trim() === '' ? null : s.shortDescription.trim(),
    description: s.description,
    status: s.status,
    isFeatured: s.isFeatured,
    trackInventory: s.trackInventory,
    inventoryQty: s.inventoryQty.trim() === '' ? 0 : toNumber(s.inventoryQty),
    position: s.position.trim() === '' ? 0 : toNumber(s.position),
    metaTitle: s.metaTitle.trim() === '' ? null : s.metaTitle.trim(),
    metaDescription: s.metaDescription.trim() === '' ? null : s.metaDescription.trim(),
  };
}

interface ProductFormProps {
  categories: AdminCategory[];
  brands: AdminBrand[];
  product?: AdminProduct;
}

export function ProductForm({ categories, brands, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [state, setState] = useState<FormState>(() =>
    product ? fromProduct(product) : emptyState(categories),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  function toggleBadge(badge: Badge) {
    setState((s) => ({
      ...s,
      badges: s.badges.includes(badge) ? s.badges.filter((b) => b !== badge) : [...s.badges, badge],
    }));
    setSaved(false);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setErrors({});
    setSaved(false);
    const payload = toPayload(state);

    startTransition(async () => {
      const result =
        isEdit && product
          ? await updateProductAction(product.id, payload)
          : await createProductAction(payload);

      if (result.ok) {
        if (isEdit) {
          setSaved(true);
          router.refresh();
        } else {
          router.push(`/admin/products/${result.data.id}`);
        }
      } else {
        setFormError(result.error);
        if (result.fieldErrors) setErrors(result.fieldErrors);
      }
    });
  }

  const err = (key: string) => errors[key];

  return (
    <form className="adminform" onSubmit={onSubmit} noValidate>
      {formError && (
        <p className="formerror" role="alert">
          {formError}
        </p>
      )}
      {saved && (
        <p className="formok" role="status">
          Changes saved.
        </p>
      )}

      <section className="adminbox">
        <h2 className="adminbox__title">Basics</h2>
        <div className="adminform__grid">
          <div className="field">
            <label htmlFor="pf-name">Product name</label>
            <input
              id="pf-name"
              className="input"
              value={state.name}
              onChange={(e) => set('name', e.target.value)}
              aria-invalid={Boolean(err('name'))}
              maxLength={160}
              required
            />
            {err('name') && <span className="field__err">{err('name')}</span>}
          </div>

          <div className="adminform__grid adminform__grid--2">
            <div className="field">
              <label htmlFor="pf-category">Category</label>
              <select
                id="pf-category"
                className="select"
                value={state.categoryId}
                onChange={(e) => set('categoryId', e.target.value)}
                aria-invalid={Boolean(err('categoryId'))}
                required
              >
                <option value="" disabled>
                  Choose a category…
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {err('categoryId') && <span className="field__err">{err('categoryId')}</span>}
            </div>

            <div className="field">
              <label htmlFor="pf-brand">Brand</label>
              <select
                id="pf-brand"
                className="select"
                value={state.brandId}
                onChange={(e) => set('brandId', e.target.value)}
              >
                <option value="">No brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="pf-slug">URL slug</label>
            <input
              id="pf-slug"
              className="input"
              value={state.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="auto-generated from name"
              aria-invalid={Boolean(err('slug'))}
              maxLength={180}
            />
            <span className="fieldhint">Leave blank to generate from the product name.</span>
            {err('slug') && <span className="field__err">{err('slug')}</span>}
          </div>
        </div>
      </section>

      <section className="adminbox">
        <h2 className="adminbox__title">Potency &amp; type</h2>
        <div className="adminform__grid adminform__grid--3">
          <div className="field">
            <label htmlFor="pf-strain">Strain type</label>
            <select
              id="pf-strain"
              className="select"
              value={state.strainType}
              onChange={(e) => set('strainType', e.target.value as StrainType)}
            >
              {STRAINS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="pf-thc">THC</label>
            <div className="adminform__grid adminform__grid--2">
              <input
                id="pf-thc"
                className="input"
                type="number"
                step="0.1"
                min="0"
                max="1000"
                value={state.thcValue}
                onChange={(e) => set('thcValue', e.target.value)}
                aria-invalid={Boolean(err('thcValue'))}
              />
              <select
                className="select"
                aria-label="THC unit"
                value={state.thcUnit}
                onChange={(e) => set('thcUnit', e.target.value as PotencyUnit)}
              >
                <option value="PERCENT">%</option>
                <option value="MG">mg</option>
              </select>
            </div>
            {err('thcValue') && <span className="field__err">{err('thcValue')}</span>}
          </div>

          <div className="field">
            <label htmlFor="pf-cbd">CBD</label>
            <div className="adminform__grid adminform__grid--2">
              <input
                id="pf-cbd"
                className="input"
                type="number"
                step="0.1"
                min="0"
                max="1000"
                value={state.cbdValue}
                onChange={(e) => set('cbdValue', e.target.value)}
                aria-invalid={Boolean(err('cbdValue'))}
              />
              <select
                className="select"
                aria-label="CBD unit"
                value={state.cbdUnit}
                onChange={(e) => set('cbdUnit', e.target.value as PotencyUnit)}
              >
                <option value="PERCENT">%</option>
                <option value="MG">mg</option>
              </select>
            </div>
            {err('cbdValue') && <span className="field__err">{err('cbdValue')}</span>}
          </div>
        </div>

        <div className="adminform__grid" style={{ marginTop: 14 }}>
          <span className="authlabel">Badges</span>
          <div className="badgepick">
            {BADGES.map((b) => {
              const on = state.badges.includes(b.value);
              return (
                <button
                  key={b.value}
                  type="button"
                  className="chip"
                  aria-pressed={on}
                  onClick={() => toggleBadge(b.value)}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="adminbox">
        <h2 className="adminbox__title">Pricing &amp; inventory</h2>
        <div className="adminform__grid adminform__grid--3">
          <div className="field">
            <label htmlFor="pf-price">Price</label>
            <div className="inputprefix">
              <span>$</span>
              <input
                id="pf-price"
                className="input"
                type="number"
                step="0.01"
                min="0"
                value={state.price}
                onChange={(e) => set('price', e.target.value)}
                aria-invalid={Boolean(err('priceCents'))}
                required
              />
            </div>
            {err('priceCents') && <span className="field__err">{err('priceCents')}</span>}
          </div>

          <div className="field">
            <label htmlFor="pf-compare">Compare-at price</label>
            <div className="inputprefix">
              <span>$</span>
              <input
                id="pf-compare"
                className="input"
                type="number"
                step="0.01"
                min="0"
                value={state.compareAt}
                onChange={(e) => set('compareAt', e.target.value)}
                aria-invalid={Boolean(err('compareAtCents'))}
              />
            </div>
            <span className="fieldhint">Shown struck-through to signal a deal.</span>
            {err('compareAtCents') && <span className="field__err">{err('compareAtCents')}</span>}
          </div>

          <div className="field">
            <label htmlFor="pf-size">Size / weight</label>
            <input
              id="pf-size"
              className="input"
              value={state.size}
              onChange={(e) => set('size', e.target.value)}
              placeholder="e.g. 3.5g"
              aria-invalid={Boolean(err('size'))}
              maxLength={60}
              required
            />
            {err('size') && <span className="field__err">{err('size')}</span>}
          </div>
        </div>

        <div className="adminform__grid adminform__grid--2" style={{ marginTop: 14 }}>
          <div className="checkrow">
            <input
              id="pf-track"
              type="checkbox"
              checked={state.trackInventory}
              onChange={(e) => set('trackInventory', e.target.checked)}
            />
            <span className="checkrow__txt">
              <b>Track inventory</b>
              <span>Hide the product automatically when stock hits zero.</span>
            </span>
          </div>
          <div className="field">
            <label htmlFor="pf-qty">Inventory quantity</label>
            <input
              id="pf-qty"
              className="input"
              type="number"
              min="0"
              step="1"
              value={state.inventoryQty}
              onChange={(e) => set('inventoryQty', e.target.value)}
              disabled={!state.trackInventory}
              aria-invalid={Boolean(err('inventoryQty'))}
            />
            {err('inventoryQty') && <span className="field__err">{err('inventoryQty')}</span>}
          </div>
        </div>
      </section>

      <section className="adminbox">
        <h2 className="adminbox__title">Content</h2>
        <div className="adminform__grid">
          <div className="field">
            <label htmlFor="pf-effects">Effects</label>
            <input
              id="pf-effects"
              className="input"
              value={state.effects}
              onChange={(e) => set('effects', e.target.value)}
              placeholder="Relaxed, Happy, Sleepy"
            />
            <span className="fieldhint">Comma-separated. Shown as tags on the product page.</span>
            {err('effects') && <span className="field__err">{err('effects')}</span>}
          </div>

          <div className="field">
            <label htmlFor="pf-short">Short description</label>
            <input
              id="pf-short"
              className="input"
              value={state.shortDescription}
              onChange={(e) => set('shortDescription', e.target.value)}
              maxLength={240}
              aria-invalid={Boolean(err('shortDescription'))}
            />
            {err('shortDescription') && (
              <span className="field__err">{err('shortDescription')}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="pf-desc">Full description</label>
            <textarea
              id="pf-desc"
              className="input"
              rows={6}
              value={state.description}
              onChange={(e) => set('description', e.target.value)}
              aria-invalid={Boolean(err('description'))}
              maxLength={8000}
              required
            />
            {err('description') && <span className="field__err">{err('description')}</span>}
          </div>
        </div>
      </section>

      <section className="adminbox">
        <h2 className="adminbox__title">Visibility &amp; SEO</h2>
        <div className="adminform__grid adminform__grid--2">
          <div className="field">
            <label htmlFor="pf-status">Status</label>
            <select
              id="pf-status"
              className="select"
              value={state.status}
              onChange={(e) => set('status', e.target.value as ProductStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pf-position">Sort position</label>
            <input
              id="pf-position"
              className="input"
              type="number"
              step="1"
              value={state.position}
              onChange={(e) => set('position', e.target.value)}
              aria-invalid={Boolean(err('position'))}
            />
            <span className="fieldhint">Lower numbers appear first within a category.</span>
            {err('position') && <span className="field__err">{err('position')}</span>}
          </div>
        </div>

        <div className="checkrow" style={{ marginTop: 14 }}>
          <input
            id="pf-featured"
            type="checkbox"
            checked={state.isFeatured}
            onChange={(e) => set('isFeatured', e.target.checked)}
          />
          <span className="checkrow__txt">
            <b>Feature on the homepage</b>
            <span>Featured products surface in the “Staff picks” rail.</span>
          </span>
        </div>

        <div className="adminform__grid" style={{ marginTop: 14 }}>
          <div className="field">
            <label htmlFor="pf-metatitle">Meta title</label>
            <input
              id="pf-metatitle"
              className="input"
              value={state.metaTitle}
              onChange={(e) => set('metaTitle', e.target.value)}
              maxLength={70}
              aria-invalid={Boolean(err('metaTitle'))}
            />
            <span className="fieldhint">Defaults to the product name. ~60 characters.</span>
            {err('metaTitle') && <span className="field__err">{err('metaTitle')}</span>}
          </div>
          <div className="field">
            <label htmlFor="pf-metadesc">Meta description</label>
            <textarea
              id="pf-metadesc"
              className="input"
              rows={2}
              value={state.metaDescription}
              onChange={(e) => set('metaDescription', e.target.value)}
              maxLength={180}
              aria-invalid={Boolean(err('metaDescription'))}
            />
            {err('metaDescription') && (
              <span className="field__err">{err('metaDescription')}</span>
            )}
          </div>
        </div>
      </section>

      <div className="adminform__actions">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? <Loader2 className="ic spin" aria-hidden /> : <Save className="ic" aria-hidden />}
          {isEdit ? 'Save changes' : 'Create product'}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => router.push('/admin/products')}
          disabled={pending}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
