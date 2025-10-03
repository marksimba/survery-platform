export default function ResponsesPage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Responses</h1>
      <p className="text-gray-600">Responses dashboard placeholder. CSV export available at /api/export/csv</p>
      <a className="underline text-blue-600" href="/api/export/csv">Download CSV</a>
    </main>
  )
}