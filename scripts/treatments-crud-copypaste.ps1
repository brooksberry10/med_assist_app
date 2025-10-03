# --- config you can tweak ---
$Base = 'http://127.0.0.1:5001'
$u = 'john_doe_test1'
$p = 'SecurePassword123'
$when = 'Oct 12, 2025'   # format: 'MMM dd, yyyy'
# ----------------------------

# 1) LOGIN (username) -> token
$login = Invoke-RestMethod -Method Post -Uri "$Base/api/auth/login-username" -ContentType 'application/json' -Body (@{ username=$u; password=$p } | ConvertTo-Json)
$token = $login.tokens.access

# 2) Decode JWT to get uid (sub)
$seg = ($token.Split('.')[1]); $pad=(4-($seg.Length%4))%4; if($pad -gt 0){$seg+=('='*$pad)}; $seg=$seg.Replace('-','+').Replace('_','/')
$bytes=[Convert]::FromBase64String($seg); $payload = ([Text.Encoding]::UTF8.GetString($bytes)) | ConvertFrom-Json; $uid=[int]$payload.sub
"uid=$uid"; "token="+$token.Substring(0,20)+"..."

# 3) LIST (should be empty first run)
Invoke-RestMethod -Uri "$Base/api/user/$uid/treatments?page=1&per_page=20" -Headers @{ Authorization = "Bearer $token" }

# 4) CREATE
$body = @{ treatment_name='Metformin 500mg'; scheduled_on=$when; notes='Take with breakfast'; is_completed=$false } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$Base/api/user/$uid/treatments" -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } -Body $body

# 5) LIST again & capture id
$r = Invoke-RestMethod -Uri "$Base/api/user/$uid/treatments?page=1&per_page=20" -Headers @{ Authorization = "Bearer $token" }
$r | ConvertTo-Json -Depth 6
$treatmentId = $r.treatments[0].treatment_id; "treatmentId=$treatmentId"

# 6) GET by id
Invoke-RestMethod -Uri "$Base/api/user/$uid/treatments/$treatmentId" -Headers @{ Authorization = "Bearer $token" }

# 7) UPDATE
$patch = @{ is_completed=$true; notes='Completed this morning' } | ConvertTo-Json
try {
  Invoke-RestMethod -Method Patch -Uri "$Base/api/user/$uid/treatments/$treatmentId" -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } -Body $patch
} catch {
  Invoke-RestMethod -CustomMethod 'PATCH' -Uri "$Base/api/user/$uid/treatments/$treatmentId" -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } -Body $patch
}

# 8) DELETE
Invoke-RestMethod -Method Delete -Uri "$Base/api/user/$uid/treatments/$treatmentId" -Headers @{ Authorization = "Bearer $token" }

# 9) Confirm 404
try {
  Invoke-RestMethod -Uri "$Base/api/user/$uid/treatments/$treatmentId" -Headers @{ Authorization = "Bearer $token" }
  throw "Expected 404, but GET after delete succeeded."
} catch {
  $resp = $_.Exception.Response
  if ($resp -and $resp.StatusCode.value__ -eq 404) { "OK: 404 after delete" } else { throw }
}
