from __future__ import annotations

import subprocess
import tempfile
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Optional

from git import Repo

@dataclass
class RepoMetadata:
    title: str
    url: str

    latest_commit_hash: str
    latest_commit_short_hash: str
    latest_commit_message: str

    latest_commit_author: str
    latest_commit_author_email: str
    latest_commit_date: datetime

    default_branch: Optional[str] = None


def get_repo_metadata(
    repo_url: str,
    *,
    depth: int = 1,
) -> RepoMetadata:
    """
    Fetch metadata from a git repository using a shallow clone.

    Requirements:
        pip install GitPython

    Args:
        repo_url:
            Git repository URL.
        depth:
            Clone depth. Default is 1 for speed.

    Returns:
        RepoMetadata
    """

    with tempfile.TemporaryDirectory() as tmpdir:
        repo = Repo.clone_from(
            repo_url,
            tmpdir,
            depth=depth,
        )

        commit = repo.head.commit

        title = (
            repo.remotes.origin.url
            .rstrip("/")
            .split("/")[-1]
            .replace(".git", "")
        )

        try:
            default_branch = repo.active_branch.name
        except TypeError:
            # detached HEAD
            default_branch = None

        return RepoMetadata(
            title=title,
            url=repo_url,

            latest_commit_hash=commit.hexsha,
            latest_commit_short_hash=commit.hexsha[:7],
            latest_commit_message=commit.message.strip(),

            latest_commit_author=str(commit.author),
            latest_commit_author_email=commit.author.email,
            latest_commit_date=commit.committed_datetime,

            default_branch=default_branch,
        )