// app/page.tsx or src/app/page.tsx
import Image from "next/image"

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 items-center text-center max-w-2xl">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to <span className="text-primary">Kanchen Academy</span>
        </h1>

        <p className="text-muted-foreground text-sm">
          Start your spaced repetition journey with a modern web-powered flashcard tool.
        </p>

        <ol className="list-decimal list-inside text-left text-sm">
          <li>Edit <code className="bg-black/5 dark:bg-white/10 rounded px-1">src/app/page.tsx</code> to get started.</li>
          <li>Use Tailwind and Next.js features instantly.</li>
          <li>Deploy to Vercel with 1 click.</li>
        </ol>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <a
            className="px-4 py-2 text-sm font-medium rounded-full bg-foreground text-background hover:bg-muted transition"
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            Deploy to Vercel
          </a>

          <a
            className="px-4 py-2 text-sm font-medium rounded-full border dark:border-white/20 border-black/10 hover:bg-muted transition"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the Docs
          </a>
        </div>
      </main>

      <footer className="text-xs text-muted-foreground mt-16">
        © {new Date().getFullYear()} Kanchen Academy — Built with Next.js
      </footer>
    </div>
  )
}
