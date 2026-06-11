# Startup Service Clean Report

Generated: 20260610-100522

Mode:

```text
DRY_RUN=1
```

Important:

```text
No systemd unit files are deleted.
No *.service files are removed.
Only explicit allowlist units can be disabled.
```


## Enabled system services

```text
UNIT FILE                                             STATE   PRESET
accounts-daemon.service                               enabled enabled
anacron.service                                       enabled enabled
apache2.service                                       enabled enabled
apparmor.service                                      enabled enabled
apport.service                                        enabled enabled
avahi-daemon.service                                  enabled enabled
binfmt-support.service                                enabled enabled
blk-availability.service                              enabled enabled
bluetooth.service                                     enabled enabled
cloud-config.service                                  enabled enabled
cloud-final.service                                   enabled enabled
cloud-init-local.service                              enabled enabled
cloud-init.service                                    enabled enabled
console-setup.service                                 enabled enabled
cron.service                                          enabled enabled
cups-browsed.service                                  enabled enabled
cups.service                                          enabled enabled
dmesg.service                                         enabled enabled
docker.service                                        enabled enabled
e2scrub_reap.service                                  enabled enabled
earlyoom.service                                      enabled enabled
finalrd.service                                       enabled enabled
getty@.service                                        enabled enabled
gnome-remote-desktop.service                          enabled enabled
gpu-manager.service                                   enabled enabled
grub-common.service                                   enabled enabled
grub-initrd-fallback.service                          enabled enabled
keyboard-setup.service                                enabled enabled
lvm2-monitor.service                                  enabled enabled
mariadb.service                                       enabled enabled
ModemManager.service                                  enabled enabled
multipathd.service                                    enabled enabled
networkd-dispatcher.service                           enabled enabled
nmbd.service                                          enabled enabled
ollama.service                                        enabled enabled
open-iscsi.service                                    enabled enabled
open-vm-tools.service                                 enabled enabled
openvpn.service                                       enabled enabled
pollinate.service                                     enabled enabled
postgresql.service                                    enabled enabled
power-profiles-daemon.service                         enabled enabled
redis-server.service                                  enabled enabled
rsyslog.service                                       enabled enabled
samba-ad-dc.service                                   enabled enabled
secureboot-db.service                                 enabled enabled
setvtrgb.service                                      enabled enabled
smbd.service                                          enabled enabled
snap.canonical-livepatch.canonical-livepatchd.service enabled enabled
snap.cups.cups-browsed.service                        enabled enabled
snap.cups.cupsd.service                               enabled enabled
snap.microk8s.daemon-apiserver-kicker.service         enabled enabled
snap.microk8s.daemon-apiserver-proxy.service          enabled enabled
snap.microk8s.daemon-cluster-agent.service            enabled enabled
snap.microk8s.daemon-containerd.service               enabled enabled
snap.microk8s.daemon-etcd.service                     enabled enabled
snap.microk8s.daemon-flanneld.service                 enabled enabled
snap.microk8s.daemon-k8s-dqlite.service               enabled enabled
snap.microk8s.daemon-kubelite.service                 enabled enabled
snapd.apparmor.service                                enabled enabled
snapd.autoimport.service                              enabled enabled
snapd.core-fixup.service                              enabled enabled
snapd.recovery-chooser-trigger.service                enabled enabled
snapd.seeded.service                                  enabled enabled
snapd.service                                         enabled enabled
snapd.system-shutdown.service                         enabled enabled
ssh.service                                           enabled enabled
ssl-cert.service                                      enabled enabled
sssd.service                                          enabled enabled
switcheroo-control.service                            enabled enabled
sysstat.service                                       enabled enabled
systemd-network-generator.service                     enabled enabled
systemd-networkd-wait-online.service                  enabled enabled
systemd-networkd.service                              enabled enabled
systemd-pstore.service                                enabled enabled
systemd-resolved.service                              enabled enabled
systemd-timesyncd.service                             enabled enabled
thermald.service                                      enabled enabled
ua-reboot-cmds.service                                enabled enabled
ubuntu-advantage.service                              enabled enabled
udisks2.service                                       enabled enabled
ufw.service                                           enabled enabled
unattended-upgrades.service                           enabled enabled
vault-agent.service                                   enabled enabled
vgauth.service                                        enabled enabled
wpa_supplicant.service                                enabled enabled
xrdp-sesman.service                                   enabled enabled
xrdp.service                                          enabled enabled
zeye-agentdvr.service                                 enabled enabled
zsp-aitool.service                                    enabled enabled
zsp-hyperframes-worker.service                        enabled enabled
zveo-api.service                                      enabled enabled
zveo-mock-veo.service                                 enabled enabled
zveo-web.service                                      enabled enabled
zwallet-transfer-worker.service                       enabled enabled
zwallet-web.service                                   enabled enabled
zwallet.service                                       enabled enabled

96 unit files listed.
```

## Enabled user services

```text
UNIT FILE                                    STATE   PRESET
filter-chain.service                         enabled enabled
gcr-ssh-agent.service                        enabled enabled
gnome-keyring-daemon.service                 enabled enabled
obex.service                                 enabled enabled
openwork.service                             enabled enabled
org.freedesktop.IBus.session.GNOME.service   enabled enabled
pipewire-pulse.service                       enabled enabled
pipewire.service                             enabled enabled
session-migration.service                    enabled enabled
wireplumber.service                          enabled enabled
xdg-desktop-portal-rewrite-launchers.service enabled enabled

11 unit files listed.
```

## Failed system units

```text
  UNIT                LOAD   ACTIVE SUB    DESCRIPTION
● vault-agent.service loaded failed failed Vault Agent

Legend: LOAD   → Reflects whether the unit definition was properly loaded.
        ACTIVE → The high-level unit activation state, i.e. generalization of SUB.
        SUB    → The low-level unit activation state, values depend on unit type.

1 loaded units listed.
```

## Enabled timers

```text
UNIT FILE                      STATE   PRESET
anacron.timer                  enabled enabled
apport-autoreport.timer        enabled enabled
apt-daily-upgrade.timer        enabled enabled
apt-daily.timer                enabled enabled
certbot.timer                  enabled enabled
dpkg-db-backup.timer           enabled enabled
e2scrub_all.timer              enabled enabled
fstrim.timer                   enabled enabled
fwupd-refresh.timer            enabled enabled
logrotate.timer                enabled enabled
man-db.timer                   enabled enabled
mdcheck_continue.timer         enabled enabled
mdcheck_start.timer            enabled enabled
mdmonitor-oneshot.timer        enabled enabled
motd-news.timer                enabled enabled
phpsessionclean.timer          enabled enabled
snapd.snap-repair.timer        enabled enabled
sysstat-collect.timer          enabled enabled
sysstat-summary.timer          enabled enabled
ua-timer.timer                 enabled enabled
update-notifier-download.timer enabled enabled
update-notifier-motd.timer     enabled enabled

22 unit files listed.
```

## Enabled sockets

```text
UNIT FILE                  STATE   PRESET
apport-forward.socket      enabled enabled
avahi-daemon.socket        enabled enabled
cloud-init-hotplugd.socket enabled enabled
cups.socket                enabled enabled
dm-event.socket            enabled enabled
docker.socket              enabled enabled
iscsid.socket              enabled enabled
lvm2-lvmpolld.socket       enabled enabled
lxd-installer.socket       enabled enabled
multipathd.socket          enabled enabled
snapd.socket               enabled enabled
ssh.socket                 enabled enabled
sssd-autofs.socket         enabled enabled
sssd-nss.socket            enabled enabled
sssd-pac.socket            enabled enabled
sssd-pam-priv.socket       enabled enabled
sssd-pam.socket            enabled enabled
sssd-ssh.socket            enabled enabled
sssd-sudo.socket           enabled enabled
systemd-networkd.socket    enabled enabled
uuidd.socket               enabled enabled

21 unit files listed.
```

## Autostart files

```text
### /etc/xdg/autostart
/etc/xdg/autostart/at-spi-dbus-bus.desktop
/etc/xdg/autostart/geoclue-demo-agent.desktop
/etc/xdg/autostart/gnome-keyring-pkcs11.desktop
/etc/xdg/autostart/gnome-keyring-secrets.desktop
/etc/xdg/autostart/gnome-keyring-ssh.desktop
/etc/xdg/autostart/im-launch.desktop
/etc/xdg/autostart/nm-applet.desktop
/etc/xdg/autostart/orca-autostart.desktop
/etc/xdg/autostart/org.gnome.Evolution-alarm-notify.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.A11ySettings.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.Color.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.Datetime.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.Housekeeping.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.Keyboard.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.MediaKeys.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.Power.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.PrintNotifications.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.Rfkill.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.ScreensaverProxy.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.Sharing.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.Smartcard.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.Sound.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.UsbProtection.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.Wacom.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.Wwan.desktop
/etc/xdg/autostart/org.gnome.SettingsDaemon.XSettings.desktop
/etc/xdg/autostart/pipewire-xrdp.desktop
/etc/xdg/autostart/snap-userd-autostart.desktop
/etc/xdg/autostart/ubuntu-advantage-notification.desktop
/etc/xdg/autostart/update-notifier.desktop
/etc/xdg/autostart/vmware-user.desktop
/etc/xdg/autostart/xdg-user-dirs.desktop
/etc/xdg/autostart/xfce4-clipman-plugin-autostart.desktop
/etc/xdg/autostart/xfsettingsd.desktop
/etc/xdg/autostart/xscreensaver.desktop
### /home/zeazdev/.config/autostart
missing
### /etc/init.d
/etc/init.d/alsa-utils
/etc/init.d/anacron
/etc/init.d/apache2
/etc/init.d/apache-htcacheclean
/etc/init.d/apparmor
/etc/init.d/apport
/etc/init.d/binfmt-support
/etc/init.d/bluetooth
/etc/init.d/console-setup.sh
/etc/init.d/cpufrequtils
/etc/init.d/cron
/etc/init.d/cryptdisks
/etc/init.d/cryptdisks-early
/etc/init.d/cups
/etc/init.d/dbus
/etc/init.d/docker
/etc/init.d/earlyoom
/etc/init.d/gdm3
/etc/init.d/grub-common
/etc/init.d/iscsid
/etc/init.d/keyboard-setup.sh
/etc/init.d/kmod
/etc/init.d/loadcpufreq
/etc/init.d/mariadb
/etc/init.d/mono-xsp4
/etc/init.d/nginx
/etc/init.d/nmbd
/etc/init.d/open-iscsi
/etc/init.d/open-vm-tools
/etc/init.d/openvpn
/etc/init.d/plymouth
/etc/init.d/plymouth-log
/etc/init.d/postgresql
/etc/init.d/procps
/etc/init.d/redis-server
/etc/init.d/rsync
/etc/init.d/samba-ad-dc
/etc/init.d/saned
/etc/init.d/screen-cleanup
/etc/init.d/smbd
/etc/init.d/speech-dispatcher
/etc/init.d/ssh
/etc/init.d/sssd
/etc/init.d/sysstat
/etc/init.d/ufw
/etc/init.d/unattended-upgrades
/etc/init.d/uuidd
/etc/init.d/whoopsie
/etc/init.d/x11-common
/etc/init.d/xrdp
### /etc/rc.local.d
missing
```

## Disable actions

```text
```

Report saved to:

```text
/home/zeazdev/zeaz-platform/reports/startup-clean/startup-services-20260610-100522.md
```
