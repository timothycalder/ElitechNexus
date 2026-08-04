Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap "D:\Company Website(ElitechNexus)\public\assets\images\home-hero\hero_layer_0.orig.png"
Write-Output "Scan y=275:"
for ($x = 50; $x -lt 500; $x += 5) {
  $p = $bmp.GetPixel($x, 275)
  $lum = [int](0.3*$p.R + 0.59*$p.G + 0.11*$p.B)
  if ($lum -gt 100) { Write-Output ("x={0:D3} lum={1:D3}" -f $x, $lum) }
}
Write-Output "Scan y=95 top slogan:"
for ($x = 20; $x -lt 500; $x += 5) {
  $p = $bmp.GetPixel($x, 95)
  $lum = [int](0.3*$p.R + 0.59*$p.G + 0.11*$p.B)
  if ($lum -gt 90) { Write-Output ("x={0:D3} lum={1:D3}" -f $x, $lum) }
}
$bmp.Dispose()
