"use client";

import Link from "next/link";

export default function Error() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">Something Went Wrong</h1>
      <p className="mb-2 text-gray-500">
        An error has occurred. Please try again later.
      </p>
      <Link href="/" className="text-blue-500 underline underline-offset-2">
        Go Home
      </Link>
    </div>
  );
}
