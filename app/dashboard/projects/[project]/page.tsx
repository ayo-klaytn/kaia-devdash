export default async function Page({
  params,
}: {
  params: Promise<{ project: string }>
}) {
  const { project } = await params
  return <div>{project}</div>
}
