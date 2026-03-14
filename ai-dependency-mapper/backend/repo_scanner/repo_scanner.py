import os
import tempfile
import subprocess
from pathlib import Path
from typing import List
import shutil

def clone_repo(repo_url: str) -> str:
    temp_dir = tempfile.mkdtemp()
    try:
        result = subprocess.run(['git', 'clone', '--depth', '1', repo_url, temp_dir], capture_output=True, check=True)
        repo_name = Path(repo_url).stem.replace('.git', '')
        repo_path = Path(temp_dir) / repo_name
        if repo_path.exists():
            return str(repo_path)
        else:
            raise ValueError("Repo directory not found after clone")
    except subprocess.CalledProcessError as e:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise ValueError(f"Failed to clone {repo_url}: {e.stderr.decode()}")
    except:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise

def scan_files(repo_path: str, max_files: int = 500) -> List[str]:
    supported = {'.py', '.js', '.ts', '.tsx', '.jsx', '.java', '.sql', '.go', '.rs', '.cpp', '.c', '.h', '.php', '.html', '.css'}
    files = []
    p = Path(repo_path)
    for fp in p.rglob('*'):
        if fp.is_file() and fp.suffix in supported and len(files) < max_files:
            rel_path = str(fp.relative_to(p))
            files.append(rel_path)
    return files

