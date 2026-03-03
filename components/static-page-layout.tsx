import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export function StaticPageLayout({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 py-4">
        <div className="mx-auto max-w-4xl px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/invora-logo.png"
              alt="INVORA Logo"
              width={360}
              height={120}
              className="h-14 w-auto"
              priority
            />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-balance">{title}</h1>
        <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
          {children}
        </div>
      </main>
      <footer className="border-t border-border/30 py-8">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 INVORA. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
