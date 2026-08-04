Add-Type -AssemblyName System.Drawing

$orig = "D:\Company Website(ElitechNexus)\public\assets\images\home-hero\hero_layer_0.orig.png"
$bmp = New-Object System.Drawing.Bitmap $orig

# Find bright-ish text rows in top 200px (left half) — Devin labels
Write-Output "Top region row brightness (left 0-600):"
for ($y = 30; $y -lt 320; $y += 5) {
  $sum = 0; $n = 0
  for ($x = 30; $x -lt 600; $x += 4) {
    $p = $bmp.GetPixel($x, $y)
    $lum = [int](0.3*$p.R + 0.59*$p.G + 0.11*$p.B)
    if ($lum -gt 80) { $sum += $lum; $n++ }
  }
  if ($n -gt 5) { Write-Output ("y={0:D3} brightPixels={1:D3} avgLum={2:D3}" -f $y, $n, [int]($sum/$n)) }
}

# Find where logo ends / Devin name starts around y=200-280
Write-Output "`nHorizontal scan at y=240 (find name start):"
for ($x = 100; $x -lt 450; $x += 10) {
  $p = $bmp.GetPixel($x, 240)
  $lum = [int](0.3*$p.R + 0.59*$p.G + 0.11*$p.B)
  if ($lum -gt 120) { Write-Output ("x={0:D3} lum={1:D3} rgb={2},{3},{4}" -f $x, $lum, $p.R, $p.G, $p.B) }
}

$bmp.Dispose()
