import { fetchColorStyles, fetchTextStyles } from "./styleUtils";
import { getTextNodes } from "./nodeUtils";

figma.showUI(__html__, { width: 300, height: 500 });
//console.log("paints");
figma.ui.onmessage = (message) => {
  if (message.type === 'requestColorStyles') {
    fetchColorStyles();
  }
  if(message.type === 'requestTextStyles' || message.type === 'requestPrimaryTextStyles') {
    const textNodes = getTextNodes();
    fetchTextStyles(textNodes, message.type);
  }
};