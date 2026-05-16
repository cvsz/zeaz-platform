locals {
  account_resource = "com.cloudflare.api.account.${var.cloudflare_account_id}"
  zone_resource    = "com.cloudflare.api.account.zone.${var.cloudflare_zone_id}"

data "cloudflare_account_api_token_permission_groups_list" "dns_write" {
  account_id = var.cloudflare_account_id

data "cloudflare_account_api_token_permission_groups_list" "zone_read" {
  account_id = var.cloudflare_account_id

data "cloudflare_account_api_token_permission_groups_list" "workers_write" {
  account_id = var.cloudflare_account_id

data "cloudflare_account_api_token_permission_groups_list" "pages_write" {
  account_id = var.cloudflare_account_id

data "cloudflare_account_api_token_permission_groups_list" "r2_write" {
  account_id = var.cloudflare_account_id

data "cloudflare_account_api_token_permission_groups_list" "d1_write" {
  account_id = var.cloudflare_account_id

resource "cloudflare_account_token" "dns" {
  account_id = var.cloudflare_account_id

  policies = [{
    effect = "allow"
    resources = {
      (local.zone_resource) = "*"
    }
    permission_groups = [
      { id = data.cloudflare_account_api_token_permission_groups_list.dns_write.result[0].id },
      { id = data.cloudflare_account_api_token_permission_groups_list.zone_read.result[0].id }
    ]
  }]

resource "cloudflare_account_token" "workers" {
  account_id = var.cloudflare_account_id

  policies = [{
    effect = "allow"
    resources = {
      (local.account_resource) = "*"
    }
    permission_groups = [
      { id = data.cloudflare_account_api_token_permission_groups_list.workers_write.result[0].id }
    ]
  }]

resource "cloudflare_account_token" "pages" {
  account_id = var.cloudflare_account_id

  policies = [{
    effect = "allow"
    resources = {
      (local.account_resource) = "*"
    }
    permission_groups = [
      { id = data.cloudflare_account_api_token_permission_groups_list.pages_write.result[0].id }
    ]
  }]

resource "cloudflare_account_token" "r2" {
  account_id = var.cloudflare_account_id

  policies = [{
    effect = "allow"
    resources = {
      (local.account_resource) = "*"
    }
    permission_groups = [
      { id = data.cloudflare_account_api_token_permission_groups_list.r2_write.result[0].id }
    ]
  }]

resource "cloudflare_account_token" "d1" {
  account_id = var.cloudflare_account_id

  policies = [{
    effect = "allow"
    resources = {
      (local.account_resource) = "*"
    }
    permission_groups = [
      { id = data.cloudflare_account_api_token_permission_groups_list.d1_write.result[0].id }
    ]
  }]
