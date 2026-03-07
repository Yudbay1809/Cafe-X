export default function Loading() {
  return (
    <main className="loading-screen">
      <div className="loading-card">
        <div className="loading-title" />
        <div className="loading-bar" />
        <div className="loading-bar short" />
        <div className="loading-grid">
          <div className="loading-skel" />
          <div className="loading-skel" />
          <div className="loading-skel" />
          <div className="loading-skel" />
        </div>
      </div>
    </main>
  );
}
