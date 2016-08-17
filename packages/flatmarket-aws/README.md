# flatmarket-aws

A [Flatmarket](/christophercliff/flatmarket) service for AWS.

## Usage

[![Deploy to AWS](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png)](https://console.aws.amazon.com/cloudformation/home?region=region#/stacks/new?stackName=flatmarket&templateURL=https://raw.githubusercontent.com/christophercliff/flatmarket/master/packages/flatmarket-aws/template.json)

### Verify the endpoint

Replace `{YOUR_REST_API_ID}` and `{YOUR_REGION}`.

```sh
curl https://{YOUR_REST_API_ID}.execute-api.{YOUR_REGION}.amazonaws.com/flatmarket/ \
    -H 'Content-Type: application/json' \
    -d '{ "email": "hello@world.com"' \
    -v
```

## License

See [LICENSE](https://github.com/christophercliff/flatmarket/blob/master/LICENSE.md).
