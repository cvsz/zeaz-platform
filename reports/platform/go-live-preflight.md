# Go live preflight report

Generated: 2026-06-17T11:37:00Z

Read-only gate. No deploy, no Terraform apply, no Cloudflare mutation, no token rotation, no live trading/social automation.


## git diff check

```text
runtime/swarm/marketplace.py:33: trailing whitespace.
+        
runtime/swarm/marketplace.py:36: trailing whitespace.
+            
runtime/swarm/marketplace.py:39: trailing whitespace.
+        
```

## apps source review strict

```text
make[1]: Entering directory '/home/zeazdev/zeaz-platform'
Traceback (most recent call last):
  File "/home/zeazdev/zeaz-platform/scripts/platform/review-apps-source.py", line 667, in <module>
    raise SystemExit(main())
                     ^^^^^^
  File "/home/zeazdev/zeaz-platform/scripts/platform/review-apps-source.py", line 627, in main
    scan_app(root, p, exclude_dirs, expected_by_path)
  File "/home/zeazdev/zeaz-platform/scripts/platform/review-apps-source.py", line 468, in scan_app
    "stack": detect_stack(app_dir),
             ^^^^^^^^^^^^^^^^^^^^^
  File "/home/zeazdev/zeaz-platform/scripts/platform/review-apps-source.py", line 182, in detect_stack
    if list(app_dir.glob("**/*.tf")):
       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/lib/python3.12/pathlib.py", line 1096, in glob
    for p in selector.select_from(self):
  File "/usr/lib/python3.12/pathlib.py", line 235, in _select_from
    for starting_point in self._iterate_directories(parent_path):
  File "/usr/lib/python3.12/pathlib.py", line 229, in _iterate_directories
    for dirpath, dirnames, _ in parent_path.walk():
  File "/usr/lib/python3.12/pathlib.py", line 1137, in walk
    with scandir_it:
KeyboardInterrupt
make[1]: *** [Makefile:800: apps-source-review-strict] Interrupt
