function rgbToHex(rgb: RGB): string {
  const r = Math.floor(rgb.r * 255);
  const g = Math.floor(rgb.g * 255);
  const b = Math.floor(rgb.b * 255);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function convertToARGBHex(color: { r: number, g: number, b: number, a: number }) {
  const alpha = Math.round(color.a * 255);
  const red = Math.round(color.r * 255);
  const green = Math.round(color.g * 255);
  const blue = Math.round(color.b * 255);
  const argb = ((alpha << 24) >>> 0) + (red << 16) + (green << 8) + blue;
  const argbHex = '0x' + argb.toString(16).toUpperCase().padStart(8, '0');
  return argbHex;
}


function getSolidPaints(style: PaintStyle): SolidPaint[] {
  const solidPaints: SolidPaint[] = [];

  style.paints.forEach((paint) => {
    if (paint.type === "SOLID") {
      solidPaints.push(paint);
    }
  });

  return solidPaints;
}


function blendColors(colors: SolidPaint[]) {
  let resultColor = { r: 0, g: 0, b: 0, a: 1 };


  colors.forEach((color) => {
    resultColor.r += color.color.r * (color.opacity !== undefined ? color.opacity : 1);
    resultColor.g += color.color.g * (color.opacity !== undefined ? color.opacity : 1);
    resultColor.b += color.color.b * (color.opacity !== undefined ? color.opacity : 1);
    resultColor.a *= (color.opacity !== undefined ? color.opacity : 1);
  });

  // Convert the color to hex
  const hex = rgbToHex(resultColor);

  return hex;
}

function blendColorsFlutter(colors: SolidPaint[]) {
  let resultColor = { r: 0, g: 0, b: 0, a: 0 };

  colors.forEach((color) => {
    let alpha = color.opacity !== undefined ? color.opacity : 1;
    let inverseAlpha = 1 - alpha;

    // Blend the colors
    resultColor.r = (color.color.r * alpha) + (resultColor.r * resultColor.a * inverseAlpha);
    resultColor.g = (color.color.g * alpha) + (resultColor.g * resultColor.a * inverseAlpha);
    resultColor.b = (color.color.b * alpha) + (resultColor.b * resultColor.a * inverseAlpha);

    // Combine the alpha values
    resultColor.a = alpha + (resultColor.a * inverseAlpha);
  });

  return convertToARGBHex(resultColor);
}


function getName(paintStyle: PaintStyle) {
  return paintStyle.name;
}

function getColor(paintStyle: PaintStyle) {
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

function getColorFlutter(paintsInput: ReadonlyArray<Paint>) {
  const paints: SolidPaint[] = [];
  for (const paint of paintsInput) {
    if (paint.type === "SOLID") {
      paints.push(paint as SolidPaint);
    }
  }
  return blendColorsFlutter(paints);
}


function fetchColorStyles() {
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

function findTextNodes(node: SceneNode): TextNode[] {
  let textNodes: TextNode[] = [];
  
  // Check if the node is a TextNode
  if (node.type === "TEXT") {
    textNodes.push(node as TextNode);
  }
  
  // If the node has children, recursively find text nodes in each child
  if ("children" in node) {
    const children = node.children as readonly SceneNode[];
    children.forEach(child => {
      const childTextNodes = findTextNodes(child);
      textNodes = textNodes.concat(childTextNodes);
    });
  }
  
  return textNodes;
}

function getSpacing(textNode: TextNode) {
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

function getLineHeight(textNode: TextNode) {
  if (textNode.lineHeight !== figma.mixed) {
    const spacing = textNode.lineHeight;
    if (spacing.unit === "PIXELS") {
      return spacing.value;
    } else {
      return 0;
    }
  }
}


// This shows the HTML page in "ui.html".

figma.showUI(__html__, { width: 300, height: 500 });

function getTextNodes(): TextNode[] {
  // Get the selected components in Figma
  const selection = figma.currentPage.selection;

  // Array to store the found text nodes
  let textNodes: TextNode[] = [];

  selection.forEach(node => {
    const textNode = findTextNodes(node);
    textNodes = textNodes.concat(textNode);
  });

  return textNodes;
}

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

function fetchTextStyles() {
  const textNodes = getTextNodes();
  const textStyleData:TextStyleData[] = [];
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

figma.ui.onmessage = (message) => {
  if (message.type === 'requestColorStyles') {
    fetchColorStyles();
  }
  if(message.type === 'requestTextStyles') {
    fetchTextStyles();
  }
};

/*
import { fetchColorStyles, fetchTextStyles } from "./styleUtils";
import { getTextNodes } from "./nodeUtils";

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 300, height: 500 });

figma.ui.onmessage = (message) => {
  if (message.type === 'requestColorStyles') {
    fetchColorStyles();
  }
  if(message.type === 'requestTextStyles') {
    const textNodes = getTextNodes();
    fetchTextStyles(textNodes);
  }
};
*/