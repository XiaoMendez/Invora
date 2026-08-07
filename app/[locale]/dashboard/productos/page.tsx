"use client"

import { useState, useRef, useEffect } from "react"
import useSWR, { mutate } from "swr"
import {
  Package,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  ChevronDown,
  Check,
  PenLine,
  Truck,
  Home,
  X,
  Paperclip,
  Upload,
  FileText,
  ExternalLink,
  FileSpreadsheet,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/useTranslation"
import { ImportExcelDialog } from "@/components/productos/import-excel-dialog"

interface Categoria {
  id: string
  nombre: string
}

interface Producto {
  id: string
  nombre: string
  sku: string | null
  stock: number
  stock_minimo: number
  precio_costo: number
  precio_venta: number
  activo: boolean
  id_categoria: string | null
  categoria: Categoria | null
  es_propio: boolean
}

interface Proveedor {
  id: string
  nombre: string
  correo: string | null
}

interface ProductoProveedor {
  id: string
  id_proveedor: string
  precio_compra: number | null
  es_principal: boolean
  proveedor: Proveedor
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function getStatusInfo(stock: number, stock_minimo: number, t: (k: string) => string) {
  if (stock === 0) return { label: t("common.outOfStock"), className: "bg-red-500/10 text-red-400 border-red-500/20" }
  if (stock <= stock_minimo) return { label: t("common.lowStock"), className: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
  return { label: t("common.available"), className: "bg-green-500/10 text-green-400 border-green-500/20" }
}

// Combobox de categoría con opción de escribir una propia
function CategoriaCombobox({
  categorias,
  value,
  onChange,
  onCategoriaCreada,
  t,
}: {
  categorias: Categoria[]
  value: string
  onChange: (val: string) => void
  onCategoriaCreada: (cat: Categoria) => void
  t: (key: string) => string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [creando, setCreando] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = categorias.find((c) => c.id === value)
  const filtradas = categorias.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  )
  const searchTrimmed = search.trim()
  const existeExacta = categorias.some(
    (c) => c.nombre.toLowerCase() === searchTrimmed.toLowerCase()
  )
  const mostrarCrear = searchTrimmed.length > 0 && !existeExacta

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleCrear = async () => {
    if (!searchTrimmed) return
    setCreando(true)
    try {
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: searchTrimmed }),
      })
      if (res.ok) {
        const { categoria } = await res.json()
        onCategoriaCreada(categoria)
        onChange(categoria.id)
        setOpen(false)
        setSearch("")
      }
    } finally {
      setCreando(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors outline-none",
          "border-border/30 bg-secondary/50 text-foreground hover:bg-secondary/70",
          open && "ring-1 ring-ring/50 border-ring/50"
        )}
      >
        <span className={cn(!selected && "text-muted-foreground")}>
          {selected ? selected.nombre : t("products.categoryPlaceholder")}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border/40 bg-[oklch(0.13_0.015_280)] shadow-xl overflow-hidden">
          {/* Buscador / escritura libre */}
          <div className="p-2 border-b border-border/20">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                autoFocus
                className="w-full pl-7 pr-2 py-1.5 text-sm bg-[oklch(0.18_0.02_280)] border border-border/30 rounded text-foreground placeholder:text-muted-foreground outline-none focus:border-ring/50"
                placeholder={t("products.searchOrCreate")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && mostrarCrear) handleCrear()
                  if (e.key === "Escape") { setOpen(false); setSearch("") }
                }}
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto py-1">
            {/* Opcion "Sin categoria" */}
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); setSearch("") }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-accent/20 transition-colors",
                !value && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {!value && <Check className="h-3.5 w-3.5 shrink-0" />}
              <span className={!value ? "" : "pl-5"}>{t("products.noCategory")}</span>
            </button>

            {filtradas.map((cat) => {
              const isSelected = cat.id === value
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { onChange(cat.id); setOpen(false); setSearch("") }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-accent/20 transition-colors",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {isSelected
                    ? <Check className="h-3.5 w-3.5 shrink-0" />
                    : <span className="w-3.5 shrink-0" />
                  }
                  {cat.nombre}
                </button>
              )
            })}

            {filtradas.length === 0 && !mostrarCrear && (
              <p className="px-3 py-2 text-xs text-muted-foreground">{t("common.noResults")}</p>
            )}

            {/* Crear nueva categoria */}
            {mostrarCrear && (
              <button
                type="button"
                onClick={handleCrear}
                disabled={creando}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left border-t border-border/20 text-primary hover:bg-primary/10 transition-colors"
              >
                {creando
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                  : <PenLine className="h-3.5 w-3.5 shrink-0" />
                }
                {t("products.create")} &quot;{searchTrimmed}&quot;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para gestionar proveedores del producto
function ProveedoresSection({
  proveedoresSeleccionados,
  setProveedoresSeleccionados,
  proveedoresData,
  formData,
  onEsPropioChange,
  t,
}: {
  proveedoresSeleccionados: Array<{ id: string; nombre: string; precio_compra: string; es_principal: boolean }>
  setProveedoresSeleccionados: (val: any) => void
  proveedoresData: any
  formData: any
  onEsPropioChange: (val: boolean) => void
  t: (key: string) => string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const proveedoresDisponibles = (proveedoresData?.proveedores || []).filter(
    (p: any) => !proveedoresSeleccionados.some((ps) => ps.id === p.id)
  )
  const filtrados = proveedoresDisponibles.filter((p: any) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const handleAgregar = (proveedor: any) => {
    setProveedoresSeleccionados([
      ...proveedoresSeleccionados,
      { id: proveedor.id, nombre: proveedor.nombre, precio_compra: "", es_principal: false },
    ])
    setSearch("")
    setOpen(false)
  }

  const handleRemover = (id: string) => {
    setProveedoresSeleccionados(proveedoresSeleccionados.filter((p) => p.id !== id))
  }

  const handleActualizar = (id: string, campo: string, valor: any) => {
    setProveedoresSeleccionados(
      proveedoresSeleccionados.map((p) =>
        p.id === id ? { ...p, [campo]: valor } : p
      )
    )
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs">{t("products.suppliers")}</Label>
          <p className="text-xs text-muted-foreground">{t("products.suppliersDesc")}</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.es_propio}
            onChange={(e) => onEsPropioChange(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-xs">{t("products.ownProduct")}</span>
        </label>
      </div>

      {proveedoresSeleccionados.length > 0 && (
        <div className="space-y-2 bg-secondary/30 rounded p-2">
          {proveedoresSeleccionados.map((prov) => (
            <div key={prov.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prov.es_principal}
                onChange={(e) => handleActualizar(prov.id, "es_principal", e.target.checked)}
                className="w-4 h-4"
                title={t("products.mainSupplier")}
              />
              <span className="text-xs flex-1">{prov.nombre}</span>
              <input
                type="number"
                placeholder={t("products.purchasePrice")}
                value={prov.precio_compra}
                onChange={(e) => handleActualizar(prov.id, "precio_compra", e.target.value)}
                className="w-24 h-8 text-xs bg-secondary/50 border border-border/30 rounded px-2"
              />
              <button
                type="button"
                onClick={() => handleRemover(prov.id)}
                className="text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!formData.es_propio && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="w-full text-left px-3 py-2 text-sm bg-secondary/50 border border-border/30 rounded hover:bg-secondary/70 flex items-center justify-between"
          >
            <span className="text-muted-foreground">{t("products.addSupplier")}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {open && proveedoresDisponibles.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-[oklch(0.13_0.015_280)] border border-border/30 rounded shadow-lg">
              <input
                type="text"
                placeholder={t("movements.searchSupplier")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-secondary/50 border-b border-border/20 rounded-t"
                autoFocus
              />
              <div className="max-h-40 overflow-y-auto">
                {filtrados.map((prov: any) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => handleAgregar(prov)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent/20 transition-colors"
                  >
                    {prov.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {open && proveedoresDisponibles.length === 0 && (
            <div className="absolute z-50 w-full mt-1 bg-[oklch(0.13_0.015_280)] border border-border/30 rounded shadow-lg p-3">
              <p className="text-xs text-muted-foreground text-center">{t("products.noSuppliersAvailable")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface Archivo {
  id: string
  nombre: string
  url: string
  tipo: string | null
  tamano: number | null
  creado_en: string
}

function getFileIcon(tipo: string | null) {
  if (!tipo) return FileText
  if (tipo.startsWith("image/")) return Package
  return FileText
}

function formatBytes(bytes: number | null) {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ProductoArchivos({ idProducto }: { idProducto: string }) {
  const { data, mutate: mutateArchivos, isLoading } = useSWR(
    `/api/productos/archivos?id_producto=${idProducto}`,
    fetcher
  )
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const archivos: Archivo[] = data?.archivos || []

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("id_producto", idProducto)
      const res = await fetch("/api/productos/archivos", { method: "POST", body: fd })
      if (res.ok) {
        mutateArchivos()
      } else {
        const err = await res.json()
        alert(err.error || "Error al subir archivo")
      }
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return
    try {
      const res = await fetch(`/api/productos/archivos?id=${id}`, { method: "DELETE" })
      if (res.ok) mutateArchivos()
    } catch {
      alert("Error al eliminar archivo")
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs flex items-center gap-1.5">
            <Paperclip className="h-3.5 w-3.5" />
            Archivos adjuntos
          </Label>
          <p className="text-xs text-muted-foreground">Imágenes, PDFs, documentos</p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.xlsx,.xls,.docx,.doc,.txt,.csv"
            onChange={handleUpload}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1.5 border-border/30"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            {uploading ? "Subiendo..." : "Subir archivo"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Cargando...</p>
      ) : archivos.length === 0 ? (
        <p className="text-xs text-muted-foreground">No hay archivos adjuntos</p>
      ) : (
        <div className="space-y-1 max-h-36 overflow-y-auto">
          {archivos.map((archivo) => (
            <div key={archivo.id} className="flex items-center gap-2 p-2 rounded bg-secondary/30 text-xs">
              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate">{archivo.nombre}</span>
              {archivo.tamano && (
                <span className="text-muted-foreground shrink-0">{formatBytes(archivo.tamano)}</span>
              )}
              <a href={`/api/archivos?url=${encodeURIComponent(archivo.url)}`} target="_blank" rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 shrink-0">
                <ExternalLink className="h-3 w-3" />
              </a>
              <button type="button" onClick={() => handleDelete(archivo.id, archivo.nombre)}
                className="text-red-400 hover:text-red-500 shrink-0">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProductosPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todas")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [saving, setSaving] = useState(false)
  const [extraCategorias, setExtraCategorias] = useState<Categoria[]>([])
  const [formData, setFormData] = useState({
    nombre: "",
    sku: "",
    id_categoria: "",
    stock: "0",
    stock_minimo: "0",
    precio_costo: "0",
    precio_venta: "0",
    es_propio: true,
  })
  const [proveedoresSeleccionados, setProveedoresSeleccionados] = useState<
    Array<{ id: string; nombre: string; precio_compra: string; es_principal: boolean }>
  >([])
  const [proveedorSearch, setProveedorSearch] = useState("")
  const [proveedoresOpen, setProveedoresOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const { data: proveedoresData } = useSWR("/api/proveedores", fetcher)

  const apiUrl = `/api/productos?search=${encodeURIComponent(searchQuery)}&categoria=${selectedCategory}`
  const { data, error, isLoading, mutate: mutateProductos } = useSWR(apiUrl, fetcher, { refreshInterval: 30000 })
  const { data: catData, mutate: mutateCategorias } = useSWR("/api/categorias", fetcher)

  const productos: Producto[] = data?.productos || []
  const categoriasBase: Categoria[] = catData?.categorias || []
  // Merge con categorias recien creadas (evitar duplicados)
  const categorias: Categoria[] = [
    ...categoriasBase,
    ...extraCategorias.filter((e) => !categoriasBase.find((b) => b.id === e.id)),
  ]

  const resetForm = () => {
    setFormData({
      nombre: "",
      sku: "",
      id_categoria: "",
      stock: "0",
      stock_minimo: "0",
      precio_costo: "0",
      precio_venta: "0",
      es_propio: true,
    })
    setProveedoresSeleccionados([])
    setEditingProduct(null)
  }

  const openEditDialog = (product: Producto) => {
    setEditingProduct(product)
    setFormData({
      nombre: product.nombre,
      sku: product.sku || "",
      id_categoria: product.id_categoria || "",
      stock: product.stock.toString(),
      stock_minimo: product.stock_minimo.toString(),
      precio_costo: product.precio_costo.toString(),
      precio_venta: product.precio_venta.toString(),
      es_propio: product.es_propio,
    })
    setProveedoresSeleccionados([])
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) return
    setSaving(true)

    try {
      const method = editingProduct ? "PUT" : "POST"
      const body = editingProduct
        ? { id: editingProduct.id, ...formData }
        : formData

      const res = await fetch("/api/productos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const { producto } = await res.json()

        // Guardar proveedores asociados
        if (proveedoresSeleccionados.length > 0) {
          await Promise.all(
            proveedoresSeleccionados.map((prov) =>
              fetch("/api/producto-proveedor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id_producto: producto.id,
                  id_proveedor: prov.id,
                  precio_compra: prov.precio_compra ? parseFloat(prov.precio_compra) : null,
                  es_principal: prov.es_principal,
                }),
              })
            )
          )
        }

        mutate(apiUrl)
        setDialogOpen(false)
        resetForm()
      }
    } catch (err) {
      console.error("Error saving product:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("products.deleteConfirm"))) return

    try {
      const res = await fetch(`/api/productos?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        mutate(apiUrl)
      }
    } catch (err) {
      console.error("Error deleting product:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("products.loading")}</p>
        </div>
      </div>
    )
  }

  if (error || data?.error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-muted-foreground">{t("products.error")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("products.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("products.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-border/30 gap-2"
            onClick={() => setImportOpen(true)}
          >
            <FileSpreadsheet className="h-4 w-4" />
            {t("products.import.button")}
          </Button>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" />
              {t("products.new")}
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/30 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProduct ? t("products.edit") : t("products.add")}</DialogTitle>
              <DialogDescription>
                {editingProduct ? t("products.editDesc") : t("products.addDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs">{t("products.name")}</Label>
                <Input
                  id="name"
                  placeholder={t("products.namePlaceholder")}
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="bg-secondary/50 border-border/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sku" className="text-xs">{t("products.sku")}</Label>
                  <Input
                    id="sku"
                    placeholder="CB-500"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="bg-secondary/50 border-border/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">{t("products.category")}</Label>
                  <CategoriaCombobox
                    categorias={categorias}
                    value={formData.id_categoria}
                    onChange={(val) => setFormData({ ...formData, id_categoria: val })}
                    onCategoriaCreada={(cat) => {
                      setExtraCategorias((prev) => [...prev, cat])
                      mutateCategorias()
                    }}
                    t={t}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock" className="text-xs">{t("products.stock")}</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="bg-secondary/50 border-border/30"
                    disabled={!!editingProduct}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="min" className="text-xs">{t("products.minStock")}</Label>
                  <Input
                    id="min"
                    type="number"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                    className="bg-secondary/50 border-border/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="costo" className="text-xs">{t("products.costPrice")}</Label>
                  <Input
                    id="costo"
                    type="number"
                    value={formData.precio_costo}
                    onChange={(e) => setFormData({ ...formData, precio_costo: e.target.value })}
                    className="bg-secondary/50 border-border/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="venta" className="text-xs">{t("products.salePrice")}</Label>
                  <Input
                    id="venta"
                    type="number"
                    value={formData.precio_venta}
                    onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                    className="bg-secondary/50 border-border/30"
                  />
                </div>
              </div>

              <div className="border-t border-border/20 pt-4">
                <ProveedoresSection
                  proveedoresSeleccionados={proveedoresSeleccionados}
                  setProveedoresSeleccionados={setProveedoresSeleccionados}
                  proveedoresData={proveedoresData}
                  formData={formData}
                  onEsPropioChange={(val) => setFormData({ ...formData, es_propio: val })}
                  t={t}
                />
              </div>

              {editingProduct && (
                <div className="border-t border-border/20 pt-4">
                  <ProductoArchivos idProducto={editingProduct.id} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="border-border/30">
                {t("common.cancel")}
              </Button>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSubmit}
                disabled={saving || !formData.nombre.trim()}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingProduct ? t("configuracion.saveChanges") : t("products.add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <ImportExcelDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImportComplete={() => { mutateProductos(); mutateCategorias() }}
        t={t}
      />

      {/* Filters */}
      <Card className="glass-card border-border/30">
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("products.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50 border-border/30 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-secondary/50 border-border/30 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-border/30">
                  <SelectItem value="todas">{t("products.allCategories")}</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            {t("products.title")} ({productos.length} {t("products.totalProducts")})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-xs">{t("products.colSKU")}</TableHead>
                  <TableHead className="text-xs">{t("products.colProduct")}</TableHead>
                  <TableHead className="text-xs">{t("products.colCategory")}</TableHead>
                  <TableHead className="text-xs text-right">{t("products.colStock")}</TableHead>
                  <TableHead className="text-xs text-right">{t("products.colSalePrice")}</TableHead>
                  <TableHead className="text-xs">{t("products.colStatus")}</TableHead>
                  <TableHead className="text-xs w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((product) => {
                  const status = getStatusInfo(product.stock, product.stock_minimo, t)
                  return (
                    <TableRow key={product.id} className="border-border/20">
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {product.sku || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-foreground font-medium">
                        {product.nombre}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] bg-secondary/50">
                          {product.categoria?.nombre || t("products.noCategory")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right text-foreground">
                        {product.stock}
                      </TableCell>
                      <TableCell className="text-xs text-right text-foreground">
                        {"\u20A1"}{product.precio_venta.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-[10px] ${status.className}`}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary/50 transition-colors">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              <span className="sr-only">{t("common.actions")}</span>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="glass-card border-border/30" align="end">
                            <DropdownMenuItem className="text-xs gap-2" onClick={() => openEditDialog(product)}>
                              <Edit className="h-3.5 w-3.5" /> {t("common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs gap-2 text-red-400" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="h-3.5 w-3.5" /> {t("common.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              {t("products.noProductsYet")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
