$dataJs = Get-Content 'Maac\js\data.js' -Raw
$courseHtml = Get-Content 'Course\index.html' -Raw
$tags = [regex]::Matches($courseHtml, '<span class="career-tag">([^<]+)</span>') | ForEach-Object { $_.Groups[1].Value.Trim() } | Select-Object -Unique

# Parse roles from data.js
$roleBlocks = [regex]::Matches($dataJs, '(?s)\{\s*id:\s*"([^"]+)",\s*softwareKey:\s*"([^"]+)",\s*software:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*industry:\s*"([^"]+)",\s*responsibilities:\s*"([^"]+)"')

Write-Output "Found $($roleBlocks.Count) roles in data.js."

foreach ($t in $tags) {
    $q = $t.ToLower().Trim()
    $searchTerms = $q.Split(" ") | Where-Object { $_.Length -gt 1 }
    $matched = @()

    foreach ($rb in $roleBlocks) {
        $id = $rb.Groups[1].Value
        $title = $rb.Groups[4].Value
        $soft = $rb.Groups[3].Value
        $ind = $rb.Groups[5].Value
        $resp = $rb.Groups[6].Value
        $roleText = "$id $title $soft $ind $resp".ToLower()

        $exact = $roleText.Contains($q)
        $multi = ($searchTerms.Count -gt 1) -and (($searchTerms | Where-Object { -not $roleText.Contains($_) }).Count -eq 0)
        $titleMatch = ($searchTerms | Where-Object { $_.Length -ge 4 -and $title.ToLower().Contains($_) }).Count -gt 0

        if ($exact -or $multi -or $titleMatch) {
            $matched += "$($id) - $($title)"
        }
    }

    if ($matched.Count -gt 0) {
        Write-Output "TAG: '$t' => $($matched.Count) matches (e.g. $($matched[0]))"
    } else {
        Write-Output "TAG: '$t' => NO MATCH!"
    }
}
