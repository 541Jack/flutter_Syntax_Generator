import { blendColorsFlutter, getColorFlutter } from "../colorUtils";
import { getSpacing, getLineHeight } from "./nodeUtils";

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
  console.log(paints);
  //blend its color and return the result hex
  return blendColorsFlutter(paints);
}

export function fetchColorStyles() {
  const paintStyles = figma.getLocalPaintStyles();
  const paintStyleData = [];
  console.log(paintStyles);

  for (const paintStyle of paintStyles) {
    const blendedColors = getColorFlutter(paintStyle.paints);
    paintStyleData.push({
      name: parseName(paintStyle.name),
      color: blendedColors
    });
  }

  figma.ui.postMessage({ type: 'colorStyles', data: paintStyleData });
}

export function parseName(name: string): string {
  let parts = name.split("/");
  return parts[0] + " " + parts[parts.length - 1];
}

export function fetchTextStyles(textNodes: TextNode[], messageType: string) {
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
  if (messageType === 'requestTextStyles') {
    figma.ui.postMessage({ type: 'textStyles', data: textStyleData });
  }
  else if (messageType === 'requestPrimaryTextStyles') {
    figma.ui.postMessage({ type: 'primaryTextStyles', data: textStyleData });
  }
}
