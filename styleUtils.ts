import { blendColorsFlutter, getColorFlutter } from "./colorUtils";

interface TextStyleData {
    name: string;
    fontSize: number | undefined;
    letterSpacing: number | undefined;
    Height: number | undefined;
    fontWeight: number | undefined;
    decoration: TextDecoration | undefined;
    color: string | undefined;
    fontFamily: string | undefined;
}

export function getSolidPaints(style: PaintStyle): SolidPaint[] {
  const solidPaints: SolidPaint[] = [];

  style.paints.forEach((paint) => {
    if (paint.type === "SOLID") {
      solidPaints.push(paint);
    }
  });

  return solidPaints;
}

export function getColor(paintStyle: PaintStyle) {
  const paints: SolidPaint[] = [];
  for (const style of paintStyle.paints) {
    //for each paint in Paintstyle, add it to array
    if (style.type === "SOLID") {
      paints.push(style);
    }
  }
  //blend its color and return the result hex
  return blendColorsFlutter(paints);
}

export function fetchColorStyles() {
  const paintStyles = figma.getLocalPaintStyles();
  const paintStyleData = [];

  for (const paintStyle of paintStyles) {
    const blendedColors = getColorFlutter(paintStyle.paints);
    paintStyleData.push({
      name: paintStyle.name,
      color: blendedColors
    });
  }

  figma.ui.postMessage({ type: 'colorStyles', data: paintStyleData });
}

export function getSpacing(textNode: TextNode) {
    if (textNode.letterSpacing !== figma.mixed) {
        const spacing = textNode.letterSpacing;
        if (spacing.unit === "PIXELS") {
        return spacing.value;
        } else {
        if (textNode.fontSize !== figma.mixed) {
            return textNode.fontSize * spacing.value;
        }
        }
    }
}

export function getLineHeight(textNode: TextNode) {
    if (textNode.lineHeight !== figma.mixed) {
        const spacing = textNode.lineHeight;
        if (spacing.unit === "PIXELS") {
        return spacing.value;
        } else {
        return 0;
        }
    }
}

export function fetchTextStyles(textNodes: TextNode[]) {
  const textStyleData: TextStyleData[] = [];
  textNodes.forEach(node => {
    let colorAssigned;
    let family;
    if (node.fills !== figma.mixed) {
      colorAssigned = getColorFlutter(node.fills);
    }
    if (node.fontName !== figma.mixed) {
      family = node.fontName.family;
    }
    let fontSize: number | undefined;
    if (node.fontSize !== figma.mixed) {
      fontSize = node.fontSize;
    }
    let fontWeight:  number | undefined;
    if (node.fontWeight !== figma.mixed) {
      fontWeight = node.fontWeight;
    }
    let decoration: TextDecoration | undefined;
    if (node.textDecoration !== figma.mixed) {
      decoration = node.textDecoration;
    }
    textStyleData.push({
      name: node.characters,
      fontSize: fontSize,
      letterSpacing: getSpacing(node),
      Height: getLineHeight(node),
      fontWeight: fontWeight,
      decoration: decoration,
      color: colorAssigned,
      fontFamily: family,
    })
  });
  figma.ui.postMessage({ type: 'textStyles', data: textStyleData });
}
