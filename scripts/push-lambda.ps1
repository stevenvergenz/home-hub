& "$PSScriptRoot/../node_modules/.bin/tsc.ps1" --project "$PSScriptRoot/../tsconfig.lambda.json"
Push-Location "$PSScriptRoot/../notion-recurring-lambda"
Remove-Item -Recurse node_modules -ErrorAction Ignore
& npm install --production
Compress-Archive -Force -Path index.js, node_modules -DestinationPath notion-recurring-lambda.zip
& aws lambda update-function-code --function-name NotionRecurringEvents --zip-file "fileb://notion-recurring-lambda.zip"
Pop-Location
