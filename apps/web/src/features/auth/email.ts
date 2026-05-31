import type { EmailConfig } from 'next-auth/providers/email';
import { SITE } from '@/lib/site';

type VerificationParams = Parameters<NonNullable<EmailConfig['sendVerificationRequest']>>[0];

/** Plain-text fallback for clients that don't render HTML. */
function textBody(url: string): string {
  return [
    `Sign in to ${SITE.name}`,
    '',
    'Click the link below to sign in. It expires in 24 hours and can only be used once.',
    url,
    '',
    'If you did not request this email, you can safely ignore it.',
    `${SITE.name} — must be 21+. License #${SITE.licenseNumber}.`,
  ].join('\n');
}

/** Branded, inline-styled HTML (email clients ignore <style>/external CSS). */
function htmlBody(url: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f6f8f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0c0f0b;">
    <div style="display:none;max-height:0;overflow:hidden;">Your secure sign-in link for ${SITE.name}.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e3e8dd;border-radius:16px;overflow:hidden;">
            <tr>
              <td align="center" style="background:#ffffff;padding:24px 28px;border-bottom:1px solid #eef1e9;">
                <img src="${SITE.url}/brand/logo.png" alt="${SITE.name}" width="220" height="23" style="display:block;width:220px;height:auto;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px 8px;">
                <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;">Sign in to ${SITE.name}</h1>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#4a5346;">
                  Tap the button below to securely sign in. This link expires in 24 hours and can be used once.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="border-radius:12px;background:#3b9322;">
                      <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">
                        Sign in
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#6b7363;">
                  Or paste this link into your browser:
                </p>
                <p style="margin:0 0 24px;font-size:13px;line-height:1.5;word-break:break-all;">
                  <a href="${url}" style="color:#296914;">${url}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px 28px;border-top:1px solid #eef1e9;">
                <p style="margin:0;font-size:12px;line-height:1.5;color:#8a917f;">
                  If you didn't request this email, you can safely ignore it. Must be 21+. License #${SITE.licenseNumber}.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Sends the magic-link email through Resend's REST API. Used by the Resend
 * provider; throws on a non-2xx so Auth.js surfaces the failure to the user.
 */
export async function sendMagicLinkEmail(params: VerificationParams): Promise<void> {
  const { identifier: to, url, provider } = params;
  const apiKey = provider.apiKey ?? process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Resend API key is not configured');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: provider.from,
      to,
      subject: `Sign in to ${SITE.name}`,
      html: htmlBody(url),
      text: textBody(url),
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Resend error (${res.status}): ${detail}`);
  }
}
