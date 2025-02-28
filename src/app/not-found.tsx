import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">Page Not Found</h1>
      <p className="mb-2 text-stone-500">
        The page you are looking for does not exist.
      </p>
      <Link href="/" className="text-blue-500 underline underline-offset-2">
        Go Home
      </Link>
    </div>
  );
}
