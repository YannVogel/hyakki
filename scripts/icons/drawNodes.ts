import type { Canvas, CanvasKit, Paint as SkPaint } from 'canvaskit-wasm';

import { type DrawNode, isGroup, type Paint, type ShapeNode } from '../../src/render/yokai/nodes';

function paints(CK: CanvasKit, paint: Paint): SkPaint[] {
  const alpha = paint.opacity ?? 1;
  const passes: SkPaint[] = [];
  if (paint.fill !== undefined && paint.fill !== 'none') {
    const fill = new CK.Paint();
    fill.setAntiAlias(true);
    fill.setStyle(CK.PaintStyle.Fill);
    fill.setColor(CK.parseColorString(paint.fill));
    fill.setAlphaf(alpha * (paint.fillOpacity ?? 1));
    passes.push(fill);
  }
  if (paint.stroke !== undefined) {
    const stroke = new CK.Paint();
    stroke.setAntiAlias(true);
    stroke.setStyle(CK.PaintStyle.Stroke);
    stroke.setColor(CK.parseColorString(paint.stroke));
    stroke.setAlphaf(alpha);
    stroke.setStrokeWidth(paint.strokeWidth ?? 1);
    stroke.setStrokeCap(paint.strokeLinecap === 'round' ? CK.StrokeCap.Round : CK.StrokeCap.Butt);
    stroke.setStrokeJoin(
      paint.strokeLinejoin === 'round' ? CK.StrokeJoin.Round : CK.StrokeJoin.Miter,
    );
    passes.push(stroke);
  }
  return passes;
}

function drawShape(CK: CanvasKit, canvas: Canvas, { shape, paint }: ShapeNode): void {
  for (const pass of paints(CK, paint)) {
    switch (shape.kind) {
      case 'path': {
        const path = CK.Path.MakeFromSVGString(shape.d);
        if (path === null) {
          throw new Error(`Invalid SVG path: ${shape.d}`);
        }
        canvas.drawPath(path, pass);
        path.delete();
        break;
      }
      case 'circle':
        canvas.drawCircle(shape.cx, shape.cy, shape.r, pass);
        break;
      case 'ellipse':
        canvas.drawOval(
          CK.LTRBRect(
            shape.cx - shape.rx,
            shape.cy - shape.ry,
            shape.cx + shape.rx,
            shape.cy + shape.ry,
          ),
          pass,
        );
        break;
      case 'rect': {
        const rect = CK.XYWHRect(shape.x, shape.y, shape.width, shape.height);
        if (shape.rx === undefined) {
          canvas.drawRect(rect, pass);
        } else {
          canvas.drawRRect(CK.RRectXY(rect, shape.rx, shape.rx), pass);
        }
        break;
      }
    }
    pass.delete();
  }
}

/** Draws a tree of drawing nodes the way `DrawNodeView` does on the device (still pose). */
export function drawNode(CK: CanvasKit, canvas: Canvas, node: DrawNode): void {
  if (!isGroup(node)) {
    drawShape(CK, canvas, node);
    return;
  }
  const { rotate, translateX, translateY, scale } = node.group;
  canvas.save();
  canvas.translate(translateX ?? 0, translateY ?? 0);
  canvas.scale(scale ?? 1, scale ?? 1);
  if (rotate !== undefined) {
    canvas.rotate(rotate.angle, rotate.cx, rotate.cy);
  }
  node.children.forEach((child) => drawNode(CK, canvas, child));
  canvas.restore();
}

/** Renders a tree drawn in a `frame` × `frame` box to a `size` × `size` PNG. */
export function renderPng(CK: CanvasKit, node: DrawNode, frame: number, size: number): Uint8Array {
  const surface = CK.MakeSurface(size, size);
  if (surface === null) {
    throw new Error(`Cannot create a ${size} px surface`);
  }
  const canvas = surface.getCanvas();
  canvas.clear(CK.TRANSPARENT);
  canvas.scale(size / frame, size / frame);
  drawNode(CK, canvas, node);
  const image = surface.makeImageSnapshot();
  const png = image.encodeToBytes();
  image.delete();
  surface.delete();
  if (png === null) {
    throw new Error('PNG encoding failed');
  }
  return png;
}
