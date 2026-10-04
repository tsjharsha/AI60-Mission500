import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-32">
      <h1 className="text-4xl">This page is not on the workbench.</h1>
      <p className="mt-5 text-zinc-400">
        Return home to find a project or register directly.
      </p>
      <Link className="action-primary mt-7" href="/">
        Back to AI60
      </Link>
    </div>
  );
}
