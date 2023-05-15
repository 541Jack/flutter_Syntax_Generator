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
  
  export function blendColorsFlutter(colors: SolidPaint[]) {
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
  
  export function getColorFlutter(paintsInput: ReadonlyArray<Paint>) {
    const paints: SolidPaint[] = [];
    for (const paint of paintsInput) {
      if (paint.type === "SOLID") {
        paints.push(paint as SolidPaint);
      }
    }
    return blendColorsFlutter(paints);
  }
  