import { StaticPageLayout } from "@/components/static-page-layout"
import Link from "next/link"
import { Mail, MessageCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Soporte - INVORA",
  description: "Obtiene ayuda y soporte para tu cuenta de INVORA.",
}

export default function SoportePage() {
  return (
    <StaticPageLayout 
      title="Centro de Soporte"
      subtitle="Estamos aqui para ayudarte. Encuentra respuestas a tus preguntas o contacta a nuestro equipo."
    >

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="glass-card rounded-xl p-6 flex flex-col items-center text-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-foreground font-semibold">Email</h3>
          <p className="text-sm">
            Envianos un correo y te responderemos en menos de 24 horas.
          </p>
          <Link href="/contacto">
            <Button variant="outline" size="sm" className="border-border/30 text-foreground">
              Contactar
            </Button>
          </Link>
        </div>
        <div className="glass-card rounded-xl p-6 flex flex-col items-center text-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-foreground font-semibold">Chat</h3>
          <p className="text-sm">
            Chatea con nuestro equipo durante horario laboral para soporte
            inmediato.
          </p>
          <Link href="/contacto">
            <Button variant="outline" size="sm" className="border-border/30 text-foreground">
              Iniciar Chat
            </Button>
          </Link>
        </div>
        <div className="glass-card rounded-xl p-6 flex flex-col items-center text-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-foreground font-semibold">Horario</h3>
          <p className="text-sm">
            Lunes a Viernes de 8:00 AM a 5:00 PM (hora de Costa Rica).
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Preguntas Frecuentes
        </h2>
        <div className="flex flex-col gap-4">
          {[
            {
              q: "Como agrego un nuevo producto?",
              a: "Ve a la seccion de Productos en el dashboard, haz clic en 'Agregar Producto' y completa la informacion requerida: nombre, SKU, precios y stock minimo.",
            },
            {
              q: "Que pasa cuando un producto llega al stock minimo?",
              a: "INVORA te mostrara una alerta en el dashboard y en la seccion de Alertas para que puedas reabastecer a tiempo.",
            },
            {
              q: "Puedo exportar mis reportes?",
              a: "Si, puedes exportar los reportes de inventario en formato CSV desde la seccion de Reportes.",
            },
            {
              q: "Como registro una entrada de mercaderia?",
              a: "En la seccion de Movimientos, selecciona 'Nueva Entrada', elige el producto y la cantidad. El stock se actualizara automaticamente.",
            },
          ].map((faq) => (
            <div key={faq.q} className="glass-card rounded-xl p-6">
              <h3 className="text-foreground font-semibold mb-2">{faq.q}</h3>
              <p className="text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </StaticPageLayout>
  )
}
