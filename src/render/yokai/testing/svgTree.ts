import { type DrawNode, isGroup, type Paint, type Shape } from '../nodes';

// Test-only: compares the drawing nodes with the prototype's SVG markup, as normalized trees.

export interface SvgElement {
  readonly tag: string;
  readonly attrs: Readonly<Record<string, string>>;
  readonly children: readonly SvgElement[];
}

const PAINT_ATTRIBUTES: Record<keyof Paint, string> = {
  fill: 'fill',
  fillOpacity: 'fill-opacity',
  stroke: 'stroke',
  strokeWidth: 'stroke-width',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
  opacity: 'opacity',
};

function shapeAttributes(value: Shape): Record<string, string> {
  const { kind, ...geometry } = value;
  return Object.fromEntries(
    Object.entries(geometry)
      .filter(([, attribute]) => attribute !== undefined)
      .map(([key, attribute]) => [key, String(attribute)]),
  );
}

export function toSvgTree(node: DrawNode): SvgElement {
  if (isGroup(node)) {
    // `origin` only drives the animations: the prototype keeps it in CSS, not in the markup.
    const { animation, delay, rotate, translateY } = node.group;
    const attrs: Record<string, string> = {};
    if (animation !== undefined) attrs.class = `m-${animation}`;
    if (delay !== undefined) attrs.style = `animation-delay:-${delay}s`;
    if (rotate !== undefined) attrs.transform = `rotate(${rotate.angle} ${rotate.cx} ${rotate.cy})`;
    if (translateY !== undefined) attrs.transform = `translate(0 ${translateY})`;
    return { tag: 'g', attrs, children: node.children.map(toSvgTree) };
  }
  const paint = Object.fromEntries(
    (Object.keys(node.paint) as (keyof Paint)[]).map((key) => [
      PAINT_ATTRIBUTES[key],
      String(node.paint[key]),
    ]),
  );
  return {
    tag: node.shape.kind,
    attrs: { ...shapeAttributes(node.shape), ...paint },
    children: [],
  };
}

/** Parses the prototype's (simple, well-formed) SVG markup. */
export function parseSvg(markup: string): SvgElement {
  const root: { tag: string; attrs: Record<string, string>; children: SvgElement[] } = {
    tag: 'root',
    attrs: {},
    children: [],
  };
  const stack = [root];
  for (const [, closing, tag, rest] of markup.matchAll(/<(\/?)([a-z]+)([^>]*)>/g)) {
    if (closing === '/') {
      stack.pop();
      continue;
    }
    const attrs = Object.fromEntries(
      [...rest.matchAll(/([a-z:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value]),
    );
    const element = { tag, attrs, children: [] as SvgElement[] };
    stack[stack.length - 1].children.push(element);
    stack.push(element);
  }
  return root.children[0];
}

/**
 * The prototype's drawing in the shape of `drawYokai`: the <svg> becomes a plain group and the
 * animated sparkle paths are wrapped in their own animated group.
 */
export function normalizePrototype(svg: SvgElement): SvgElement {
  const wrapSpark = (element: SvgElement): SvgElement => {
    if (element.tag !== 'g' && element.attrs.class === 'm-spark') {
      const { class: _class, ...attrs } = element.attrs;
      return { tag: 'g', attrs: { class: 'm-spark' }, children: [{ ...element, attrs }] };
    }
    return { ...element, children: element.children.map(wrapSpark) };
  };
  return wrapSpark({ tag: 'g', attrs: {}, children: svg.children });
}
