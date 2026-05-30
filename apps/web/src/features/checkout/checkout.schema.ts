import { z } from 'zod';

/**
 * Client-side mirror of the API's CreateOrderSchema, used for inline field
 * validation and good UX. The API re-validates everything — this is a
 * convenience boundary, not the source of truth.
 */
export const CheckoutFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter your full name').max(120),
    phone: z.string().trim().min(7, 'Enter a valid phone number').max(32),
    email: z.string().trim().email('Enter a valid email'),
    street: z.string().trim().min(1, 'Enter your street address').max(160),
    apt: z.string().trim().max(60),
    city: z.string().trim().min(1, 'Choose your city').max(80),
    zip: z
      .string()
      .trim()
      .regex(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code'),
    notes: z.string().trim().max(500),
    when: z.enum(['ASAP', 'SCHEDULED']),
    window: z.string().trim().max(80),
    payment: z.enum(['CASH', 'DEBIT']),
    tipBps: z.number().int().min(0).max(10_000),
    idVerified: z.literal(true, {
      errorMap: () => ({ message: 'Please confirm you are 21 or older' }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.when === 'SCHEDULED' && !data.window) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['window'],
        message: 'Pick a delivery window',
      });
    }
  });

export type CheckoutForm = z.infer<typeof CheckoutFormSchema>;

/** Mutable form state. `idVerified` is a real boolean (the schema requires it be `true`). */
export interface CheckoutFormState {
  name: string;
  phone: string;
  email: string;
  street: string;
  apt: string;
  city: string;
  zip: string;
  notes: string;
  when: 'ASAP' | 'SCHEDULED';
  window: string;
  payment: 'CASH' | 'DEBIT';
  tipBps: number;
  idVerified: boolean;
}

export type CheckoutFieldErrors = Partial<Record<keyof CheckoutFormState, string>>;

export function emptyCheckoutForm(defaultCity: string, tipBps: number): CheckoutFormState {
  return {
    name: '',
    phone: '',
    email: '',
    street: '',
    apt: '',
    city: defaultCity,
    zip: '',
    notes: '',
    when: 'ASAP',
    window: '',
    payment: 'CASH',
    tipBps,
    idVerified: false,
  };
}

/** Flattens a ZodError into a `{ field: message }` map for inline display. */
export function toFieldErrors(error: z.ZodError): CheckoutFieldErrors {
  const out: CheckoutFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !(key in out)) {
      out[key as keyof CheckoutFormState] = issue.message;
    }
  }
  return out;
}
