export default function UnauthorizedComponent() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Unauthorized</h1>
      <p className="text-sm text-gray-500">You need to sign in to view this page!</p>
    </div>
  )
}
