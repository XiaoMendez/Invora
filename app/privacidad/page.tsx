import { StaticFooterLayout } from "@/components/static-footer-layout"

export const metadata = {
  title: "Política de Privacidad - INVORA",
  description: "Conoce cómo protegemos y manejamos tus datos personales en INVORA.",
}

export default function PrivacidadPage() {
  return (
    <StaticFooterLayout
      title="Política de Privacidad"
      subtitle="Tu privacidad es importante para nosotros. Aquí te explicamos cómo protegemos tus datos."
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            1. Información que Recopilamos
          </h2>
          <p className="text-muted-foreground mb-3">
            En INVORA recopilamos diferentes tipos de información para proporcionar y mejorar nuestros servicios:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Información de cuenta: nombre de empresa, correo electrónico, teléfono</li>
            <li>Datos de inventario: productos, categorías, proveedores, clientes</li>
            <li>Información de transacciones: ventas, compras, movimientos de inventario</li>
            <li>Datos técnicos: dirección IP, tipo de navegador, sistema operativo</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            2. Cómo Utilizamos tu Información
          </h2>
          <p className="text-muted-foreground mb-3">
            Utilizamos la información recopilada para:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Proporcionar, mantener y mejorar nuestros servicios</li>
            <li>Procesar transacciones y enviar confirmaciones</li>
            <li>Enviar actualizaciones técnicas y anuncios de seguridad</li>
            <li>Responder a tus consultas y proporcionar soporte al cliente</li>
            <li>Cumplir con obligaciones legales y regulatorias</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            3. Seguridad de Datos
          </h2>
          <p className="text-muted-foreground mb-3">
            Implementamos medidas de seguridad técnicas y organizativas avanzadas:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Encriptación SSL/TLS para transmisión de datos</li>
            <li>Autenticación con Supabase usando tecnología segura de OAuth</li>
            <li>Acceso restringido a información sensible con Row Level Security</li>
            <li>Auditorías de seguridad regulares</li>
            <li>Cumplimiento con estándares internacionales de seguridad</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            4. Compartir Información
          </h2>
          <p className="text-muted-foreground">
            No compartimos tus datos personales con terceros sin tu consentimiento explícito, excepto cuando sea requerido por la ley.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            5. Retención de Datos
          </h2>
          <p className="text-muted-foreground">
            Conservamos tus datos mientras tu cuenta sea activa. Puedes solicitar la eliminación de tu cuenta en cualquier momento.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            6. Tus Derechos
          </h2>
          <p className="text-muted-foreground mb-3">
            Tienes derecho a:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Acceder a tus datos personales</li>
            <li>Corregir o actualizar información inexacta</li>
            <li>Solicitar la eliminación de tus datos</li>
            <li>Retirar tu consentimiento en cualquier momento</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            7. Contacto
          </h2>
          <p className="text-muted-foreground">
            Si tienes preguntas sobre esta política de privacidad, contáctanos en privacidad@invora.io
          </p>
        </section>

        <p className="text-sm text-muted-foreground italic pt-6 border-t border-border/20">
          Última actualización: Marzo 2024
        </p>
      </div>
    </StaticFooterLayout>
  )
}
