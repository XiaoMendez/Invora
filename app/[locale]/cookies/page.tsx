import { StaticPageLayout } from "@/components/static-page-layout"

export const metadata = {
  title: "Politica de Cookies - INVORA",
  description: "Conoce como utilizamos las cookies en INVORA.",
}

export default function CookiesPage() {
  return (
    <StaticPageLayout 
      title="Politica de Cookies"
      subtitle="Conoce como utilizamos las cookies para mejorar tu experiencia en INVORA."
    >

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Que son las Cookies
          </h2>
          <p>
            Las cookies son pequenos archivos de texto que se almacenan en tu
            dispositivo cuando visitas un sitio web. Se utilizan para recordar
            tus preferencias y mejorar tu experiencia de navegacion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Cookies que Utilizamos
          </h2>
          <div className="flex flex-col gap-4">
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-foreground font-semibold mb-1">
                Cookie de Sesion
              </h3>
              <p className="text-sm">
                Nombre: <code className="text-primary">session</code> - Mantiene
                tu sesion activa mientras usas INVORA. Es una cookie esencial
                para el funcionamiento del servicio y se elimina al cerrar
                sesion o despues de 7 dias.
              </p>
            </div>
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-foreground font-semibold mb-1">
                Cookies de Analitica
              </h3>
              <p className="text-sm">
                Utilizamos Vercel Analytics para entender como se usa nuestra
                plataforma y mejorar el servicio. Estas cookies no recopilan
                informacion personal identificable.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Gestion de Cookies
          </h2>
          <p>
            Puedes configurar tu navegador para rechazar cookies o para
            alertarte cuando se envie una cookie. Sin embargo, la cookie de
            sesion es necesaria para usar INVORA, por lo que desactivarla
            impedira el acceso al dashboard.
          </p>
        </section>
      </div>
    </StaticPageLayout>
  )
}
