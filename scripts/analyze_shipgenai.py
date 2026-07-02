import os
import re

ROOT = "/home/zeazdev/zeaz-platform/apps/ShipGenAI"

def analyze():
    report = []
    for root, dirs, files in os.walk(ROOT):
        if 'node_modules' in root or '.next' in root or '.git' in root:
            continue
            
        app_name = os.path.basename(root)
        
        has_js = any(f.endswith('.js') or f.endswith('.ts') for f in files)
        if not has_js and 'package.json' not in files and not any(f.endswith('.py') for f in files):
            continue
            
        # We are likely in an app directory if package.json exists or it's a python server
        if 'package.json' in files or 'requirements.txt' in files:
            report.append(f"\n## App: {os.path.relpath(root, ROOT)}")
            
            # Check schema
            schema_path = os.path.join(root, 'prisma', 'schema.prisma')
            if os.path.exists(schema_path):
                with open(schema_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    models = re.findall(r'model\s+(\w+)\s+{', content)
                    report.append(f"- **Database Models**: {', '.join(models)}")
            
            # Check APIs
            apis = []
            services = []
            for r2, d2, f2 in os.walk(root):
                if 'node_modules' in r2 or '.next' in r2: continue
                for file in f2:
                    if file.endswith('.js') or file.endswith('.ts') or file.endswith('.py'):
                        path = os.path.join(r2, file)
                        rel_path = os.path.relpath(path, root)
                        
                        if 'api/' in rel_path or 'routers/' in rel_path:
                            apis.append(rel_path)
                            
                        if 'services/' in rel_path or 'agents/' in rel_path or 'lib/stripe' in rel_path or 'lib/auth' in rel_path:
                            services.append(rel_path)
                            
            if apis:
                report.append("- **API Routes**:")
                for api in sorted(apis)[:15]:
                    report.append(f"  - `{api}`")
                if len(apis) > 15:
                    report.append(f"  - ... and {len(apis)-15} more")
                    
            if services:
                report.append("- **Key Services / Logic**:")
                for svc in sorted(services)[:10]:
                    report.append(f"  - `{svc}`")
                    
    with open('/home/zeazdev/zeaz-platform/shipgenai_analysis.md', 'w') as f:
        f.write('\n'.join(report))

if __name__ == '__main__':
    analyze()
