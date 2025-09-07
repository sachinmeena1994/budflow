locals {
  content_types = {
    ".html" = "text/html"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
  }

  tags = {
    Owner           = "enterprise-architect"
    System          = var.system
    Purpose         = "budflow-dev-webapp-${terraform.workspace}"
    SOX             = "true"
    Environment     = terraform.workspace
    Project         = var.project
    ServiceOwner    = "cpg-platform"
    CostCenter      = "CPG-Budflow-1"
    Compliance      = "cannabis"
    LastUpdatedBy   = "terraform"
    DataSensitivity = "internal"
    DeployedBy      = "terraform"
    Lifecycle       = var.life_cycle
    Region          = var.region
  }
}
