// Weekly and monthly rules that add transactions on their own.
export default function RecurringPage() {
  return (
    <section className="recurring-page" aria-label="Recurring transactions">
      <p className="page-intro">
        These rules add a transaction every week or month. To create one, pick a repeat option when you add a
        transaction.
      </p>
    </section>
  );
}
