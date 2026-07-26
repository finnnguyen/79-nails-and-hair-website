import { createClient } from "@/lib/supabase/server";
import BookingStatusSelect from "@/components/admin/BookingStatusSelect";

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      "id, customer_name, customer_email, customer_phone, appointment_date, appointment_time, status, total_price, staff:staff_id(name), booking_services(service_name, price)"
    )
    .order("appointment_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm text-red-600">Failed to load bookings: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl text-foreground">Bookings</h1>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="py-2 pr-4 font-medium">Date &amp; Time</th>
              <th className="py-2 pr-4 font-medium">Customer</th>
              <th className="py-2 pr-4 font-medium">Contact</th>
              <th className="py-2 pr-4 font-medium">Staff</th>
              <th className="py-2 pr-4 font-medium">Services</th>
              <th className="py-2 pr-4 font-medium">Total</th>
              <th className="py-2 pr-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-border/70">
                <td className="whitespace-nowrap py-3 pr-4 text-foreground">
                  {b.appointment_date} · {b.appointment_time}
                </td>
                <td className="py-3 pr-4 text-foreground">{b.customer_name}</td>
                <td className="py-3 pr-4 text-muted">
                  {b.customer_phone && <div>{b.customer_phone}</div>}
                  {b.customer_email && <div>{b.customer_email}</div>}
                </td>
                <td className="py-3 pr-4 text-foreground">{b.staff?.name ?? "—"}</td>
                <td className="py-3 pr-4 text-muted">
                  {b.booking_services.map((s) => s.service_name).join(", ")}
                </td>
                <td className="py-3 pr-4 text-foreground">${b.total_price}</td>
                <td className="py-3 pr-4">
                  <BookingStatusSelect bookingId={b.id} status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {bookings.length === 0 && (
          <p className="mt-6 text-sm text-muted">No bookings yet.</p>
        )}
      </div>
    </div>
  );
}
