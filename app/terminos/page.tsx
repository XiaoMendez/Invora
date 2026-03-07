import { StaticFooterLayout } from "@/components/static-footer-layout"

export const metadata = {
  title: "Términos de Servicio - INVORA",
  description: "Lee nuestros términos de servicio y condiciones de uso de INVORA.",
}

export default function TerminosPage() {
  return (
    <StaticFooterLayout
      title="Términos de Servicio"
      subtitle="Por favor, lee atentamente estos términos antes de usar INVORA."
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            1. Aceptación de Términos
          </h2>
          <p className="text-muted-foreground">
            Al acceder y utilizar INVORA, aceptas estar sujeto a estos términos de servicio y todas las leyes y regulaciones aplicables. Si no estás de acuerdo con alguno de estos términos, se te prohíbe utilizar o acceder a este servicio.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            2. Descripción del Servicio
          </h2>
          <p className="text-muted-foreground mb-3">
            INVORA es un sistema de gestión de inventario en la nube diseñado para PYMEs en Costa Rica. El servicio incluye:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Control de stock y movimientos de inventario</li>
            <li>Gestión de proveedores y clientes</li>
            <li>Registro de ventas y compras</li>
            <li>Reportes y análisis de datos</li>
            <li>Funcionalidades administrativas y de usuario</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            3. Cuenta de Usuario
          </h2>
          <p className="text-muted-foreground mb-3">
            Cuando creas una cuenta en INVORA:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Eres responsable de mantener la confidencialidad de tu cuenta y contraseña</li>
            <li>Aceptas todas las actividades que ocurren bajo tu cuenta</li>
            <li>Debes notificarnos inmediatamente sobre cualquier uso no autorizado</li>
            <li>Garantizas que la información proporcionada es precisa y completa</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            4. Uso Aceptable
          </h2>
          <p className="text-muted-foreground mb-3">
            Te comprometes a utilizar INVORA únicamente para propósitos legales y de conformidad con estos términos. No debes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Usar el servicio para actividades ilegales o no autorizadas</li>
            <li>Intentar acceder sin autorización a sistemas o redes</li>
            <li>Interferir con la función o seguridad del servicio</li>
            <li>Transmitir contenido ofensivo, difamatorio u obsceno</li>
            <li>Violar derechos de privacidad o propiedad intelectual de terceros</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            5. Propiedad Intelectual
          </h2>
          <p className="text-muted-foreground">
            Todo el contenido, diseño, funcionalidad y tecnología de INVORA es propiedad exclusiva de INVORA y está protegido por las leyes de propiedad intelectual de Costa Rica e internacionales. No se te otorga ningún derecho sobre estos elementos, excepto para usar el servicio según estos términos.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            6. Datos del Usuario
          </h2>
          <p className="text-muted-foreground mb-3">
            Los datos que ingresas en INVORA (inventario, transacciones, clientes, etc.) son tu propiedad. Tú eres responsable de:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Mantener copias de seguridad de tus datos</li>
            <li>Verificar la precisión de la información ingresada</li>
            <li>Cumplir con leyes fiscales y regulatorias locales</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            7. Limitación de Responsabilidad
          </h2>
          <p className="text-muted-foreground">
            INVORA se proporciona "tal como está" sin garantías de ningún tipo. INVORA no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos que resulten del uso o la incapacidad de usar el servicio, incluso si se ha advertido de la posibilidad de tales daños.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            8. Indemnificación
          </h2>
          <p className="text-muted-foreground">
            Aceptas indemnizar y mantener indemne a INVORA de cualquier reclamación, demanda, pérdida, daño o gasto (incluyendo honorarios de abogados) que surja de tu uso del servicio o violación de estos términos.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            9. Terminación
          </h2>
          <p className="text-muted-foreground">
            INVORA se reserva el derecho de suspender o terminar tu cuenta si violas estos términos o participas en conductas que dañen el servicio. Al terminar, tus derechos de usar INVORA cesarán inmediatamente.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            10. Cambios a los Términos
          </h2>
          <p className="text-muted-foreground">
            INVORA se reserva el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente. Tu uso continuado del servicio constituye aceptación de los términos modificados.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            11. Ley Aplicable
          </h2>
          <p className="text-muted-foreground">
            Estos términos se regirán por las leyes de Costa Rica, sin considerar sus conflictos de disposiciones legales.
          </p>
        </section>

        <p className="text-sm text-muted-foreground italic pt-6 border-t border-border/20">
          Última actualización: Marzo 2024
        </p>
      </div>
    </StaticFooterLayout>
  )
}
