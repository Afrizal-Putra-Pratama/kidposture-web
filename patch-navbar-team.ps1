$ErrorActionPreference = "Stop"

$file = "src\pages\LandingPage.jsx"
$cssFile = "src\App.css"

if (!(Test-Path $file)) {
  throw "File tidak ditemukan: $file"
}

Copy-Item $file "$file.bak-team" -Force

$content = Get-Content $file -Raw

# Tambahkan import Link kalau belum ada
if ($content -notmatch 'react-router-dom') {
  $content = $content -replace '^(import\s+.*?;\s*)', "`$1`r`nimport { Link } from `"react-router-dom`";`r`n"
} elseif ($content -match 'import\s+\{([^}]*)\}\s+from\s+["'']react-router-dom["''];') {
  $imports = $Matches[1]
  if ($imports -notmatch '\bLink\b') {
    $newImport = "import { $($imports.Trim()), Link } from `"react-router-dom`";"
    $content = $content -replace 'import\s+\{[^}]*\}\s+from\s+["'']react-router-dom["''];', $newImport
  }
}

$desktopTeam = @'
              <div className="landing-team-dropdown">
                <Link to="/team" className="landing-team-trigger">
                  Tim Kami
                  <span className="landing-team-caret">▾</span>
                </Link>

                <div className="landing-team-menu">
                  <Link to="/team">Semua Tim</Link>
                  <Link to="/team/expert">Expert Team</Link>
                  <Link to="/team/staff">Staff Team</Link>
                </div>
              </div>
'@

$mobileTeam = @'
              <Link to="/team" className="mobile-team-link">
                Tim Kami
              </Link>
              <Link to="/team/expert" className="mobile-team-link mobile-team-link-sub">
                Expert Team
              </Link>
              <Link to="/team/staff" className="mobile-team-link mobile-team-link-sub">
                Staff Team
              </Link>
'@

if ($content -notmatch 'landing-team-dropdown') {
  $lines = $content -split "`r?`n"
  $output = New-Object System.Collections.Generic.List[string]

  $countUntukSiapa = 0
  $insertAfterClosingA = $false
  $mode = ""

  foreach ($line in $lines) {
    $output.Add($line)

    if ($line -match 'Untuk Siapa') {
      $countUntukSiapa++

      if ($countUntukSiapa -eq 1) {
        $insertAfterClosingA = $true
        $mode = "desktop"
      }

      if ($countUntukSiapa -eq 2) {
        $insertAfterClosingA = $true
        $mode = "mobile"
      }
    }

    if ($insertAfterClosingA -and $line -match '</a>') {
      if ($mode -eq "desktop") {
        foreach ($newLine in ($desktopTeam -split "`r?`n")) {
          $output.Add($newLine)
        }
      }

      if ($mode -eq "mobile") {
        foreach ($newLine in ($mobileTeam -split "`r?`n")) {
          $output.Add($newLine)
        }
      }

      $insertAfterClosingA = $false
      $mode = ""
    }
  }

  $content = $output -join "`r`n"
}

Set-Content $file $content -Encoding utf8

if (!(Test-Path $cssFile)) {
  $cssFile = "src\index.css"
}

$css = Get-Content $cssFile -Raw

if ($css -notmatch 'landing-team-dropdown') {
@'

/* ===============================
   Landing Navbar - Team Dropdown
   =============================== */

.landing-team-dropdown {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.landing-team-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: inherit;
  text-decoration: none;
  font-weight: 500;
}

.landing-team-caret {
  font-size: 12px;
  line-height: 1;
  opacity: 0.75;
}

.landing-team-menu {
  position: absolute;
  top: calc(100% + 16px);
  left: 50%;
  z-index: 100;
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

.landing-team-dropdown:hover .landing-team-menu,
.landing-team-dropdown:focus-within .landing-team-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.landing-team-menu a {
  display: block;
  padding: 12px 14px;
  border-radius: 12px;
  color: #475569;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}

.landing-team-menu a:hover {
  background: #eff6ff;
  color: #2563eb;
}

.mobile-team-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.mobile-team-link-sub {
  padding-left: 24px !important;
  font-size: 0.92em;
  opacity: 0.85;
}
'@ | Add-Content $cssFile -Encoding utf8
}

Write-Host "Selesai patch navbar Tim Kami." -ForegroundColor Green
Write-Host "Backup: src\pages\LandingPage.jsx.bak-team"
Write-Host "CSS: $cssFile"