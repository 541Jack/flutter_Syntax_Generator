export function findTextNodes(node: SceneNode): TextNode[] {
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
    
    export function getTextNodes(): TextNode[] {
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
    
  
  
  
    