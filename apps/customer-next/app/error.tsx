'use client';

export default function Error({ error }: { error: Error }) {
  return (
    <main>
      <div className="card">
        <h1>Terjadi Gangguan</h1>
        <p className="small">{error.message}</p>
      </div>
    </main>
  );
}
