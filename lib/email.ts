import "server-only";
import { Resend } from "resend";
import { BUSINESS } from "@/lib/business-info";

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend sandbox sender — swap for a verified domain address once one is added.
const FROM = "79 Nails & Hair <onboarding@resend.dev>";

export type BookingEmailInput = {
  customerName: string;
  customerEmail: string | null;
  staffName: string;
  date: string;
  time: string;
  services: { name: string; price: number }[];
  total: number;
};

function serviceListHtml(services: { name: string; price: number }[]) {
  return `<ul>${services.map((s) => `<li>${s.name} — $${s.price}</li>`).join("")}</ul>`;
}

/** Best-effort — a failed send should never fail the booking itself. */
export async function sendBookingEmails(input: BookingEmailInput) {
  const sends = [
    resend.emails.send({
      from: FROM,
      to: BUSINESS.notificationEmail,
      subject: `New booking: ${input.customerName} — ${input.date} ${input.time}`,
      html: `
        <h2>New booking request</h2>
        <p><strong>${input.customerName}</strong> requested an appointment with
        <strong>${input.staffName}</strong> on <strong>${input.date} at ${input.time}</strong>.</p>
        ${serviceListHtml(input.services)}
        <p>Total: $${input.total}</p>
        <p>Manage this booking in the admin dashboard.</p>
      `,
    }),
  ];

  if (input.customerEmail) {
    sends.push(
      resend.emails.send({
        from: FROM,
        to: input.customerEmail,
        subject: "We received your booking request — 79 Nails & Hair",
        html: `
          <h2>Thanks, ${input.customerName}!</h2>
          <p>We received your request for an appointment with <strong>${input.staffName}</strong>
          on <strong>${input.date} at ${input.time}</strong>. We'll reach out to confirm.</p>
          ${serviceListHtml(input.services)}
          <p>Total: $${input.total}</p>
          <p>${BUSINESS.address} &middot; ${BUSINESS.phone}</p>
        `,
      })
    );
  }

  // resend's SDK resolves to { data, error } rather than rejecting on
  // API-level failures (e.g. sandbox restrictions), so both cases need checking.
  const results = await Promise.allSettled(sends);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Booking email failed to send:", result.reason);
    } else if (result.value.error) {
      console.error("Booking email failed to send:", result.value.error);
    }
  }
}
