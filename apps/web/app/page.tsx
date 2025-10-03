export default function Home() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Survey Platform (MVP)</h1>
      <p className="text-gray-600">Admin builder and public runtime skeleton.</p>
      <div className="space-x-4">
        <a className="underline text-blue-600" href="/admin">Go to Admin</a>
        <a className="underline text-blue-600" href="/s/example">Open example survey</a>
      </div>
    </main>
  )
}
