terraform {
  required_version = ">= 1.7.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

provider "cloudflare" {

locals {
  is_enterprise = lower(var.cloudflare_plan_tier) == "enterprise"














module "dns" {
  count = 0
  count = 0
  source  = "../../modules/cloudflare-dns"
  zone_id = var.cloudflare_zone_id
  records = {}

module "access_app" {
  count = 0
  count = 0
  source     = "../../modules/cloudflare-access-app"
  account_id = var.cloudflare_account_id

module "access_policy" {
  count = 0
  count = 0
  source         = "../../modules/cloudflare-access-policy"
  account_id     = var.cloudflare_account_id

module "saml_provider" {
  count = 0
  count = 0
  source       = "../../modules/cloudflare-saml-provider"
  account_id   = var.cloudflare_account_id

module "tunnel" {
  count = 0
  count = 0
  source     = "../../modules/cloudflare-tunnel"
  account_id = var.cloudflare_account_id
  secret     = var.tunnel_secret

module "workers" {
  count = 0
  count = 0
  source     = "../../modules/cloudflare-workers"
  account_id = var.cloudflare_account_id

module "r2" {
  count = 0
  count = 0
  source     = "../../modules/cloudflare-r2"
  account_id = var.cloudflare_account_id

module "d1" {
  count = 0
  count = 0
  source     = "../../modules/cloudflare-d1"
  account_id = var.cloudflare_account_id

module "waf" {
  count = 0
  count = 0
  source        = "../../modules/cloudflare-waf"
  zone_id       = var.cloudflare_zone_id
  redirect_host = var.primary_domain

module "api_shield" {
  count = 0
  count = 0
  source  = "../../modules/cloudflare-api-shield"
  zone_id = var.cloudflare_zone_id

output "enterprise_features_warning" {
  description = "Warning message when enterprise-only resources are disabled."
  value       = local.is_enterprise ? "" : "Cloudflare plan is not Enterprise; enterprise-only resources are skipped (API Shield, advanced Zero Trust controls)."
