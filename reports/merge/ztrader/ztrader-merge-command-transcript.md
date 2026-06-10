# zTrader merge workflow command transcript

Date (UTC): 2026-06-09T23:57:28Z

## git pull --ff-only origin main
fatal: 'origin' does not appear to be a git repository
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.

## cd apps/ztrader && make merge-dry-run
/bin/bash: line 11: cd: apps/ztrader: No such file or directory

## cd apps/ztrader && make merge-apply
/bin/bash: line 14: cd: apps/ztrader: No such file or directory

## cd apps/ztrader && make merge-validate
/bin/bash: line 17: cd: apps/ztrader: No such file or directory

## cd apps/ztrader && make merge-report
/bin/bash: line 20: cd: apps/ztrader: No such file or directory
