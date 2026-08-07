# Run API smoke tests against a running local server (http://localhost:3000)
param(
  [string]$BaseUrl = "http://localhost:3000",
  [string]$VentaId = "",
  [string]$CompraId = "",
  [string]$ArchivoId = ""
)

Write-Host "Running API smoke tests against $BaseUrl"

function Try-Invoke($method, $url, $body=$null) {
  Write-Host "\n==> $method $url"
  try {
    if ($body) {
      $json = $body | ConvertTo-Json -Depth 10
      $resp = Invoke-RestMethod -Method $method -Uri $url -ContentType "application/json" -Body $json -ErrorAction Stop
    } else {
      $resp = Invoke-RestMethod -Method $method -Uri $url -ErrorAction Stop
    }
    Write-Host "Response:"; $resp | ConvertTo-Json -Depth 5
  } catch {
    Write-Host "ERROR:" $_.Exception.Message
    if ($_.Exception.Response) {
      try { $_.Exception.Response | Format-List * -Force } catch {}
    }
  }
}

# 1) Send alertas
Try-Invoke -method POST -url "$BaseUrl/api/alertas" -body @{ action = "send_email_alerts" }

# 2) Attempt to delete an archivo (if provided)
if ($ArchivoId -ne "") {
  Try-Invoke -method DELETE -url "$BaseUrl/api/productos/archivos?id=$ArchivoId"
} else {
  Write-Host "Skipping archivo DELETE (no ArchivoId provided)"
}

# 3) Change venta state to completada (if VentaId provided)
if ($VentaId -ne "") {
  Try-Invoke -method PUT -url "$BaseUrl/api/ventas/$VentaId/estado" -body @{ estado = "completada" }
} else {
  Write-Host "Skipping venta estado PUT (no VentaId provided)"
}

# 4) Change compra state to recibida (if CompraId provided)
if ($CompraId -ne "") {
  Try-Invoke -method PUT -url "$BaseUrl/api/compras/$CompraId/estado" -body @{ estado = "recibida" }
} else {
  Write-Host "Skipping compra estado PUT (no CompraId provided)"
}

Write-Host "\nSmoke tests finished."
