#!/usr/bin/env python3
"""Checks cut-out figures before they replace those of assets/images (docs/ART_PIPELINE.md § 5).

For each PNG: height of at least --min-height pixels, transparent background, no cream fringe
(#FFF4DC-like pixels on the visible edge). For the hero poses, also reports where the feet land
(lowest opaque row, relative to the image height) so that poses do not jump.

    python3 scripts/check_figures.py assets/images/hero assets/images/bosses --min-height 900

Exits with 1 when a figure fails.
"""

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image

CREAM = np.array([255, 244, 220])
CREAM_TOLERANCE = 28
FRINGE_LIMIT = 0.02  # Share of edge pixels allowed to look cream.
FEET_TOLERANCE = 0.03  # Feet line may differ by 3 % of the height between poses.


def edge_mask(alpha: np.ndarray) -> np.ndarray:
    """Clearly visible pixels (alpha > 50 %) touching a mostly transparent one: the outline."""
    visible = alpha > 128
    padded = np.pad(visible, 1, constant_values=False)
    neighbours_hidden = (
        ~padded[:-2, 1:-1] | ~padded[2:, 1:-1] | ~padded[1:-1, :-2] | ~padded[1:-1, 2:]
    )
    return visible & neighbours_hidden


def check(path: Path, min_height: int) -> tuple[list[str], float | None]:
    image = Image.open(path).convert('RGBA')
    pixels = np.asarray(image).astype(int)
    rgb, alpha = pixels[..., :3], pixels[..., 3]
    problems = []
    if image.height < min_height:
        problems.append(f'height {image.height} px < {min_height} px')
    if alpha.min() == 255:
        problems.append('no transparency (background not removed)')
        return problems, None
    edges = edge_mask(alpha)
    cream = np.all(np.abs(rgb - CREAM) <= CREAM_TOLERANCE, axis=-1) & edges
    share = cream.sum() / max(1, edges.sum())
    if share > FRINGE_LIMIT:
        problems.append(f'cream fringe on {share:.1%} of the edge')
    rows = np.where((alpha > 128).any(axis=1))[0]
    feet = rows.max() / image.height if rows.size else None
    return problems, feet


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('folders', nargs='+', type=Path)
    parser.add_argument('--min-height', type=int, default=900)
    args = parser.parse_args()

    failed = False
    for folder in args.folders:
        feet_lines = {}
        for path in sorted(folder.glob('*.png')):
            problems, feet = check(path, args.min_height)
            status = 'OK ' if not problems else 'KO '
            print(f'{status} {path}' + ('' if not problems else ' — ' + '; '.join(problems)))
            failed |= bool(problems)
            if feet is not None and path.name.startswith('hero-'):
                feet_lines[path.name] = feet
        if feet_lines:
            low, high = min(feet_lines.values()), max(feet_lines.values())
            aligned = high - low <= FEET_TOLERANCE
            print(f"{'OK ' if aligned else 'KO '} feet line of the hero poses: {low:.3f} to {high:.3f}")
            failed |= not aligned
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
