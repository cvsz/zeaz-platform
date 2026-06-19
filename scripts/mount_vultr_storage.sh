#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# Vultr Storage Gateway Mount Script
# Reference: https://docs.vultr.com/products/storage/storage-gateway/mount/linux

show_help() {
  echo "Usage: ./scripts/mount_vultr_storage.sh --gateway-ip <IP> --export-path <PATH> [--mount-point <DIR>]"
  echo ""
  echo "Arguments:"
  echo "  --gateway-ip    The IP address of your Vultr Storage Gateway"
  echo "  --export-path   The export path on the gateway (e.g., /vfs)"
  echo "  --mount-point   Local directory to mount to (default: /mnt/vfs)"
  echo "  --help          Show this help message"
}

GATEWAY_IP=""
EXPORT_PATH=""
MOUNT_POINT="/mnt/vfs"

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --gateway-ip) GATEWAY_IP="$2"; shift ;;
    --export-path) EXPORT_PATH="$2"; shift ;;
    --mount-point) MOUNT_POINT="$2"; shift ;;
    --help) show_help; exit 0 ;;
    *) echo "Unknown parameter passed: $1"; exit 1 ;;
  esac
  shift
done

if [[ -z "$GATEWAY_IP" || -z "$EXPORT_PATH" ]]; then
  echo "Error: --gateway-ip and --export-path are required."
  show_help
  exit 1
fi

echo "[*] Checking OS and installing required NFS packages..."
if [ -f /etc/debian_version ]; then
    sudo apt update && sudo apt install nfs-common -y
elif [ -f /etc/redhat-release ]; then
    sudo dnf install nfs-utils -y
else
    echo "Unsupported OS for automatic package installation. Please install nfs-common/nfs-utils manually."
fi

echo "[*] Creating mount point at ${MOUNT_POINT}..."
sudo mkdir -p "${MOUNT_POINT}"

echo "[*] Mounting Vultr Storage Gateway..."
sudo mount -v -t nfs -o vers=4.2,soft,rw "${GATEWAY_IP}:/${EXPORT_PATH}" "${MOUNT_POINT}"

echo "[*] Adding to /etc/fstab for persistence..."
sudo cp /etc/fstab /etc/fstab.bak
# Remove existing entry if it exists
sudo sed -i "\|${GATEWAY_IP}:/${EXPORT_PATH}|d" /etc/fstab

echo "${GATEWAY_IP}:/${EXPORT_PATH}  ${MOUNT_POINT}  nfs  defaults,_netdev,vers=4.2,soft,rw  0  0" | sudo tee -a /etc/fstab > /dev/null

echo "[*] Reloading system daemon and testing mount..."
sudo systemctl daemon-reexec
sudo mount -a

echo "[+] Successfully mounted Vultr Storage Gateway to ${MOUNT_POINT}"
