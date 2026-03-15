import re
import shutil
import subprocess
import tempfile
from collections import Counter
from datetime import UTC, datetime
from pathlib import Path

from app.schemas.graph import GraphEdge, GraphNode, GraphResponse, GraphSummary
from app.schemas.scan import ScanRequest, ScanResponse


SUPPORTED_SUFFIXES = {
    ".py": "python",
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".sql": "sql",
}

ENV_PATTERN = re.compile(r"\b([A-Z][A-Z0-9_]{2,})\b")
IMPORT_PATTERNS = {
    "python": [
        re.compile(r"^\s*from\s+([a-zA-Z0-9_\.]+)\s+import", re.MULTILINE),
        re.compile(r"^\s*import\s+([a-zA-Z0-9_\.]+)", re.MULTILINE),
    ],
    "javascript": [
        re.compile(r"from\s+['\"]([^'\"]+)['\"]"),
        re.compile(r"require\(['\"]([^'\"]+)['\"]\)"),
    ],
    "typescript": [
        re.compile(r"from\s+['\"]([^'\"]+)['\"]"),
        re.compile(r"require\(['\"]([^'\"]+)['\"]\)"),
    ],
}


class RepoScanService:
    def _clone_repo(self, repo_url: str) -> tuple[Path, Path]:
        temp_dir = Path(tempfile.mkdtemp(prefix="dep-map-"))
        repo_name = Path(repo_url.rstrip("/")).stem.replace(".git", "") or "repo"
        clone_path = temp_dir / repo_name
        try:
            subprocess.run(
                ["git", "clone", "--depth", "1", repo_url, str(clone_path)],
                check=True,
                capture_output=True,
                text=True,
            )
            return temp_dir, clone_path
        except subprocess.CalledProcessError as exc:
            shutil.rmtree(temp_dir, ignore_errors=True)
            stderr = exc.stderr.strip() or exc.stdout.strip() or "git clone failed"
            raise ValueError(f"Failed to clone repository: {stderr}") from exc

    def _scan_supported_files(self, repo_path: Path, max_files: int) -> list[Path]:
        files: list[Path] = []
        for file_path in repo_path.rglob("*"):
            if len(files) >= max_files:
                break
            if not file_path.is_file():
                continue
            if any(part in {".git", "node_modules", "dist", "build", ".next", "__pycache__", ".venv", "venv"} for part in file_path.parts):
                continue
            if file_path.suffix.lower() in SUPPORTED_SUFFIXES:
                files.append(file_path)
        return files

    def _make_file_node(self, repo_name: str, repo_path: Path, file_path: Path, content: str) -> GraphNode:
        relative = file_path.relative_to(repo_path).as_posix()
        language = SUPPORTED_SUFFIXES[file_path.suffix.lower()]
        group = "frontend" if relative.startswith(("src/", "frontend/", "FRONTEND/")) else "backend"
        if language == "sql":
            group = "db"
        risk_score = min(0.95, 0.25 + (content.count("\n") / 200))
        return GraphNode(
            id=f"{repo_name}:{relative}",
            label=file_path.name,
            type="file",
            language=language,
            file=relative,
            line=1,
            group=group,
            risk_score=round(risk_score, 2),
            pagerank=0.0,
            metadata={
                "display_name": file_path.name,
                "path_hint": relative,
                "apis": [],
            },
        )

    def _resolve_import_target(self, repo_name: str, current_file: Path, import_value: str, file_index: dict[str, GraphNode]) -> str | None:
        import_value = import_value.strip()
        if not import_value or import_value.startswith(("http://", "https://")):
            return None

        if import_value.startswith("."):
            base = (current_file.parent / import_value).resolve()
            candidates = [base.with_suffix(ext) for ext in SUPPORTED_SUFFIXES]
            candidates.extend([(base / "index").with_suffix(ext) for ext in SUPPORTED_SUFFIXES])
            for candidate in candidates:
                key = candidate.as_posix()
                if key in file_index:
                    return file_index[key].id
            return None

        normalized = import_value.replace(".", "/")
        for suffix in SUPPORTED_SUFFIXES:
            for candidate in [f"{normalized}{suffix}", f"{normalized}/index{suffix}"]:
                if candidate in file_index:
                    return f"{repo_name}:{candidate}"
        return None

    def build_graph_from_repo(self, request: ScanRequest) -> ScanResponse:
        temp_dir, repo_path = self._clone_repo(str(request.url))
        repo_name = repo_path.name

        try:
            files = self._scan_supported_files(repo_path, request.max_files)
            nodes: list[GraphNode] = []
            edges: list[GraphEdge] = []
            env_nodes: dict[str, GraphNode] = {}
            file_index: dict[str, GraphNode] = {}

            file_contents: dict[Path, str] = {}
            for file_path in files:
                try:
                    content = file_path.read_text(encoding="utf-8", errors="ignore")
                except OSError:
                    content = ""
                file_contents[file_path] = content
                node = self._make_file_node(repo_name, repo_path, file_path, content)
                nodes.append(node)
                file_index[file_path.relative_to(repo_path).as_posix()] = node

            edge_counter = 1
            for file_path, content in file_contents.items():
                relative = file_path.relative_to(repo_path).as_posix()
                current_node = file_index[relative]
                language = current_node.language

                for pattern in IMPORT_PATTERNS.get(language, []):
                    for match in pattern.findall(content):
                        target_id = self._resolve_import_target(repo_name, Path(relative), match, file_index)
                        if not target_id or target_id == current_node.id:
                            continue
                        edges.append(
                            GraphEdge(
                                id=f"edge-{edge_counter:04d}",
                                source=current_node.id,
                                target=target_id,
                                type="imports",
                                confidence=0.78,
                                weight=1,
                                evidence=[f"Import matched: {match}"],
                            )
                        )
                        edge_counter += 1

                for env_var in sorted(set(ENV_PATTERN.findall(content))):
                    env_id = f"{repo_name}:env:{env_var}"
                    if env_var not in env_nodes:
                        env_node = GraphNode(
                            id=env_id,
                            label=env_var,
                            type="env",
                            language="env",
                            file=".env",
                            line=1,
                            group="infra",
                            risk_score=0.55,
                            pagerank=0.0,
                            metadata={"display_name": env_var, "apis": []},
                        )
                        env_nodes[env_var] = env_node
                    edges.append(
                        GraphEdge(
                            id=f"edge-{edge_counter:04d}",
                            source=current_node.id,
                            target=env_id,
                            type="env_usage",
                            confidence=0.64,
                            weight=1,
                            evidence=[f"Uppercase token matched env var pattern: {env_var}"],
                        )
                    )
                    edge_counter += 1

            nodes.extend(env_nodes.values())
            languages = sorted({node.language for node in nodes})
            high_risk_nodes = sum(1 for node in nodes if node.risk_score >= 0.7)
            groups = Counter(node.group for node in nodes)

            graph = GraphResponse(
                repo_id=repo_name,
                generated_at=datetime.now(UTC).isoformat(),
                summary=GraphSummary(
                    node_count=len(nodes),
                    edge_count=len(edges),
                    languages=languages,
                    high_risk_nodes=high_risk_nodes,
                ),
                nodes=nodes,
                edges=edges,
                warnings=[
                    "Graph is generated from lightweight file-level heuristics.",
                    f"Group distribution: {dict(groups)}",
                ],
            )

            return ScanResponse(
                repo_url=str(request.url),
                repo_name=repo_name,
                file_count=len(files),
                graph=graph,
            )
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)


repo_scan_service = RepoScanService()
