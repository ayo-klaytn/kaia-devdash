export default function RepositoryPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div>
      <h1>Repository {id}</h1>
    </div>
  );
}