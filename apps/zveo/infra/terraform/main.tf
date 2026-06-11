terraform {
  required_version = ">= 1.8.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "name" {
  type    = string
  default = "zveo"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "backup_region" {
  type    = string
  default = "us-west-2"
}

variable "retention_days" {
  type    = number
  default = 35
}

provider "aws" {
  region = var.region
}

provider "aws" {
  alias  = "backup"
  region = var.backup_region
}

data "aws_caller_identity" "current" {}

resource "aws_kms_key" "media" {
  description             = "zVEO media artifact encryption key"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

resource "aws_kms_alias" "media" {
  name          = "alias/${var.name}-media"
  target_key_id = aws_kms_key.media.key_id
}

resource "aws_kms_key" "backup" {
  provider                = aws.backup
  description             = "zVEO cross-region backup encryption key"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

resource "aws_s3_bucket" "assets" {
  bucket_prefix = "${var.name}-assets-"
}

resource "aws_s3_bucket" "backups" {
  provider      = aws.backup
  bucket_prefix = "${var.name}-backups-"
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_versioning" "backups" {
  provider = aws.backup
  bucket   = aws_s3_bucket.backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.media.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  provider = aws.backup
  bucket   = aws_s3_bucket.backups.id
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.backup.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket                  = aws_s3_bucket.assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id
  rule {
    id     = "abort-incomplete-and-retain-versions"
    status = "Enabled"
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
    noncurrent_version_expiration {
      noncurrent_days = var.retention_days
    }
  }
}

resource "aws_s3_bucket_replication_configuration" "assets" {
  depends_on = [aws_s3_bucket_versioning.assets, aws_s3_bucket_versioning.backups]
  role       = aws_iam_role.replication.arn
  bucket     = aws_s3_bucket.assets.id
  rule {
    id     = "cross-region-dr"
    status = "Enabled"
    destination {
      bucket        = aws_s3_bucket.backups.arn
      storage_class = "STANDARD_IA"
      encryption_configuration {
        replica_kms_key_id = aws_kms_key.backup.arn
      }
    }
    source_selection_criteria {
      sse_kms_encrypted_objects {
        status = "Enabled"
      }
    }
  }
}

resource "aws_iam_role" "replication" {
  name_prefix = "${var.name}-s3-replication-"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "s3.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "replication" {
  role = aws_iam_role.replication.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetReplicationConfiguration", "s3:ListBucket"]
        Resource = [aws_s3_bucket.assets.arn]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObjectVersion", "s3:GetObjectVersionAcl", "s3:GetObjectVersionForReplication", "s3:GetObjectVersionTagging"]
        Resource = ["${aws_s3_bucket.assets.arn}/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:ReplicateObject", "s3:ReplicateDelete", "s3:ReplicateTags"]
        Resource = ["${aws_s3_bucket.backups.arn}/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = [aws_kms_key.media.arn]
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Encrypt"]
        Resource = [aws_kms_key.backup.arn]
      }
    ]
  })
}

output "asset_bucket" {
  value = aws_s3_bucket.assets.bucket
}

output "backup_bucket" {
  value = aws_s3_bucket.backups.bucket
}

output "media_kms_key_arn" {
  value = aws_kms_key.media.arn
}

variable "eks_cluster_name" {
  type    = string
  default = "zveo-prod"
}

variable "vpc_cidr" {
  type    = string
  default = "10.42.0.0/16"
}

resource "aws_cloudwatch_log_group" "application" {
  name              = "/aws/zveo/application"
  retention_in_days = var.retention_days
  kms_key_id        = aws_kms_key.media.arn
}

resource "aws_sqs_queue" "render_dlq" {
  name                      = "${var.name}-render-dlq"
  message_retention_seconds = 1209600
  kms_master_key_id         = aws_kms_key.media.arn
}

resource "aws_sqs_queue" "render_events" {
  name                       = "${var.name}-render-events"
  visibility_timeout_seconds = 900
  message_retention_seconds  = 345600
  kms_master_key_id          = aws_kms_key.media.arn
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.render_dlq.arn
    maxReceiveCount     = 5
  })
}

resource "aws_iam_role" "workload" {
  name_prefix = "${var.name}-workload-"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "pods.eks.amazonaws.com" }, Action = ["sts:AssumeRole", "sts:TagSession"] }]
  })
}

resource "aws_iam_role_policy" "workload" {
  role = aws_iam_role.workload.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["s3:GetObject", "s3:PutObject", "s3:AbortMultipartUpload"], Resource = ["${aws_s3_bucket.assets.arn}/*"] },
      { Effect = "Allow", Action = ["sqs:SendMessage", "sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"], Resource = [aws_sqs_queue.render_events.arn, aws_sqs_queue.render_dlq.arn] },
      { Effect = "Allow", Action = ["kms:Decrypt", "kms:Encrypt", "kms:GenerateDataKey"], Resource = [aws_kms_key.media.arn] },
      { Effect = "Allow", Action = ["logs:CreateLogStream", "logs:PutLogEvents"], Resource = ["${aws_cloudwatch_log_group.application.arn}:*"] }
    ]
  })
}

output "render_events_queue_url" {
  value = aws_sqs_queue.render_events.url
}

output "render_dlq_url" {
  value = aws_sqs_queue.render_dlq.url
}

output "workload_role_arn" {
  value = aws_iam_role.workload.arn
}
