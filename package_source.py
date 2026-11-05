import os
import zipfile
import tarfile

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(ROOT_DIR, 'public')
ZIP_OUT = os.path.join(PUBLIC_DIR, 'dessertboss_source_code.zip')
TAR_OUT = os.path.join(PUBLIC_DIR, 'dessertboss_source_code.tar.gz')

EXCLUDE_DIRS = {
    'node_modules',
    'dist',
    'dev-dist',
    '.git',
    '.cache',
    '__pycache__',
}

EXCLUDE_FILES = {
    'dessertboss_source_code.zip',
    'dessertboss_source_code.tar.gz',
}

def should_include(rel_path):
    parts = rel_path.split(os.sep)
    for p in parts:
        if p in EXCLUDE_DIRS:
            return False
    filename = os.path.basename(rel_path)
    if filename in EXCLUDE_FILES:
        return False
    return True

print("Packaging Dessert Boss source code from:", ROOT_DIR)

# Create ZIP
with zipfile.ZipFile(ZIP_OUT, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, ROOT_DIR)
            if should_include(rel_path):
                zf.write(full_path, arcname=rel_path)

print(f"Created ZIP: {ZIP_OUT} ({os.path.getsize(ZIP_OUT) / 1024:.1f} KB)")

# Create TAR.GZ
with tarfile.open(TAR_OUT, 'w:gz') as tf:
    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, ROOT_DIR)
            if should_include(rel_path):
                tf.add(full_path, arcname=rel_path)

print(f"Created TAR.GZ: {TAR_OUT} ({os.path.getsize(TAR_OUT) / 1024:.1f} KB)")
