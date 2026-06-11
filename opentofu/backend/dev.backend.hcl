bucket         = "${TERRAFORM_STATE_BUCKET}"
key            = "opentofu/dev/terraform.tfstate"
region         = "us-east-1"
dynamodb_table = "${TERRAFORM_LOCK_TABLE}"
encrypt        = true
