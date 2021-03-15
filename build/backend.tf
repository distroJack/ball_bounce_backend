terraform {
  backend "s3" {
    bucket = "tf-font-backend"
    key    = "aws-flex/ball-bounce-backend/terraform.tfstate"
    region = "us-east-1"

    dynamodb_table = "terraform-up-and-running-locks"
    encrypt        = false
  }
}