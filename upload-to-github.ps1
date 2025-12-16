# PowerShell script to upload GoStartHub to GitHub
# Make sure Git is installed first: https://git-scm.com/download/win

Write-Host "Initializing Git repository..." -ForegroundColor Green
git init

Write-Host "Adding remote repository..." -ForegroundColor Green
git remote add origin https://github.com/P0L4R0ID/GoStartHub.git

Write-Host "Adding all files..." -ForegroundColor Green
git add .

Write-Host "Creating initial commit..." -ForegroundColor Green
git commit -m "Initial commit: GoStartHub platform"

Write-Host "Pushing to GitHub..." -ForegroundColor Green
git branch -M main
git push -u origin main

Write-Host "Done! Your code has been uploaded to GitHub." -ForegroundColor Green

