param(
    [string]$Path
)

function Remove-Comments {
    param([string]$FilePath)

    $content = Get-Content $FilePath -Raw

    # Remove single-line comments //
    $content = $content -replace '(?m)^[ \t]*//.*$', ''

    # Remove multi-line comments /* */
    $content = $content -replace '/\*[\s\S]*?\*/', ''

    # Remove empty lines that were left
    $content = $content -replace '(?m)^\s*$', ''

    Set-Content $FilePath $content
}

Get-ChildItem -Path $Path -Recurse | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.Extension -in '.js', '.jsx' } | ForEach-Object {
    Write-Host "Processing $($_.FullName)"
    Remove-Comments -FilePath $_.FullName
}