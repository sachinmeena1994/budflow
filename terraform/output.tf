output "build_files_detected" {
  value = fileset("../dist/", "**")
}
