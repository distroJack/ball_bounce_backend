
resource "aws_lambda_function" "lambda_connect" {
  function_name = "ball_bounce_backend_connect"

  filename         = data.archive_file.lambda_connect.output_path
  source_code_hash = data.archive_file.lambda_connect.output_base64sha256

  role    = aws_iam_role.role.arn
  handler = "index.handler"
  runtime = "nodejs14.x"
}

resource "aws_lambda_function" "lambda_default" {
  function_name = "ball_bounce_backend_default"

  filename         = data.archive_file.lambda_default.output_path
  source_code_hash = data.archive_file.lambda_default.output_base64sha256

  role    = aws_iam_role.role.arn
  handler = "index.handler"
  runtime = "nodejs14.x"
}

resource "aws_lambda_function" "lambda_disconnect" {
  function_name = "ball_bounce_backend_disconnect"

  filename         = data.archive_file.lambda_disconnect.output_path
  source_code_hash = data.archive_file.lambda_disconnect.output_base64sha256

  role    = aws_iam_role.role.arn
  handler = "index.handler"
  runtime = "nodejs14.x"
}

# resource "aws_lambda_permission" "allow_lambda_api_invoke_access" {
#   statement_id  = "AllowAPIGatewayInvoke2"
#   action = "lambda:InvokeFunction"
#   function_name = aws_lambda_function.datagen.function_name
#   principal     = "apigateway.amazonaws.com"

#   # source_arn = "${aws_api_gateway_rest_api.api_gateway.execution_arn}/*/POST/ride"
#   source_arn = "${aws_api_gateway_rest_api.api_gateway.execution_arn}/*/*/*"

# }
