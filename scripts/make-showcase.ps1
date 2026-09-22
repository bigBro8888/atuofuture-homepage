Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'public\images\aspace-one'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

# target box for the Aspace One hero showcase (panel aspect ~1.16)
$tw = 1160
$th = 1000

$jobs = @(
  @{ src = 'public\images\agents\space.jpg';       out = 'showcase-space.jpg' },
  @{ src = 'public\images\agents\meeting.jpg';     out = 'showcase-meeting.jpg' },
  @{ src = 'public\images\solutions\building.jpg'; out = 'showcase-building.jpg' }
)

# The dashboard shot must never lose its edges, so it is padded onto its own
# backdrop colour instead of being cropped to the panel box.
$padded = @{ src = 'public\images\hardware\control-screen.jpg'; out = 'showcase-control.jpg'; w = 1160; h = 1220; top = 150 }

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 82

foreach ($job in $jobs) {
  $srcPath = Join-Path $root $job.src
  $img = [System.Drawing.Image]::FromFile($srcPath)

  $targetRatio = $tw / $th
  $cropW = $img.Width
  $cropH = $img.Height
  if (($img.Width / $img.Height) -gt $targetRatio) {
    $cropW = [int][Math]::Round($img.Height * $targetRatio)
  } else {
    $cropH = [int][Math]::Round($img.Width / $targetRatio)
  }
  $cropX = [int][Math]::Round(($img.Width - $cropW) / 2)
  $cropY = [int][Math]::Round(($img.Height - $cropH) / 2)

  $bmp = New-Object System.Drawing.Bitmap $tw, $th
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.DrawImage($img,
    (New-Object System.Drawing.Rectangle 0, 0, $tw, $th),
    (New-Object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH),
    [System.Drawing.GraphicsUnit]::Pixel)

  $outPath = Join-Path $outDir $job.out
  $bmp.Save($outPath, $codec, $params)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()

  "{0,-26} {1} KB" -f $job.out, [int]((Get-Item $outPath).Length / 1kb)
}

$img = [System.Drawing.Image]::FromFile((Join-Path $root $padded.src))
$probe = New-Object System.Drawing.Bitmap $img
$backdrop = $probe.GetPixel(4, 4)
$drawH = [int][Math]::Round($img.Height * ($padded.w / $img.Width))
$bmp = New-Object System.Drawing.Bitmap $padded.w, $padded.h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear($backdrop)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, $padded.top, $padded.w, $drawH))
$outPath = Join-Path $outDir $padded.out
$bmp.Save($outPath, $codec, $params)
$g.Dispose(); $bmp.Dispose(); $probe.Dispose(); $img.Dispose()
"{0,-26} {1} KB (backdrop {2})" -f $padded.out, [int]((Get-Item $outPath).Length / 1kb), $backdrop.Name
