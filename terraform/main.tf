module "terraform_backend" {
  source        = "git::https://gitlab.com/Green_Thumb/otc/otc-terraform-modules//terraform_backend?ref=v0.0.4"
  bucket_name   = "budflow-web-trfrm-bknd"
  table_name    = "budflow-web-trfrm-locks"
  kms_key_alias = "budflow-terraform-bucket-key-web"

  tags = local.tags

  count = terraform.workspace == "default" ? 1 : 0
}
