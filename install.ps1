<#
.SYNOPSIS
  KitYar one-line installer for Windows PowerShell 5.1+ / PowerShell 7+.

.DESCRIPTION
  1. Checks for Node.js 20+ (installs the LTS via winget when missing and available).
  2. Downloads KitYar (git clone, or ZIP when git is not installed) or updates an existing copy.
  3. Installs dependencies (optionally through an npm registry mirror).
  4. Starts the app on http://localhost:32600 and opens the browser.

  Usage (one line):
    irm https://raw.githubusercontent.com/ehsanking/kityar/main/install.ps1 | iex

  With options (e.g. an npm mirror when the default registry is unreachable):
    $env:KITYAR_NPM_MIRROR = "https://registry.npmmirror.com"; irm https://raw.githubusercontent.com/ehsanking/kityar/main/install.ps1 | iex

  Environment variables (work with the one-liner):
    KITYAR_DIR         Install folder            (default: $HOME\kityar)
    KITYAR_NPM_MIRROR  npm registry mirror URL    (default: official registry)
    KITYAR_NO_START    Set to 1 to skip starting the app
#>
[CmdletBinding()]
param(
    [string]$Dir = $(if ($env:KITYAR_DIR) { $env:KITYAR_DIR } else { Join-Path $HOME 'kityar' }),
    [string]$Mirror = $env:KITYAR_NPM_MIRROR,
    [switch]$NoStart = ($env:KITYAR_NO_START -eq '1')
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'   # Invoke-WebRequest is much faster without the progress bar
$Repo = 'ehsanking/kityar'
$Branch = 'main'
$Port = 32600
$MinNodeMajor = 20

# TLS 1.2 for Windows PowerShell 5.1 on older systems.
try { [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12 } catch {}

function Write-Step([string]$Text) { Write-Host "`n==> $Text" -ForegroundColor Cyan }
function Write-Ok([string]$Text)   { Write-Host "    $Text" -ForegroundColor Green }
function Write-Warn2([string]$Text){ Write-Host "    $Text" -ForegroundColor Yellow }
function Stop-WithHelp([string]$Text) {
    Write-Host "`n[!] $Text" -ForegroundColor Red
    Write-Host "    Guide: https://github.com/$Repo#readme" -ForegroundColor Yellow
    # throw (not exit): with `irm | iex`, exit would close the user's PowerShell window.
    throw 'KitYar installation stopped.'
}

function Update-SessionPath {
    $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $user = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = (@($machine, $user) | Where-Object { $_ }) -join ';'
}

function Get-NodeMajor {
    $node = Get-Command node -ErrorAction SilentlyContinue
    if (-not $node) { return 0 }
    $version = (& node --version) 2>$null          # e.g. v22.11.0
    if ($version -match '^v(\d+)\.') { return [int]$Matches[1] }
    return 0
}

Write-Host @"

  _  ___ _   __   __
 | |/ (_) |_ \ \ / /_ _ _ _
 | ' <| |  _| \ V / _`` | '_|
 |_|\_\_|\__|  |_|\__,_|_|     KitYar installer

"@ -ForegroundColor Magenta

# ---------------------------------------------------------------- 1. Node.js
Write-Step "Checking Node.js (v$MinNodeMajor or newer)"
$major = Get-NodeMajor
if ($major -ge $MinNodeMajor) {
    Write-Ok "Node.js $(& node --version) found."
} else {
    if ($major -gt 0) { Write-Warn2 "Node.js v$major is too old." } else { Write-Warn2 'Node.js is not installed.' }

    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
        Write-Step 'Installing Node.js LTS with winget'
        & winget install --id OpenJS.NodeJS.LTS --exact --silent --accept-package-agreements --accept-source-agreements
        Update-SessionPath
        $major = Get-NodeMajor
    }

    if ($major -lt $MinNodeMajor) {
        Stop-WithHelp @"
Node.js $MinNodeMajor+ could not be installed automatically.
    Install the Windows .msi (LTS) manually, then run this command again.
    If nodejs.org is blocked for you, see the README section on installing Node.js from mirrors.
"@
    }
    Write-Ok "Node.js $(& node --version) installed."
}

# ---------------------------------------------------------------- 2. Source code
Write-Step "Getting KitYar into $Dir"
$git = Get-Command git -ErrorAction SilentlyContinue
if (Test-Path (Join-Path $Dir '.git')) {
    if ($git) {
        & git -C $Dir pull --ff-only
        if ($LASTEXITCODE -ne 0) { Write-Warn2 'Could not update (local changes?). Continuing with the existing copy.' }
        else { Write-Ok 'Updated to the latest version.' }
    } else {
        Write-Warn2 'Existing copy found but git is not installed; using it as is.'
    }
} elseif ((Test-Path $Dir) -and (Get-ChildItem -Force $Dir | Select-Object -First 1)) {
    if (Test-Path (Join-Path $Dir 'package.json')) {
        Write-Warn2 'Existing copy found; using it as is.'
    } else {
        Stop-WithHelp "Folder $Dir exists and is not empty. Choose another folder with `$env:KITYAR_DIR."
    }
} elseif ($git) {
    & git clone --depth 1 --branch $Branch "https://github.com/$Repo.git" $Dir
    if ($LASTEXITCODE -ne 0) { Stop-WithHelp 'git clone failed. Check your connection to github.com.' }
    Write-Ok 'Cloned.'
} else {
    $zip = Join-Path ([IO.Path]::GetTempPath()) "kityar-$([Guid]::NewGuid()).zip"
    $extract = Join-Path ([IO.Path]::GetTempPath()) "kityar-$([Guid]::NewGuid())"
    try {
        Invoke-WebRequest -UseBasicParsing -Uri "https://codeload.github.com/$Repo/zip/refs/heads/$Branch" -OutFile $zip
        Expand-Archive -Path $zip -DestinationPath $extract -Force
        $inner = Get-ChildItem $extract -Directory | Select-Object -First 1
        New-Item -ItemType Directory -Force -Path (Split-Path $Dir -Parent) | Out-Null
        Move-Item -Path $inner.FullName -Destination $Dir
        Write-Ok 'Downloaded (ZIP).'
    } catch {
        Stop-WithHelp "Download from GitHub failed: $($_.Exception.Message)"
    } finally {
        Remove-Item $zip -Force -ErrorAction SilentlyContinue
        Remove-Item $extract -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# ---------------------------------------------------------------- 3. Dependencies
Write-Step 'Installing dependencies (first run takes a few minutes)'
Push-Location $Dir
try {
    $npmArgs = @('--no-audit', '--no-fund')
    if ($Mirror) {
        $npmArgs += "--registry=$Mirror"
        Write-Ok "Using npm mirror: $Mirror"
    }
    # Electron is only needed to build the desktop app; skip its large binary download.
    $env:ELECTRON_SKIP_BINARY_DOWNLOAD = '1'
    $env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1'

    if (Test-Path 'package-lock.json') { & npm ci @npmArgs } else { & npm install @npmArgs }
    if ($LASTEXITCODE -ne 0) {
        Stop-WithHelp @"
Installing packages failed. If registry.npmjs.org is slow or blocked, run again with a mirror, e.g.:
    `$env:KITYAR_NPM_MIRROR = "https://registry.npmmirror.com"; irm https://raw.githubusercontent.com/$Repo/$Branch/install.ps1 | iex
"@
    }
    Write-Ok 'Dependencies installed.'

    # ------------------------------------------------------------ 4. Start
    if ($NoStart) {
        Write-Host "`nDone. Start later with:  cd `"$Dir`"; npm run dev" -ForegroundColor Green
        return
    }
    Write-Step "Starting KitYar on http://localhost:$Port  (press Ctrl+C to stop)"
    # Open the browser once the server answers (background job, so npm keeps the console).
    Start-Job -ArgumentList $Port -ScriptBlock {
        param($p)
        for ($i = 0; $i -lt 60; $i++) {
            try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 "http://localhost:$p" | Out-Null; Start-Process "http://localhost:$p"; return } catch { Start-Sleep 1 }
        }
    } | Out-Null
    & npm run dev
} finally {
    Pop-Location
}
