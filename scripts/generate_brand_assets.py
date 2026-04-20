from __future__ import annotations

import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
BRAND_DIR = ROOT / "assets" / "brand"


def run_magick(*args: str) -> None:
    subprocess.run(["magick", *args], check=True, cwd=ROOT)


def render_png(source: str, target: str, size: int) -> None:
    run_magick(source, "-resize", f"{size}x{size}", target)


def render_social_card() -> None:
    run_magick("assets/brand/social-card.svg", "assets/brand/social-card.png")


def render_ico() -> None:
    run_magick(
        "assets/brand/favicon.svg",
        "-define",
        "icon:auto-resize=16,32,48,64,128,256",
        "assets/brand/favicon.ico",
    )


def main() -> None:
    BRAND_DIR.mkdir(parents=True, exist_ok=True)

    render_png("assets/brand/logo-mark.svg", "assets/brand/logo-mark.png", 512)
    render_png("assets/brand/favicon.svg", "assets/brand/favicon.png", 256)
    render_png("assets/brand/favicon.svg", "assets/brand/apple-touch-icon.png", 180)
    render_png("assets/brand/favicon.svg", "assets/brand/icon-192.png", 192)
    render_png("assets/brand/favicon.svg", "assets/brand/icon-512.png", 512)
    render_social_card()
    render_ico()


if __name__ == "__main__":
    main()
