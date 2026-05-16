bucket         = "${TERRAFORM_STATE_BUCKET}"
key            = "cloudflare-platform/${ENVIRONMENT}/terraform.tfstate"
region         = "us-east-1"
endpoint       = "https://s3.amazonaws.com"
dynamodb_table = "${TERRAFORM_LOCK_TABLE}"
encrypt        = true
