'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Banknote, ChevronLeft, Clock, CreditCard, MapPin, ShieldCheck, Truck, Zap } from 'lucide-react';
import { ProductMedia } from '@/components/ProductMedia';
import { ApiError } from '@/lib/api/client';
import { money } from '@/lib/format';
import { useHydrated } from '@/lib/use-hydrated';
import { cartSubtotalCents, useCartItems, useCartStore } from '@/features/cart/store';
import type { CreateOrderRequest } from '@/lib/api/types';
import { placeOrder } from './api';
import {
  CheckoutFormSchema,
  emptyCheckoutForm,
  toFieldErrors,
  type CheckoutFieldErrors,
  type CheckoutFormState,
} from './checkout.schema';
import { rememberOrderToken } from './order-storage';
import { usePromoStore } from './promo-store';
import { useQuote } from './use-quote';

interface CheckoutFormProps {
  zones: string[];
  defaultTipBps: number;
  deliveryFeeCents: number;
  freeDeliveryThresholdCents: number;
}

const TIP_OPTIONS = [0, 1000, 1500, 2000] as const;

const DELIVERY_WINDOWS = [
  'Today · 4:00–5:00 PM',
  'Today · 5:00–6:00 PM',
  'Today · 6:00–7:00 PM',
  'Today · 7:00–8:00 PM',
  'Tomorrow · 11:00 AM–12:00 PM',
] as const;

export function CheckoutForm({
  zones,
  defaultTipBps,
  deliveryFeeCents,
  freeDeliveryThresholdCents,
}: CheckoutFormProps) {
  const router = useRouter();
  const hydrated = useHydrated();

  const items = useCartItems();
  const snapshotSubtotal = useCartStore(cartSubtotalCents);
  const clearCart = useCartStore((s) => s.clear);

  const code = usePromoStore((s) => s.code);
  const clearPromo = usePromoStore((s) => s.clear);

  const [form, setForm] = useState<CheckoutFormState>(() =>
    emptyCheckoutForm(zones[0] ?? 'Minneapolis', defaultTipBps),
  );
  const [errors, setErrors] = useState<CheckoutFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // An empty cart has nothing to check out — send the shopper back.
  useEffect(() => {
    if (hydrated && items.length === 0 && !submitting) {
      router.replace('/cart');
    }
  }, [hydrated, items.length, submitting, router]);

  const lineInputs = useMemo(
    () => items.map((i) => ({ productId: i.productId, quantity: i.qty })),
    [items],
  );
  const tipCents = Math.round((snapshotSubtotal * form.tipBps) / 10_000);
  const { quote } = useQuote({ items: lineInputs, promoCode: code, tipCents, enabled: hydrated });

  const totals = quote?.totals ?? null;
  const subtotal = totals?.subtotalCents ?? snapshotSubtotal;
  const discount = totals?.discountCents ?? 0;
  const deliveryFee = totals?.deliveryFeeCents ?? (subtotal >= freeDeliveryThresholdCents ? 0 : deliveryFeeCents);
  const tax = totals?.taxCents ?? 0;
  const tip = totals?.tipCents ?? tipCents;
  const total = totals?.totalCents ?? subtotal + deliveryFee + tax + tip;

  const set = <K extends keyof CheckoutFormState>(key: K, value: CheckoutFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async () => {
    setSubmitError(null);
    const parsed = CheckoutFormSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors = toFieldErrors(parsed.error);
      setErrors(fieldErrors);
      const first = document.querySelector<HTMLElement>('[data-error="true"]');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const data = parsed.data;
    const payload: CreateOrderRequest = {
      items: lineInputs,
      contact: { name: data.name, phone: data.phone, email: data.email },
      address: {
        street: data.street,
        ...(data.apt ? { apt: data.apt } : {}),
        city: data.city,
        zip: data.zip,
        ...(data.notes ? { notes: data.notes } : {}),
      },
      fulfillment: {
        type: data.when,
        ...(data.when === 'SCHEDULED' ? { scheduledWindow: data.window } : {}),
      },
      payment: { method: data.payment },
      tipCents,
      ...(code ? { promoCode: code } : {}),
      idVerified: true,
    };

    setSubmitting(true);
    try {
      const result = await placeOrder(payload);
      rememberOrderToken(result.order.orderNumber, result.trackingToken);
      clearCart();
      clearPromo();
      router.push(`/order/${result.order.orderNumber}`);
    } catch (err) {
      setSubmitting(false);
      setSubmitError(
        err instanceof ApiError ? err.message : 'Something went wrong placing your order. Please try again.',
      );
    }
  };

  if (!hydrated || items.length === 0) {
    return <div className="empty" aria-hidden="true" style={{ minHeight: 240 }} />;
  }

  const fieldError = (key: keyof CheckoutFormState) =>
    errors[key] ? (
      <span className="field__err" role="alert">
        {errors[key]}
      </span>
    ) : null;

  return (
    <div className="checkout">
      <div style={{ display: 'grid', gap: 22 }}>
        {/* Delivery details */}
        <section className="formcard">
          <h3>Delivery details</h3>
          <div className="formgrid">
            <div className="duo">
              <div className="field" data-error={Boolean(errors.name)}>
                <label htmlFor="co-name">Full name</label>
                <input
                  id="co-name"
                  className="input"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Alex Johnson"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                />
                {fieldError('name')}
              </div>
              <div className="field" data-error={Boolean(errors.phone)}>
                <label htmlFor="co-phone">Phone</label>
                <input
                  id="co-phone"
                  className="input"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="(612) 555-0199"
                  inputMode="tel"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                />
                {fieldError('phone')}
              </div>
            </div>
            <div className="field" data-error={Boolean(errors.email)}>
              <label htmlFor="co-email">Email</label>
              <input
                id="co-email"
                className="input"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="you@email.com"
                inputMode="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
              {fieldError('email')}
            </div>
            <div className="field" data-error={Boolean(errors.street)}>
              <label htmlFor="co-street">Street address</label>
              <input
                id="co-street"
                className="input"
                value={form.street}
                onChange={(e) => set('street', e.target.value)}
                placeholder="123 Nicollet Ave"
                autoComplete="address-line1"
                aria-invalid={Boolean(errors.street)}
              />
              {fieldError('street')}
            </div>
            <div className="duo">
              <div className="field">
                <label htmlFor="co-apt">
                  Apt / unit <span className="muted" style={{ fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  id="co-apt"
                  className="input"
                  value={form.apt}
                  onChange={(e) => set('apt', e.target.value)}
                  placeholder="Apt 4B"
                  autoComplete="address-line2"
                />
              </div>
              <div className="field" data-error={Boolean(errors.city)}>
                <label htmlFor="co-city">City</label>
                <select
                  id="co-city"
                  className="select"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  aria-invalid={Boolean(errors.city)}
                >
                  {zones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
                {fieldError('city')}
              </div>
            </div>
            <div className="field" data-error={Boolean(errors.zip)}>
              <label htmlFor="co-zip">ZIP code</label>
              <input
                id="co-zip"
                className="input"
                value={form.zip}
                onChange={(e) => set('zip', e.target.value)}
                placeholder="55401"
                inputMode="numeric"
                autoComplete="postal-code"
                aria-invalid={Boolean(errors.zip)}
                style={{ maxWidth: 200 }}
              />
              {fieldError('zip')}
            </div>
            <div className="field">
              <label htmlFor="co-notes">
                Delivery notes <span className="muted" style={{ fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                id="co-notes"
                className="input"
                rows={2}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Gate code, buzzer, where to leave it…"
              />
            </div>
          </div>
          <div className="infonote" style={{ marginTop: 16 }}>
            <MapPin className="ic" aria-hidden />
            <span>
              We deliver across the <b>Twin Cities metro</b>. You&apos;ll get live tracking once a driver
              is assigned.
            </span>
          </div>
        </section>

        {/* Delivery time */}
        <section className="formcard">
          <h3>Delivery time</h3>
          <div className="radio-row">
            <label className={`radio-card${form.when === 'ASAP' ? ' is-active' : ''}`}>
              <input
                type="radio"
                name="when"
                checked={form.when === 'ASAP'}
                onChange={() => set('when', 'ASAP')}
              />
              <Zap aria-hidden style={{ color: 'var(--green-700)' }} />
              <span style={{ flex: 1 }}>
                <b>Deliver ASAP</b>
                <span className="muted" style={{ display: 'block', fontSize: '.88rem' }}>
                  Estimated arrival in 60–90 minutes
                </span>
              </span>
              <span className="badge badge--new">Fastest</span>
            </label>
            <label className={`radio-card${form.when === 'SCHEDULED' ? ' is-active' : ''}`}>
              <input
                type="radio"
                name="when"
                checked={form.when === 'SCHEDULED'}
                onChange={() => set('when', 'SCHEDULED')}
              />
              <Clock aria-hidden style={{ color: 'var(--green-700)' }} />
              <span style={{ flex: 1 }}>
                <b>Schedule for later</b>
                <span className="muted" style={{ display: 'block', fontSize: '.88rem' }}>
                  Pick a 1-hour delivery window
                </span>
              </span>
            </label>
          </div>
          {form.when === 'SCHEDULED' && (
            <div className="field" data-error={Boolean(errors.window)} style={{ marginTop: 12 }}>
              <label htmlFor="co-window">Delivery window</label>
              <select
                id="co-window"
                className="select"
                value={form.window}
                onChange={(e) => set('window', e.target.value)}
                aria-invalid={Boolean(errors.window)}
              >
                <option value="">Select a window…</option>
                {DELIVERY_WINDOWS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              {fieldError('window')}
            </div>
          )}
        </section>

        {/* ID & payment */}
        <section className="formcard">
          <h3>ID &amp; payment</h3>
          <p className="muted" style={{ fontSize: '.92rem', marginTop: -8, marginBottom: 14 }}>
            Minnesota law requires a valid 21+ ID at the door.
          </p>

          <div className="idbox">
            <ShieldCheck className="ic" aria-hidden />
            <b>Have your ID ready</b>
            <span>Your driver will scan a government-issued ID to verify you&apos;re 21+.</span>
          </div>

          <label
            className={`consent${form.idVerified ? ' is-active' : ''}`}
            data-error={Boolean(errors.idVerified)}
            style={{ margin: '16px 0 20px' }}
          >
            <input
              type="checkbox"
              checked={form.idVerified}
              onChange={(e) => set('idVerified', e.target.checked)}
              aria-invalid={Boolean(errors.idVerified)}
            />
            <span>
              <b style={{ fontFamily: 'var(--font-display)' }}>I confirm I&apos;m 21 or older</b>
              <span className="muted" style={{ display: 'block', fontSize: '.88rem' }}>
                and will present a valid ID upon delivery.
              </span>
            </span>
          </label>
          {fieldError('idVerified')}

          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', margin: '4px 0 12px' }}>
            Payment method
          </h4>
          <div className="radio-row">
            <label className={`radio-card${form.payment === 'CASH' ? ' is-active' : ''}`}>
              <input
                type="radio"
                name="pay"
                checked={form.payment === 'CASH'}
                onChange={() => set('payment', 'CASH')}
              />
              <Banknote aria-hidden style={{ color: 'var(--green-700)' }} />
              <span style={{ flex: 1 }}>
                <b>Cash on delivery</b>
                <span className="muted" style={{ display: 'block', fontSize: '.88rem' }}>
                  Pay your driver in cash at the door
                </span>
              </span>
            </label>
            <label className={`radio-card${form.payment === 'DEBIT' ? ' is-active' : ''}`}>
              <input
                type="radio"
                name="pay"
                checked={form.payment === 'DEBIT'}
                onChange={() => set('payment', 'DEBIT')}
              />
              <CreditCard aria-hidden style={{ color: 'var(--green-700)' }} />
              <span style={{ flex: 1 }}>
                <b>Debit at the door</b>
                <span className="muted" style={{ display: 'block', fontSize: '.88rem' }}>
                  Driver brings a card reader (debit only)
                </span>
              </span>
            </label>
          </div>

          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', margin: '20px 0 10px' }}>
            Tip your driver
          </h4>
          <div className="tips">
            {TIP_OPTIONS.map((bps) => (
              <button
                key={bps}
                type="button"
                className={`tip${form.tipBps === bps ? ' sel' : ''}`}
                onClick={() => set('tipBps', bps)}
              >
                {bps === 0 ? 'None' : `${bps / 100}%`}
              </button>
            ))}
          </div>
        </section>
      </div>

      <aside className="summary">
        <h3>Your order</h3>
        <div style={{ maxHeight: 260, overflowY: 'auto', marginInline: -4, paddingInline: 4 }}>
          {items.map((i) => (
            <div className="sum-line" key={i.productId}>
              <span className="sum-line__media">
                <ProductMedia src={i.image} alt={i.name} sizes="44px" />
              </span>
              <div>
                <div className="nm">{i.name}</div>
                <div className="qx">
                  Qty {i.qty} · {i.size}
                </div>
              </div>
              <b>{money(i.priceCents * i.qty)}</b>
            </div>
          ))}
        </div>

        <hr className="divider" style={{ margin: '12px 0' }} />

        <div className="summary-row">
          <span>Subtotal</span>
          <b>{money(subtotal)}</b>
        </div>
        {discount > 0 && (
          <div className="summary-row" style={{ color: 'var(--green-700)' }}>
            <span>Discount{code ? ` (${code.toUpperCase()})` : ''}</span>
            <b>−{money(discount)}</b>
          </div>
        )}
        <div className="summary-row">
          <span>Delivery</span>
          <b>{deliveryFee === 0 ? 'FREE' : money(deliveryFee)}</b>
        </div>
        <div className="summary-row">
          <span>Driver tip{form.tipBps > 0 ? ` (${form.tipBps / 100}%)` : ''}</span>
          <b>{money(tip)}</b>
        </div>
        <div className="summary-row muted">
          <span>Estimated tax</span>
          <span>{money(tax)}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>{money(total)}</span>
        </div>

        {submitError && (
          <div className="infonote infonote--warn" style={{ marginTop: 14 }} role="alert">
            <span>{submitError}</span>
          </div>
        )}

        <button
          type="button"
          className="btn btn--lg btn--block"
          style={{ marginTop: 16 }}
          onClick={() => void submit()}
          disabled={submitting}
        >
          <Truck aria-hidden /> {submitting ? 'Placing order…' : `Place order · ${money(total)}`}
        </button>
        <Link className="btn btn--ghost btn--block btn--sm" href="/cart" style={{ marginTop: 8 }}>
          <ChevronLeft aria-hidden /> Back to cart
        </Link>
        <p className="muted center" style={{ fontSize: '.78rem', marginTop: 12 }}>
          By placing this order you confirm you&apos;re 21+ and agree to our Terms.
        </p>
      </aside>
    </div>
  );
}
