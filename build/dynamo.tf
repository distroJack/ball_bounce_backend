resource "aws_dynamodb_table" "backend-table" {
  name           = "ball-bounce-backend"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "GameId"

  attribute {
    name = "GameId"
    type = "S"
  }
}