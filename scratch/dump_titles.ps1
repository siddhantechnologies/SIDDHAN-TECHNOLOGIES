$dataJs = Get-Content 'Maac\js\data.js' -Raw
$titles = [regex]::Matches($dataJs, 'title:\s*"([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
$i = 1
foreach ($t in $titles) {
    Write-Output "$i. $t"
    $i++
}
