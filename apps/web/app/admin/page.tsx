export default function AdminHome() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="text-gray-600">Survey builder skeleton. Full builder UI will be implemented in subsequent steps.</p>
      <ul className="list-disc list-inside text-gray-700">
        <li>Create survey</li>
        <li>Add basic question types</li>
        <li>Set required and visibility rules</li>
        <li>Preview and publish</li>
      </ul>
    </main>
  )
}