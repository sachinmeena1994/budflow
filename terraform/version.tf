terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "budflow-web-trfrm-bknd"
    dynamodb_table = "budflow-web-trfrm-locks"
    key            = "common-infra/terraform.tfstate"
    kms_key_id     = "alias/budflow-terraform-bucket-key-web"
    region         = "us-east-1"
    encrypt        = true
  }
}

provider "aws" {
  region = var.region # Change the region as needed
}
