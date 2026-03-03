import { StaticPageLayout } from "@/components/static-page-layout"

export default function PrivacidadPage() {
  return (
    <StaticPageLayout title="Politica de Privacidad">
      <p className="text-sm mb-8">Ultima actualizacion: 3 de marzo de 2026</p>

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            1. Informacion que Recopilamos
          </h2>
          <p>
            Recopilamos informacion que nos proporcionas directamente al crear
            una cuenta: nombre de la empresa, correo electronico y contrasena
            (almacenada de forma encriptada). Tambien recopilamos datos del
            inventario que registras en la plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            2. Uso de la Informacion
          </h2>
          <p>
            Utilizamos tu informacion para proporcionar y mejorar nuestro
            servicio, comunicarnos contigo sobre tu cuenta, y enviarte
            notificaciones relevantes sobre tu inventario.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            3. Proteccion de Datos
          </h2>
          <p>
            Implementamos medidas de seguridad tecnicas y organizativas para
            proteger tus datos contra acceso no autorizado, alteracion o
            destruccion. Las contrasenas se almacenan con encriptacion bcrypt y
            las sesiones se gestionan con tokens JWT.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            4. Compartir Informacion
          </h2>
          <p>
            No vendemos, alquilamos ni compartimos tu informacion personal con
            terceros, excepto cuando sea necesario para cumplir con la ley o
            proteger nuestros derechos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            5. Retencion de Datos
          </h2>
          <p>
            Mantenemos tus datos mientras tu cuenta este activa. Si deseas
            eliminar tu cuenta y toda la informacion asociada, puedes
            contactarnos a traves de nuestra pagina de soporte.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            6. Tus Derechos
          </h2>
          <p>
            Tienes derecho a acceder, corregir o eliminar tu informacion
            personal. Tambien puedes solicitar una copia de todos los datos que
            tenemos sobre ti. Contactanos para ejercer estos derechos.
          </p>
        </section>
      </div>
    </StaticPageLayout>
  )
}
