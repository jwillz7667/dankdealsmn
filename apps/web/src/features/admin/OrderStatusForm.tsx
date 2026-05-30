'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { updateOrderStatusAction, assignDriverAction } from './actions';
import { statusLabel } from '@/lib/format';
import type { OrderStatus } from '@/lib/api/types';

const STATUS_OPTIONS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

interface OrderStatusFormProps {
  orderNumber: string;
  currentStatus: OrderStatus;
  currentDriver: string | null;
}

export function OrderStatusForm({ orderNumber, currentStatus, currentDriver }: OrderStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [message, setMessage] = useState('');
  const [driverId, setDriverId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submitStatus(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setOk(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderNumber, {
        status,
        message: message.trim() || undefined,
      });
      if (result.ok) {
        setMessage('');
        setOk('Order status updated.');
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function assign(id: string | null) {
    setError(null);
    setOk(null);
    startTransition(async () => {
      const result = await assignDriverAction(orderNumber, id);
      if (result.ok) {
        setDriverId('');
        setOk(id ? 'Driver assigned.' : 'Driver unassigned.');
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="statusform">
      {error && (
        <p className="formerror" role="alert">
          {error}
        </p>
      )}
      {ok && (
        <p className="formok" role="status">
          {ok}
        </p>
      )}

      <form className="statusform" onSubmit={submitStatus}>
        <div className="field">
          <label htmlFor="os-status">Status</label>
          <select
            id="os-status"
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="os-message">Customer note (optional)</label>
          <textarea
            id="os-message"
            className="input"
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={280}
            placeholder="Appears on the customer's tracking timeline"
          />
        </div>
        <button type="submit" className="btn" disabled={pending}>
          {pending && <Loader2 className="ic spin" aria-hidden />}
          Update status
        </button>
      </form>

      <hr className="divider" />

      <div className="field">
        <label htmlFor="os-driver">Driver assignment</label>
        <p className="fieldhint" style={{ marginBottom: 4 }}>
          {currentDriver ? `Currently assigned to ${currentDriver}.` : 'No driver assigned yet.'}
        </p>
        <div className="row gap-8 wrap-flow">
          <input
            id="os-driver"
            className="input"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            placeholder="Driver ID"
            style={{ flex: 1, minWidth: 160 }}
          />
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => assign(driverId.trim() || null)}
            disabled={pending || driverId.trim() === ''}
          >
            Assign
          </button>
          {currentDriver && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => assign(null)}
              disabled={pending}
            >
              Unassign
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
