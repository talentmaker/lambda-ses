# Lambda SES

A simple lambda function that allows access to the AWS SES V2 API from AWS Lambda, which is definetly not to use the free 62 000 emails a month.

## Examples

### CLI V2

Make sure `cli_binary_format=raw-in-base64-out`

```json
{
    "email": {
        "from": "luke_zhang_04@protonmail.com",
        "dest": {
            "to": ["luke_zhang_04@protonmail.com"]
        },
        "content": {
            "simple": {
                "body": {
                    "html": {
                        "charset": "UTF-8",
                        "data": "<h1>Hello!</h1><br/><p>This is a message</p>"
                    }
                },
                "subject": {
                    "charset": "UTF-8",
                    "data": "no"
                }
            }
        }
    }
}
```

```bash
aws lambda invoke --function-name "lambda-ses" --payload "$(cat ./email.json)" /dev/stdout
```
