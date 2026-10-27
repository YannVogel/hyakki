#!/usr/bin/env python3
"""Removes the cream fringe left around cut-out figures (docs/ART_PIPELINE.md § 3).

The figures of the sheets are outlined in ink on a cream background: anti-aliasing leaves a ring
of cream-tinted pixels outside the outline, visible on colored backgrounds. On that outer ring,
each pixel is treated as a blend of ink and cream: the cream share becomes transparency.

    python3 scripts/defringe.py assets/images/hero/*.png assets/images/bosses/*.png

Files are rewritten in place (the originals stay in Git history).
"""

import argparse
from pathlib import Path

import numpy as np
from PIL import Image

CREAM = np.array([255.0, 244.0, 220.0])
INK = np.array([43.0, 29.0, 63.0])
RING = 4  # Width, in pixels, of the outer ring that may hold cream.


def outer_ring(alpha: np.ndarray, width: int) -> np.ndarray:
    """Visible pixels within `width` pixels of a transparent one."""
    hidden = alpha == 0
    reach = hidden.copy()
    for _ in range(width):
        grown = reach.copy()
        grown[1:, :] |= reach[:-1, :]
        grown[:-1, :] |= reach[1:, :]
        grown[:, 1:] |= reach[:, :-1]
        grown[:, :-1] |= reach[:, 1:]
        reach = grown
    return reach & ~hidden


def defringe(image: Image.Image) -> Image.Image:
    pixels = np.asarray(image.convert('RGBA')).astype(float)
    rgb, alpha = pixels[..., :3], pixels[..., 3]
    ring = outer_ring(alpha, RING)
    axis = CREAM - INK
    # Share of cream in each ring pixel, along the ink → cream axis.
    cream_share = np.clip(((rgb - INK) @ axis) / (axis @ axis), 0.0, 1.0)
    keep = 1.0 - cream_share
    new_alpha = np.where(ring, alpha * keep, alpha)
    safe_keep = np.maximum(keep, 1e-3)[..., None]
    new_rgb = np.where(ring[..., None], np.clip((rgb - cream_share[..., None] * CREAM) / safe_keep, 0, 255), rgb)
    new_alpha = np.where(ring & (keep < 0.05), 0.0, new_alpha)
    result = np.dstack([new_rgb, new_alpha]).round().astype(np.uint8)
    return Image.fromarray(result, 'RGBA')


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('files', nargs='+', type=Path)
    for path in parser.parse_args().files:
        defringe(Image.open(path)).save(path, optimize=True)
        print(f'defringed {path}')


if __name__ == '__main__':
    main()
