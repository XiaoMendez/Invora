"use client"

import { useRef, useState } from "react"
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const CAMPOS = [
  { id: "nombre", labelKey: "fieldNombre", requerido: true },
  { id: "sku", labelKey: "fieldSku", requerido: false },
  { id: "categoria", labelKey: "fieldCategoria", requerido: false },
  { id: "descripcion", labelKey: "fieldDescripcion", requerido: false },
  { id: "precio_costo", labelKey: "fieldPrecioCosto", requerido: false },
  { id: "precio_venta", labelKey: "fieldPrecioVenta", requerido: false },
  { id: "stock", labelKey: "fieldStock", requerido: false },
  { id: "stock_minimo", labelKey: "fieldStockMinimo", requerido: false },
] as const

type CampoId = (typeof CAMPOS)[number]["id"]

interface PreviewData {
  headers: string[]
  rows: (string | number)[][]
  totalRows: number
  sugerencia: Record<string, number | null>
  skusExistentes: string[]
  categoriasExistentes: { id: string; nombre: string }[]
}

interface ResultadoImportacion {
  creados: number
  actualizados: number
  omitidos: number
  errores: { fila: number; mensaje: string }[]
}

const BATCH_SIZE = 40

export function ImportExcelDialog({
  open,
  onOpenChange,
  onImportComplete,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: () => void
  t: (key: string) => string
}) {
  const [step, setStep] = useState<"upload" | "mapping" | "importing" | "done">("upload")
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState("")
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [mapping, setMapping] = useState<Record<CampoId, number | null>>({
    nombre: null,
    sku: null,
    categoria: null,
    descripcion: null,
    precio_costo: null,
    precio_venta: null,
    stock: null,
    stock_minimo: null,
  })
  const [uploadError, setUploadError] = useState("")
  const [progreso, setProgreso] = useState(0)
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null)
  const [showErrores, setShowErrores] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setStep("upload")
    setFileName("")
    setPreview(null)
    setUploadError("")
    setProgreso(0)
    setResultado(null)
    setShowErrores(false)
    setMapping({
      nombre: null, sku: null, categoria: null, descripcion: null,
      precio_costo: null, precio_venta: null, stock: null, stock_minimo: null,
    })
  }

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  const procesarArchivo = async (file: File) => {
    setUploadError("")
    if (!file.name.toLowerCase().endsWith(".xlsx") && !file.name.toLowerCase().endsWith(".xls")) {
      setUploadError(t("products.import.fileTypeError"))
      return
    }
    setFileName(file.name)
    setLoadingPreview(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/productos/importar/preview", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) {
        setUploadError(data.error || t("products.import.uploadError"))
        setLoadingPreview(false)
        return
      }
      setPreview(data)
      const nuevoMapping: Record<CampoId, number | null> = {
        nombre: null, sku: null, categoria: null, descripcion: null,
        precio_costo: null, precio_venta: null, stock: null, stock_minimo: null,
      }
      for (const campo of CAMPOS) {
        nuevoMapping[campo.id] = data.sugerencia?.[campo.id] ?? null
      }
      setMapping(nuevoMapping)
      setStep("mapping")
    } catch (err) {
      setUploadError(t("products.import.uploadError"))
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) procesarArchivo(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) procesarArchivo(file)
  }

  // --- Estadísticas en vivo del mapeo actual ---
  const stats = (() => {
    if (!preview) return { nuevos: 0, actualizar: 0, categoriasNuevas: 0 }
    const idxSku = mapping.sku
    const idxCategoria = mapping.categoria
    const categoriasExistentesSet = new Set(
      preview.categoriasExistentes.map((c) => c.nombre.trim().toLowerCase())
    )
    const categoriasNuevas = new Set<string>()
    let nuevos = 0
    let actualizar = 0

    for (const row of preview.rows) {
      if (idxSku !== null && idxSku !== undefined) {
        const skuVal = String(row[idxSku] ?? "").trim().toLowerCase()
        if (skuVal) {
          if (preview.skusExistentes.includes(skuVal)) actualizar++
          else nuevos++
        } else {
          nuevos++
        }
      } else {
        nuevos++
      }
      if (idxCategoria !== null && idxCategoria !== undefined) {
        const catVal = String(row[idxCategoria] ?? "").trim()
        if (catVal && !categoriasExistentesSet.has(catVal.toLowerCase())) {
          categoriasNuevas.add(catVal.toLowerCase())
        }
      }
    }
    return { nuevos, actualizar, categoriasNuevas: categoriasNuevas.size }
  })()

  const puedeContinuar = mapping.nombre !== null

  const iniciarImportacion = async () => {
    if (!preview) return
    setStep("importing")
    setProgreso(0)

    const total = preview.rows.length
    const acumulado: ResultadoImportacion = { creados: 0, actualizados: 0, omitidos: 0, errores: [] }

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const lote = preview.rows.slice(i, i + BATCH_SIZE)
      try {
        const res = await fetch("/api/productos/importar/commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mapping, rows: lote }),
        })
        const data = await res.json()
        if (res.ok) {
          acumulado.creados += data.creados || 0
          acumulado.actualizados += data.actualizados || 0
          acumulado.omitidos += data.omitidos || 0
          acumulado.errores.push(
            ...(data.errores || []).map((e: any) => ({ ...e, fila: e.fila + i }))
          )
        } else {
          acumulado.errores.push({ fila: i + 1, mensaje: data.error || "Error en el lote" })
        }
      } catch {
        acumulado.errores.push({ fila: i + 1, mensaje: "Error de conexión" })
      }
      setProgreso(Math.min(100, Math.round(((i + lote.length) / total) * 100)))
    }

    setResultado(acumulado)
    setStep("done")
    onImportComplete()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "glass-card border-border/30",
          step === "mapping"
            ? "flex flex-col p-0 gap-0 overflow-hidden sm:max-w-6xl w-[94vw] h-[85vh]"
            : "sm:max-w-2xl max-h-[85vh] overflow-y-auto"
        )}
      >
        <DialogHeader
          className={cn(
            step === "mapping" && "shrink-0 border-b border-border/20 px-6 pt-6 pb-4"
          )}
        >
          <DialogTitle>{t("products.import.title")}</DialogTitle>
          <DialogDescription>{t("products.import.subtitle")}</DialogDescription>
        </DialogHeader>

        {/* Paso 1: Subir archivo */}
        {step === "upload" && (
          <div className="py-2">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 text-center cursor-pointer transition-colors",
                dragActive ? "border-ring bg-primary/5" : "border-border/40 hover:border-border/70 hover:bg-secondary/30"
              )}
            >
              {loadingPreview ? (
                <>
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">{t("products.import.analyzing")}</p>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{t("products.import.dropzoneTitle")}</p>
                  <p className="text-xs text-muted-foreground">{t("products.import.dropzoneSubtitle")}</p>
                  <Button variant="outline" className="border-border/30 mt-1 gap-2" type="button">
                    <FileSpreadsheet className="h-4 w-4" />
                    {t("products.import.dropzoneButton")}
                  </Button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
            {uploadError && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {uploadError}
              </div>
            )}
          </div>
        )}

        {/* Paso 2: Mapeo de columnas */}
        {step === "mapping" && preview && (
          <div className="flex flex-col flex-1 min-h-0 px-6 pt-4 pb-6 gap-3">
            {/* Zona fija superior: info del archivo + título */}
            <div className="shrink-0 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 shrink-0">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-foreground font-medium truncate">{fileName}</span>
                <span className="shrink-0">·</span>
                <span className="shrink-0">{preview.totalRows} {t("products.import.detectedRows")}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={reset} className="text-xs text-muted-foreground shrink-0">
                {t("products.import.changeFile")}
              </Button>
            </div>

            <div className="shrink-0">
              <p className="text-sm font-medium text-foreground">{t("products.import.mappingTitle")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("products.import.mappingSubtitle")}</p>
            </div>

            {/* Zona central: única parte que se desplaza (arrastra) */}
            <div className="flex-1 min-h-0 rounded-lg border border-border/30 overflow-hidden flex flex-col bg-card">
              <div className="overflow-auto flex-1 min-h-0">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-secondary">
                    <TableRow className="hover:bg-transparent border-border/40">
                      {preview.headers.map((header, colIdx) => {
                        const campoAsignado = (Object.entries(mapping) as [CampoId, number | null][])
                          .find(([, v]) => v === colIdx)?.[0]
                        const campoInfo = CAMPOS.find((c) => c.id === campoAsignado)
                        return (
                          <TableHead key={colIdx} className="align-top py-2.5 px-2.5 min-w-[190px] border-r border-border/20 last:border-r-0">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {campoAsignado && (
                                  <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                                )}
                                <p className="text-xs font-normal text-muted-foreground truncate" title={header}>
                                  {header || `${t("products.import.columnLabel")} ${colIdx + 1}`}
                                </p>
                              </div>
                              <Select
                                value={campoAsignado || "__ignore__"}
                                onValueChange={(val) => {
                                  setMapping((prev) => {
                                    const next = { ...prev }
                                    // liberar el campo que tuviera esta columna asignada
                                    for (const key of Object.keys(next) as CampoId[]) {
                                      if (next[key] === colIdx) next[key] = null
                                    }
                                    if (val !== "__ignore__") next[val as CampoId] = colIdx
                                    return next
                                  })
                                }}
                              >
                                <SelectTrigger
                                  className={cn(
                                    "w-full text-sm font-medium",
                                    campoAsignado
                                      ? "bg-primary/10 border-primary/30 text-foreground"
                                      : "bg-secondary/50 border-border/30 text-muted-foreground"
                                  )}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass-card border-border/30">
                                  <SelectItem value="__ignore__">{t("products.import.ignoreColumn")}</SelectItem>
                                  {CAMPOS.map((campo) => (
                                    <SelectItem key={campo.id} value={campo.id}>
                                      {t(`products.import.${campo.labelKey}`)}
                                      {campo.requerido ? " *" : ""}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.rows.slice(0, 30).map((row, rowIdx) => (
                      <TableRow
                        key={rowIdx}
                        className={cn("border-border/15", rowIdx % 2 === 1 && "bg-secondary/25")}
                      >
                        {preview.headers.map((_, colIdx) => {
                          const asignado = (Object.keys(mapping) as CampoId[]).some((k) => mapping[k] === colIdx)
                          const valor = row[colIdx]
                          return (
                            <TableCell
                              key={colIdx}
                              className={cn(
                                "text-xs px-2.5 py-2 border-r border-border/10 last:border-r-0 max-w-[220px] truncate",
                                asignado ? "text-foreground" : "text-muted-foreground/50"
                              )}
                              title={String(valor ?? "")}
                            >
                              {valor === "" || valor === undefined || valor === null ? "—" : String(valor)}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {preview.rows.length > 30 && (
                <div className="shrink-0 border-t border-border/30 px-3 py-2 text-xs font-semibold text-primary text-center bg-primary/5">
                  {t("products.import.previewTitle")} · +{preview.rows.length - 30}
                </div>
              )}
            </div>

            {!puedeContinuar && (
              <div className="shrink-0 flex items-center gap-2 text-sm text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {t("products.import.requiredFieldMissing")}
              </div>
            )}

            <div className="shrink-0 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10 whitespace-nowrap">
                {stats.nuevos} {t("products.import.summaryNew")}
              </Badge>
              {stats.actualizar > 0 && (
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 whitespace-nowrap">
                  {stats.actualizar} {t("products.import.summaryUpdate")}
                </Badge>
              )}
              {stats.categoriasNuevas > 0 && (
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 whitespace-nowrap">
                  {stats.categoriasNuevas} {t("products.import.newCategories")}
                </Badge>
              )}
            </div>

            <div className="shrink-0 flex items-center justify-between border-t border-border/20 mt-1 pt-3">
              <Button variant="outline" onClick={reset} className="border-border/30 gap-2">
                <ChevronLeft className="h-4 w-4" />
                {t("products.import.back")}
              </Button>
              <Button
                onClick={iniciarImportacion}
                disabled={!puedeContinuar}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                {t("products.import.startImport")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Paso 3: Importando en tiempo real */}
        {step === "importing" && (
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-foreground font-medium">{t("products.import.importing")}</p>
            <div className="w-full max-w-sm flex flex-col gap-2">
              <Progress value={progreso} />
              <p className="text-xs text-muted-foreground text-center">{t("products.import.progressLabel")} {progreso}%</p>
            </div>
          </div>
        )}

        {/* Paso 4: Resultado */}
        {step === "done" && resultado && (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-7 w-7 text-green-400" />
              </div>
              <p className="text-sm font-medium text-foreground">{t("products.import.done")}</p>
              <p className="text-xs text-muted-foreground">{t("products.import.doneSubtitle")}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-md border border-border/30 p-3 text-center">
                <p className="text-lg font-bold text-green-400">{resultado.creados}</p>
                <p className="text-xs text-muted-foreground">{t("products.import.created")}</p>
              </div>
              <div className="rounded-md border border-border/30 p-3 text-center">
                <p className="text-lg font-bold text-amber-400">{resultado.actualizados}</p>
                <p className="text-xs text-muted-foreground">{t("products.import.updated")}</p>
              </div>
              <div className="rounded-md border border-border/30 p-3 text-center">
                <p className="text-lg font-bold text-muted-foreground">{resultado.omitidos}</p>
                <p className="text-xs text-muted-foreground">{t("products.import.skipped")}</p>
              </div>
              <div className="rounded-md border border-border/30 p-3 text-center">
                <p className="text-lg font-bold text-red-400">{resultado.errores.length}</p>
                <p className="text-xs text-muted-foreground">{t("products.import.errors")}</p>
              </div>
            </div>

            {resultado.errores.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowErrores((s) => !s)}
                  className="text-xs text-primary hover:underline"
                >
                  {t("products.import.viewErrors")}
                </button>
                {showErrores && (
                  <div className="mt-2 max-h-32 overflow-y-auto rounded-md border border-border/30 divide-y divide-border/20">
                    {resultado.errores.map((e, i) => (
                      <div key={i} className="px-3 py-1.5 text-xs text-muted-foreground flex gap-2">
                        <span className="text-red-400 shrink-0">{t("products.import.rowLabel")} {e.fila}</span>
                        <span className="truncate">{e.mensaje}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={reset} className="border-border/30">
                {t("products.import.importAnother")}
              </Button>
              <Button
                onClick={() => handleClose(false)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {t("products.import.close")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
