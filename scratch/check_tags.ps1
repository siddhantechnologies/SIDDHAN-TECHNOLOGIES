$dataJs = Get-Content 'Maac\js\data.js' -Raw
$courseHtml = Get-Content 'Course\index.html' -Raw
$tags = [regex]::Matches($courseHtml, '<span class="career-tag">([^<]+)</span>') | ForEach-Object { $_.Groups[1].Value.Trim() } | Select-Object -Unique

Write-Output "Testing $($tags.Count) tags against data.js:"
foreach ($t in $tags) {
    # Check if exact title or partial match in data.js
    $pattern = [regex]::Escape($t)
    $inTitle = [regex]::IsMatch($dataJs, 'title:\s*"[^"]*' + $pattern + '[^"]*"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $inAny = [regex]::IsMatch($dataJs, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($inTitle) {
        Write-Output "  [TITLE MATCH] '$t'"
    } elseif ($inAny) {
        Write-Output "  [BODY/DESC MATCH] '$t'"
    } else {
        Write-Output "  [NOT FOUND] '$t'"
    }
}
