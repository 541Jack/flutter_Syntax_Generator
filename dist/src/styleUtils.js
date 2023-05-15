import { blendColorsFlutter, getColorFlutter } from "../../colorUtils";
import { getSpacing, getLineHeight } from "./nodeUtils";
export function getSolidPaints(style) {
    const solidPaints = [];
    style.paints.forEach((paint) => {
        if (paint.type === "SOLID") {
            solidPaints.push(paint);
        }
    });
    return solidPaints;
}
export function getColor(paintStyle) {
    const paints = [];
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
export function fetchTextStyles(textNodes) {
    const textStyleData = [];
    textNodes.forEach(node => {
        let colorAssigned;
        let family;
        if (node.fills !== figma.mixed) {
            colorAssigned = getColorFlutter(node.fills);
        }
        if (node.fontName !== figma.mixed) {
            family = node.fontName.family;
        }
        let fontSize;
        if (node.fontSize !== figma.mixed) {
            fontSize = node.fontSize;
        }
        let fontWeight;
        if (node.fontWeight !== figma.mixed) {
            fontWeight = node.fontWeight;
        }
        let decoration;
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
        });
    });
    figma.ui.postMessage({ type: 'textStyles', data: textStyleData });
}
