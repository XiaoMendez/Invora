import { StaticPageLayout } from "@/components/static-page-layout"

export default function TerminosPage() {
  return (
    <StaticPageLayout title="Terminos de Servicio">
      <p className="text-sm mb-8">Ultima actualizacion: 3 de marzo de 2026</p>

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            1. Aceptacion de Terminos
          </h2>
          <p>
            Al acceder y utilizar INVORA, aceptas estar sujeto a estos terminos
            de servicio. Si no estas de acuerdo con alguno de estos terminos, no
            debes utilizar nuestro servicio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            2. Descripcion del Servicio
          </h2>
          <p>
            INVORA es un sistema de gestion de inventario en la nube disenado
            para PYMEs. El servicio incluye herramientas para control de stock,
            registro de movimientos, gestion de proveedores y generacion de
            reportes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            3. Cuenta de Usuario
          </h2>
          <p>
            Eres responsable de mantener la confidencialidad de tu cuenta y
            contrasena. Debes notificarnos inmediatamente sobre cualquier uso no
            autorizado de tu cuenta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            4. Uso Aceptable
          </h2>
          <p>
            Te comprometes a utilizar INVORA unicamente para fines legales y de
            acuerdo con estos terminos. No debes usar el servicio para
            actividades ilegales o no autorizadas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            5. Propiedad Intelectual
          </h2>
          <p>
            Todo el contenido, diseno y tecnologia de INVORA es propiedad de la
            empresa y esta protegido por las leyes de propiedad intelectual de
            Costa Rica.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            6. Limitacion de Responsabilidad
          </h2>
          <p>
            INVORA no sera responsable por danos indirectos, incidentales o
            consecuentes que resulten del uso o la incapacidad de usar el
            servicio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            7. Contacto
          </h2>
          <p>
            Si tienes preguntas sobre estos terminos, contactanos a traves de
            nuestra pagina de contacto.
          </p>
        </section>
      </div>
    </StaticPageLayout>
  )
}
