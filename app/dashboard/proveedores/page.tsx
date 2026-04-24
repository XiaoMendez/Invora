"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Truck, Loader2, AlertTriangle, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProveedoresPage() {
  const { data, error, isLoading } = useSWR("/api/proveedores", fetcher)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nombre: "", correo: "", telefono: "" })

  const proveedores = data?.proveedores || []

  const handleSave = async () => {
    if (!form.nombre.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setForm({ nombre: "", correo: "", telefono: "" })
        mutate("/api/proveedores")
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
        <h1 className="text-2xl font-bold text-foreground">Proveedores</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestiona tus proveedores para registrar compras.</p>
      </div>

      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2"><Plus className="h-4 w-4 text-primary" />Nuevo Proveedor</CardTitle>
          <CardDescription>Completa los datos básicos del proveedor.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="bg-secondary/50 border-border/30" />
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} className="bg-secondary/50 border-border/30" />
            <Input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="bg-secondary/50 border-border/30" />
          </div>
          <Button onClick={handleSave} disabled={saving || !form.nombre.trim()} className="w-fit">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Guardar Proveedor
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2"><Truck className="h-4 w-4 text-primary" />Listado de Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {proveedores.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay proveedores registrados.</p>
            ) : proveedores.map((p: { id: string; nombre: string; correo?: string; telefono?: string }) => (
              <div key={p.id} className="rounded-md border border-border/30 p-3 text-sm">
                <p className="font-medium">{p.nombre}</p>
                <p className="text-muted-foreground">{p.correo || "Sin correo"} · {p.telefono || "Sin teléfono"}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
