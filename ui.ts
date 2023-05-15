    // Select the ul tag
    const stylesListElement = document.getElementById("styles-list");
  
    // Handle incoming message from code.ts

    function requestColorStyles() {
      window.parent.postMessage({ pluginMessage: { type: 'requestColorStyles' } }, '*');
    }
    function requestTextStyles() {
      window.parent.postMessage({ pluginMessage: { type: 'requestTextStyles' } }, '*');
    }
    function parseVarName(input: string): string {
        return input
            // Replace special characters with a space
            .replace(/[^a-zA-Z0-9]/g, ' ')
            // Replace multiple spaces with a single space
            .replace(/ +/g, ' ')
            // Split the string into words
            .split(' ')
            // Split further each word on number boundaries
            .flatMap(word => word.split(/(?<=[a-zA-Z])(?=\d)|(?<=\d)(?=[a-zA-Z])/))
            // Convert all but the first word to start with a capital letter
            .map((part, index) => index === 0 ? part.toLowerCase() : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            // Join the words together without spaces
            .join('');
    }
    function calculateHeight(lineHeight: number, fontSize: number): number {
        return lineHeight / fontSize
    }
    onmessage = ({ data: { pluginMessage } }) => {
      let resultString = "";
      if (pluginMessage.type === "colorStyles") {
        const styleData = pluginMessage.data;
        for (let style of styleData) {
          resultString = resultString + `<li> static const Color ${style.name} = Color(${style.color})</li>`;
        }
      }
      if (pluginMessage.type === "textStyles") {
        console.log('sdfasdfasdfasdfs');
        const styleData = pluginMessage.data;
        const varName = parseVarName(styleData.name);

        console.log(varName);
        for (let style of styleData) {
        const roundedNumber = style.letterSpacing.toFixed(1);
          resultString += `<code><pre>
static TextStyle ${varName} () {
  return TextStyle(
    fontSize: ${style.fontSize},
    letterSpacing: ${style.letterSpacing},
    height: ${style.Height},
    fontWeight: FontWeight.w${style.fontWeight},
    decoration: TextDecoration.${style.decoration},
    color: Color(${style.color}),
    fontFamily: '${style.fontFamily}'
  );
}<\pre><\code>`;
        }
      }
      if (stylesListElement !== null) {
        stylesListElement.innerHTML = resultString;
      }    
    };