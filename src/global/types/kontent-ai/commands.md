### Export data

```
$ npx kontent-ai-accelerator --action=export --adapter=kontentAi --environmentId=44604996-2838-00c1-d7e8-fe82ae75df55 --format=csv
--apiKey=<your_api_key>

$ npx @kontent-ai-consulting/migration-toolkit --action=export --environmentId=44604996-2838-00c1-d7e8-fe82ae75df55 --format=csv --adapter=kontentAi --managementApiKey=<management_api_key> --isSecure=true --secureApiKey=<delivery_api_key>
```

### Generate content models

```
$ kontent-generate --environmentId=c091530d-8c9f-003e-9f3f-14c20a9396f2 --exportWebhooks=false --apiKey=<your_api_key>
```
