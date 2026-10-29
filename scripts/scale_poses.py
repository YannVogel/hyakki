#!/usr/bin/env python3
"""Brings regenerated hero poses back to one common scale (docs/art/hd-regeneration.md).

A pose drawn alone comes at its own scale, while the game draws every pose at the scale of the
idle pose (HERO_POSES in src/features/shared/images.ts). Each new pose is resized so that the
heights of the poses keep the ratios of the reference set (the poses it replaces).

    python3 scripts/scale_poses.py /tmp/hd/hero assets/images/hero [--idle-height 1250]

Without --idle-height, every reference pose must be in NEW_DIR, and the idle height is the largest
one that upscales no pose. Files of NEW_DIR are rewritten in place.
"""

import argparse
import sys
from pathlib import Path

from PIL import Image

IDLE = 'hero-01-idle.png'


def heights(folder: Path) -> dict[str, int]:
    return {path.name: Image.open(path).height for path in sorted(folder.glob('hero-*.png'))}


def largest_idle_height(new: dict[str, int], reference: dict[str, int]) -> int:
    """Idle height at which the smallest new pose, relative to its reference, keeps its pixels."""
    return int(min(new[name] / reference[name] for name in new) * reference[IDLE])


def resize(path: Path, height: int) -> Image.Image:
    image = Image.open(path).convert('RGBA')
    width = round(image.width * height / image.height)
    # Premultiplied alpha, so that transparent pixels do not bleed their color into the outline.
    return image.convert('RGBa').resize((width, height), Image.LANCZOS).convert('RGBA')


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('new_dir', type=Path)
    parser.add_argument('reference_dir', type=Path)
    parser.add_argument('--idle-height', type=int)
    args = parser.parse_args()

    new, reference = heights(args.new_dir), heights(args.reference_dir)
    unknown = sorted(set(new) - set(reference))
    if unknown or IDLE not in reference:
        sys.exit(f'No reference pose for: {", ".join(unknown or [IDLE])}')
    idle_height = args.idle_height
    if idle_height is None:
        missing = sorted(set(reference) - set(new))
        if missing:
            sys.exit(f'Missing poses (or pass --idle-height): {", ".join(missing)}')
        idle_height = largest_idle_height(new, reference)

    for name in sorted(new):
        height = round(reference[name] * idle_height / reference[IDLE])
        if height > new[name]:
            sys.exit(f'{name} would be upscaled from {new[name]} to {height} px: draw it larger')
        path = args.new_dir / name
        image = resize(path, height)
        image.save(path, optimize=True)
        print(f'{path}  {image.width}x{image.height}')
    print(f'idle height: {idle_height} px')
    return 0


if __name__ == '__main__':
    sys.exit(main())
