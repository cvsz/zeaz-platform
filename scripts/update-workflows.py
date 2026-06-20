import os
import glob
import re

workflows_dir = '.github/workflows'
files = glob.glob(f'{workflows_dir}/**/*.yml', recursive=True)

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Replacements
    content = content.replace('actions/checkout@v7', 'actions/checkout@v4')
    content = content.replace('actions/upload-artifact@v7', 'actions/upload-artifact@v4')
    content = content.replace('hashicorp/setup-terraform@v4', 'hashicorp/setup-terraform@v3')
    content = content.replace('opentofu/setup-opentofu@v2', 'opentofu/setup-opentofu@v1')
    content = content.replace('actions/setup-node@v5', 'actions/setup-node@v4')
    content = content.replace('actions/setup-python@v6', 'actions/setup-python@v5')

    # Add timeout-minutes: 15 to jobs if missing
    if 'timeout-minutes:' not in content and 'jobs:' in content:
        # Simplistic approach: add to the first job definition
        # A bit hacky, but let's just insert it after 'runs-on: '
        content = re.sub(r'(runs-on:\s*[^\n]+)', r'\1\n    timeout-minutes: 15', content)

    # Add permissions if missing (except reusable workflows which might not need root permissions if they use them in jobs, but rule says "Every workflow must have explicit permissions")
    if 'permissions:' not in content:
        # Add after `on: ...` block. 
        # Find the end of `on:` block
        on_match = re.search(r'^on:.*?(?=\n\w)', content, re.MULTILINE | re.DOTALL)
        if on_match:
            end_pos = on_match.end()
            content = content[:end_pos] + "\npermissions:\n  contents: read\n" + content[end_pos:]
        else:
            # Maybe it just has 'on: [push]' on one line
            content = re.sub(r'^(on:\s*[^\n]+)', r'\1\n\npermissions:\n  contents: read', content, flags=re.MULTILINE)

    # Add if-no-files-found: warn to upload-artifact if missing
    # Find upload-artifact uses and its 'with:' block
    lines = content.split('\n')
    new_lines = []
    in_upload_with = False
    for i, line in enumerate(lines):
        new_lines.append(line)
        if 'uses: actions/upload-artifact' in line:
            # Next line usually has 'with:'
            pass
        if 'name:' in line and len(new_lines) > 2 and 'upload-artifact' in new_lines[-3]:
            # Add if-no-files-found if not already there
            if i+1 < len(lines) and 'if-no-files-found' not in lines[i+1]:
                indent = len(line) - len(line.lstrip())
                new_lines.append(' ' * indent + 'if-no-files-found: warn')

    content = '\n'.join(new_lines)

    # Special handling for terraform-apply.yml inputs
    if os.path.basename(file) == 'terraform-apply.yml':
        if 'inputs:' not in content:
            apply_inputs = """  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        type: environment
      confirm:
        description: 'Type yes to confirm apply'
        required: true
        type: string"""
            content = content.replace('  workflow_dispatch:', apply_inputs)

    with open(file, 'w') as f:
        f.write(content)
