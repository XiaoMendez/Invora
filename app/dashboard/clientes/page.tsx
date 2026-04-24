"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Users, Loader2, AlertTriangle, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ClientesPage() {
  const { data, error, isLoading } = useSWR("/api/clientes", fetcher)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nombre: "", apellido: "", correo: "", telefono: "" })

  const clientes = data?.clientes || []

  const handleSave = async () => {
    if (!form.nombre.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setForm({ nombre: "", apellido: "", correo: "", telefono: "" })
        mutate("/api/clientes")
      }
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (error || data?.error) return <div className="flex items-center justify-center min-h-[60vh]"><AlertTriangle className="h-8 w-8 text-amber-400" /></div>

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestiona tus clientes para registrar ventas.</p>
      </div>

      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2"><Plus className="h-4 w-4 text-primary" />Nuevo Cliente</CardTitle>
          <CardDescription>Completa los datos básicos del cliente.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="bg-secondary/50 border-border/30" />
            <Input placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className="bg-secondary/50 border-border/30" />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} className="bg-secondary/50 border-border/30" />
            <Input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="bg-secondary/50 border-border/30" />
          </div>
          <Button onClick={handleSave} disabled={saving || !form.nombre.trim()} className="w-fit">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Guardar Cliente
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Listado de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {clientes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay clientes registrados.</p>
            ) : clientes.map((c: { id: string; nombre: string; apellido?: string; correo?: string; telefono?: string }) => (
              <div key={c.id} className="rounded-md border border-border/30 p-3 text-sm">
                <p className="font-medium">{c.nombre} {c.apellido || ""}</p>
                <p className="text-muted-foreground">{c.correo || "Sin correo"} · {c.telefono || "Sin teléfono"}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
