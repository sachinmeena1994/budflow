data "terraform_remote_state" "common_infra" {
  backend = "s3"
  config = {
    bucket = "budflow-common-infra-trfrm-bknd-${terraform.workspace}"
    key    = "common-infra/terraform.tfstate"
    region = var.region
  }
}
