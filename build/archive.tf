
data "archive_file" "lambda_connect" {
  type        = "zip"
  source_dir  = "../lambda/connect"
  output_path = "./zips/connect.zip"
}

data "archive_file" "lambda_default" {
  type        = "zip"
  source_dir  = "../lambda/default"
  output_path = "./zips/default.zip"
}

data "archive_file" "lambda_disconnect" {
  type        = "zip"
  source_dir  = "../lambda/disconnect"
  output_path = "./zips/disconnect.zip"
}