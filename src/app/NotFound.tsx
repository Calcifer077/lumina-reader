import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Resource Not Found</h2>
      <p>Could not find requested page.</p>
      <Link href="/library">Go back to library</Link>
    </main>
  );
}
