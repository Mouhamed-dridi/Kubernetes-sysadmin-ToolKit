<#
.SYNOPSIS
Runs the HR-app React project.

.DESCRIPTION
This script checks if the node_modules folder exists. If it doesn't, it will automatically run 'npm install' to install the dependencies. Then, it starts the Vite development server using 'npm run dev'.
#>

$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$NodeModulesPath = Join-Path -Path $ScriptPath -ChildPath "node_modules"

# Check for dependencies
if (-Not (Test-Path -Path $NodeModulesPath)) {
    Write-Host "Dependencies not found. Running 'npm install'..." -ForegroundColor Yellow
    Set-Location -Path $ScriptPath
    npm install
}

# Start the dev server
Write-Host "Starting the React development server..." -ForegroundColor Green
Set-Location -Path $ScriptPath
npm run dev
