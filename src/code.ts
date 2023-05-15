import { fetchColorStyles, fetchTextStyles } from "./styleUtils";
import { getTextNodes } from "./nodeUtils";

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