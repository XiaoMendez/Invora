import { StaticPageLayout } from "@/components/static-page-layout"

export default function SobreNosotrosPage() {
  return (
    <StaticPageLayout title="Sobre Nosotros">
      <div className="flex flex-col gap-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Nuestra Mision
          </h2>
          <p>
            En INVORA, creemos que las PYMEs costarricenses merecen
            herramientas de gestion de inventario tan potentes como las de las
            grandes empresas, pero sin la complejidad ni los costos elevados.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Que Hacemos
          </h2>
          <p>
            Desarrollamos un sistema de inventario inteligente disenado
            especificamente para las necesidades de las pequenas y medianas
            empresas en Costa Rica. Nuestra plataforma permite controlar el
            stock, registrar movimientos, gestionar proveedores y generar
            reportes de forma sencilla e intuitiva.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Por Que INVORA
          </h2>
          <p>
            El nombre INVORA combina las palabras &ldquo;Inventario&rdquo; e
            &ldquo;Innovacion&rdquo;. Nuestra vision es llevar la gestion de
            inventarios a otra dimension, haciendo que el proceso sea tan
            natural como mirar las estrellas. Cada detalle de nuestra
            plataforma esta disenado para simplificar tu dia a dia y darte el
            control total de tu negocio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Nuestros Valores
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-foreground font-semibold mb-2">Simplicidad</h3>
              <p className="text-sm">
                Tecnologia avanzada con una interfaz sencilla que cualquiera
                puede usar.
              </p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-foreground font-semibold mb-2">Confianza</h3>
              <p className="text-sm">
                La seguridad de tus datos es nuestra maxima prioridad.
              </p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-foreground font-semibold mb-2">Innovacion</h3>
              <p className="text-sm">
                Mejoramos constantemente para ofrecerte las mejores
                herramientas.
              </p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-foreground font-semibold mb-2">Compromiso Local</h3>
              <p className="text-sm">
                Disenado por y para PYMEs costarricenses, entendiendo sus
                necesidades reales.
              </p>
            </div>
          </div>
        </section>
      </div>
    </StaticPageLayout>
  )
}
