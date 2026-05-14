$ErrorActionPreference = "Stop"

$file = "src\pages\LandingPage.jsx"

if (!(Test-Path $file)) {
  throw "File tidak ditemukan: $file"
}

$backup = "src\pages\LandingPage.jsx.bak-team-navbar"
Copy-Item $file $backup -Force

$content = Get-Content $file -Raw

# 1. Tambahkan import Link dari react-router-dom jika belum ada
if ($content -notmatch 'from\s+["'']react-router-dom["'']') {
  $content = $content -replace '^(import\s+.*?;\s*)', "`$1`r`nimport { Link } from `"react-router-dom`";`r`n"
} elseif ($content -match 'import\s+\{([^}]*)\}\s+from\s+["'']react-router-dom["''];') {
  $existing = $Matches[1]
  if ($existing -notmatch '\bLink\b') {
    $newImport = "import { $($existing.Trim()), Link } from `"react-router-dom`";"
    $content = $content -replace 'import\s+\{[^}]*\}\s+from\s+["'']react-router-dom["''];', $newImport
  }
}

$desktopBlock = @'

              <div className="landing-nav-dropdown">
                <Link to="/team" className="landing-nav-dropdown-trigger">
                  Tim Kami
                  <span className="landing-nav-dropdown-icon">▾</span>
                </Link>

                <div className="landing-nav-dropdown-menu">
                  <Link to="/team">Semua Tim</Link>
                  <Link to="/team/expert">Expert Team</Link>
                  <Link to="/team/staff">Staff Team</Link>
                </div>
              </div>
'@

$mobileBlock = @'

              <Link to="/team" className="mobile-nav-link">
                Tim Kami
              </Link>
              <Link to="/team/expert" className="mobile-nav-link mobile-nav-link-sub">
                Expert Team
              </Link>
              <Link to="/team/staff" className="mobile-nav-link mobile-nav-link-sub">
                Staff Team
              </Link>
'@

# Jangan dobel patch
if ($content -match 'landing-nav-dropdown') {
  Write-Host "Navbar team sudah pernah dipatch. Tidak ditambahkan ulang." -ForegroundColor Yellow
} else {
  $lines = $content -split "`r?`n"
  $result = New-Object System.Collections.Generic.List[string]

  $untukSiapaCount = 0
  $pendingInsert = $false
  $insertMode = ""

  foreach ($line in $lines) {
    $result.Add($line)

    if ($line -match 'Untuk Siapa') {
      $untukSiapaCount++

      if ($untukSiapaCount -eq 1) {
        $pendingInsert = $true
        $insertMode = "desktop"
      } elseif ($untukSiapaCount -eq 2) {
        $pendingInsert = $true
        $insertMode = "mobile"
      }
    }

    if ($pendingInsert -and $line -match '</a>') {
      if ($insertMode -eq "desktop") {
        foreach ($newLine in ($desktopBlock -split "`r?`n")) {
          $result.Add($newLine)
        }
      } elseif ($insertMode -eq "mobile") {
        foreach ($newLine in ($mobileBlock -split "`r?`n")) {
          $result.Add($newLine)
        }
      }

      $pendingInsert = $false
      $insertMode = ""
    }
  }

  $content = $result -join "`r`n"
}

# 2. Tambahkan CSS dropdown ke App.css agar global
$cssFile = "src\App.css"

if (!(Test-Path $cssFile)) {
  $cssFile = "src\index.css"
}

$css = Get-Content $cssFile -Raw

if ($css -notmatch 'landing-nav-dropdown') {
@'

/* ============================
   Landing Navbar Team Dropdown
   ============================ */

.landing-nav-dropdown {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.landing-nav-dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: inherit;
  text-decoration: none;
  font-weight: 500;
}

.landing-nav-dropdown-icon {
  font-size: 12px;
  line-height: 1;
  opacity: 0.75;
}

.landing-nav-dropdown-menu {
  position: absolute;
  top: calc(100% + 16px);
  left: 50%;
  z-index: 80;
  min-width: 210px;
  padding: 10px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.14);
  transform: translateX(-50%) translateY(8px);
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 180ms ease,
    transform 180ms ease,
    visibility 180ms ease;
}

.landing-nav-dropdown:hover .landing-nav-dropdown-menu,
.landing-nav-dropdown:focus-within .landing-nav-dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.landing-nav-dropdown-menu a {
  display: block;
  padding: 12px 14px;
  border-radius: 12px;
  color: #475569;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}

.landing-nav-dropdown-menu a:hover {
  background: #eff6ff;
  color: #2563eb;
}

.mobile-nav-link-sub {
  padding-left: 24px !important;
  font-size: 0.92em;
  opacity: 0.86;
}
'@ | Add-Content $cssFile -Encoding utf8
}

Set-Content $file $content -Encoding utf8

Write-Host "Selesai patch navbar team." -ForegroundColor Green
Write-Host "Backup dibuat di: $backup"
Write-Host "CSS ditambahkan ke: $cssFile"