# Marqeta Integration Architecture

## Objectives

Integrate card issuing and payment capabilities into zAcademy.

## Bounded Context

payment-domain

Subdomains:
- customer-account
- funding
- card-management
- authorization
- ledger
- webhook-processing

## Domain Model

Organization
 Tenant
  User
   Wallet
    Card
     Transaction
      Authorization

## Event Flow

Frontend
-> payment-service
-> marqeta-adapter
-> Marqeta API
-> webhook
-> event bus
-> analytics

## Webhook Processing

Requirements:
- signature verification
- idempotency key
- retry
- dead letter queue
- audit trail

## Security

OIDC
Vault Secret
RBAC
Least Privilege

## Terraform

Secrets Manager
OIDC Federation
KMS Encryption
