Add-Type -AssemblyName System.Drawing

$orig = 'D:\Company Website(ElitechNexus)\public\assets\images\home-hero\hero_layer_0.orig.png'
$out  = 'D:\Company Website(ElitechNexus)\public\assets\images\home-hero\hero_layer_0.png'

$bmp = New-Object System.Drawing.Bitmap $orig
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$unit = [System.Drawing.GraphicsUnit]::Pixel

function Fill([int]$x, [int]$y, [int]$w, [int]$h, $c) {
  $br = New-Object System.Drawing.SolidBrush $c
  $script:g.FillRectangle($br, $x, $y, $w, $h)
  $br.Dispose()
}

function WriteText([int]$x, [int]$y, [int]$w, [int]$h, [string]$t, [float]$sz, $style, $color) {
  $font = New-Object System.Drawing.Font('Segoe UI', $sz, $style, $unit)
  $br = New-Object System.Drawing.SolidBrush $color
  $sf = New-Object System.Drawing.StringFormat
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $sf.Alignment = [System.Drawing.StringAlignment]::Near
  $rect = New-Object System.Drawing.RectangleF($x, $y, $w, $h)
  $script:g.DrawString($t, $font, $br, $rect, $sf)
  $font.Dispose()
  $br.Dispose()
}

$bgTop = [System.Drawing.Color]::FromArgb(255, 14, 24, 40)
$bgName = [System.Drawing.Color]::FromArgb(255, 16, 27, 44)
$muted = [System.Drawing.Color]::FromArgb(220, 168, 192, 214)

# Top slogan ~ y 85-110
Fill 30 78 780 42 $bgTop
WriteText 42 78 760 42 'Build more with Elitechnexus' 22 ([System.Drawing.FontStyle]::Regular) $muted

# Main name ~ y 260-290 (cover leftover D)
Fill 140 248 760 58 $bgName
WriteText 148 248 740 58 'Elitechnexus' 48 ([System.Drawing.FontStyle]::Bold) ([System.Drawing.Color]::White)

$g.Dispose()
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output "Saved $out"
