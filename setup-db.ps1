# PowerShell script to setup database with automated responses
$responses = @"
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
create column
"@

# Remove existing database
Remove-Item local.db -Force -ErrorAction SilentlyContinue

# Run db:push with automated responses
$responses | npm run db:push
