#!/usr/bin/env python3
"""Cut a ChatGPT character sheet into transparent PNG figures.

Usage:
    python3 scripts/cut_sheet.py SHEET.png OUT_DIR --names a,b,c [--dilate 3] [--threshold 22]

How it works:
    1. Estimate the flat background color from the sheet's corners and edges.
    2. Foreground = pixels whose RGB distance to the background exceeds --threshold.
    3. Label connected components (after a small dilation so a figure's parts stay together).
       The N largest components (N = number of names) are the figures, ordered row by row,
       left to right.
    4. Every small component (flames, drops, bubbles, snowflakes...) is attached to the figure
       whose pixels are closest, if it is within 70 px.
    5. Holes enclosed by a figure stay opaque unless they are pure background bordered by the ink
       outline: a pale highlight close to the background color (a cream belly) stays opaque.
    6. Edges get a 2 px soft alpha band, with colors un-premultiplied against the background,
       so there is no cream halo on colored scenes.

Requires: Pillow, numpy, scipy.
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def estimate_background(a):
    h, w = a.shape[:2]
    points = [(4, 4), (w - 5, 4), (4, h - 5), (w - 5, h - 5), (w // 2, 8), (8, h // 2), (w // 2, h - 9)]
    return np.median(np.array([a[y, x] for x, y in points]), axis=0)


def bordered_by_ink(a, hole):
    # Measured on the HD figures: real gaps have 65 to 89 % of ink around them, highlights under 10 %.
    ring = ndi.binary_dilation(hole, iterations=4) & ~hole
    return (a[ring].mean(-1) < 110).mean() > 0.3


def cut(sheet_path, out_dir, names, dilate, threshold, min_area):
    a = np.asarray(Image.open(sheet_path).convert("RGB")).astype(float)
    h, w = a.shape[:2]
    bg = estimate_background(a)
    dist = np.sqrt(((a - bg) ** 2).sum(-1))
    fg = dist > threshold

    mask = ndi.binary_dilation(fg, iterations=dilate) if dilate else fg
    lab, n = ndi.label(mask)
    objs = ndi.find_objects(lab)
    areas = ndi.sum(np.ones_like(lab), lab, index=range(1, n + 1))

    order = sorted(range(1, n + 1), key=lambda k: areas[k - 1], reverse=True)
    anchors = order[: len(names)]
    if len(anchors) < len(names) or areas[anchors[-1] - 1] < min_area:
        sys.exit(
            f"Found fewer than {len(names)} large figures. "
            "Try a smaller --dilate (figures merged) or a larger one (figures split)."
        )
    anchors.sort(key=lambda k: (objs[k - 1][0].start > h * 0.45, objs[k - 1][1].start))

    dists = [ndi.distance_transform_edt(lab != k) for k in anchors]
    groups = {k: [k] for k in anchors}
    for k in range(1, n + 1):
        if k in groups or areas[k - 1] < 25:
            continue
        sl = objs[k - 1]
        ys, xs = np.where(lab[sl] == k)
        cy, cx = int(ys.mean()) + sl[0].start, int(xs.mean()) + sl[1].start
        best = min(range(len(anchors)), key=lambda j: dists[j][cy, cx])
        if dists[best][cy, cx] < 70:
            groups[anchors[best]].append(k)

    os.makedirs(out_dir, exist_ok=True)
    for name, k in zip(names, anchors):
        region = np.isin(lab, groups[k])
        f = fg & region
        solid = ndi.binary_fill_holes(f)
        holes = solid & ~f
        hl, hn = ndi.label(holes)
        for j in range(1, hn + 1):
            m = hl == j
            if m.sum() > 30 and dist[m].mean() < 7 and bordered_by_ink(a, m):
                solid[m] = False

        band = ndi.binary_dilation(solid, iterations=2) & ~solid
        alpha = np.zeros((h, w))
        alpha[solid] = 1.0
        alpha[band] = np.clip((dist[band] - 3) / 20.0, 0, 1)

        rgb = a.copy()
        m = band & (alpha > 0.02)
        al = alpha[m][:, None]
        rgb[m] = np.clip((a[m] - (1 - al) * bg) / al, 0, 255)

        ys, xs = np.where(alpha > 0.02)
        pad = 4
        y0, y1 = max(0, ys.min() - pad), min(h, ys.max() + 1 + pad)
        x0, x1 = max(0, xs.min() - pad), min(w, xs.max() + 1 + pad)
        out = np.dstack([rgb, alpha * 255]).astype(np.uint8)[y0:y1, x0:x1]
        path = os.path.join(out_dir, name + ".png")
        Image.fromarray(out, "RGBA").save(path, optimize=True)
        print(f"{path}  {out.shape[1]}x{out.shape[0]}  parts={len(groups[k])}")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("sheet")
    p.add_argument("out_dir")
    p.add_argument("--names", required=True, help="Comma-separated output names, row by row, left to right")
    p.add_argument("--dilate", type=int, default=3, help="Dilation (px) used to keep a figure's parts together")
    p.add_argument("--threshold", type=float, default=22, help="RGB distance from the background counted as foreground")
    p.add_argument("--min-area", type=int, default=15000, help="Minimum pixel area of a figure")
    args = p.parse_args()
    names = [n.strip() for n in args.names.split(",") if n.strip()]
    cut(args.sheet, args.out_dir, names, args.dilate, args.threshold, args.min_area)


if __name__ == "__main__":
    main()
