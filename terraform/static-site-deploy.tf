resource "aws_s3_object" "react_build_files" {
  for_each = fileset("../dist/", "**")

  bucket = data.terraform_remote_state.common_infra.outputs.react_app_id[terraform.workspace]
  key    = each.value
  source = "../dist/${each.value}"

  # Use MD5 to detect file content change
  etag = filemd5("../dist/${each.value}")

  content_type = lookup(
    local.content_types,
    lower(regex("^.*(\\.[^.]+)$", each.value)[0]),
    "application/octet-stream"
  )

  cache_control = "max-age=0, no-cache, no-store, must-revalidate"
  # acl           = "public-read"
}
