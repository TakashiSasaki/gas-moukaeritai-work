/**
 * Filename: Markdown.gs
 * Description: This script converts Markdown text—including headings, bullet and numbered lists,
 *              inline code, bold, italic, links, and math expressions (both display and inline)—
 *              into a formatted Google Document.
 *
 * Commit message: "Fixed DocumentApp.setActiveDocument usage; updated function to accept doc parameter."
 */

/**
 * Converts Markdown text to a formatted Google Document using the provided document.
 * @param {string} markdown - The Markdown text to be converted.
 * @param {Document} doc - The Google Document object to which the parsed content will be appended.
 */
function convertMarkdownToGoogleDocExtended(markdown, doc) {
  var body = doc.getBody();
  
  // Split the Markdown text into lines.
  var lines = markdown.split('\n');
  var inCodeBlock = false;
  var codeBlockContent = "";
  
  // Process each line.
  lines.forEach(function(line) {
    var trimmedLine = line.trim();
    
    // Handle code blocks (delimited by ```).
    if (trimmedLine.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockContent = "";
      } else {
        inCodeBlock = false;
        var codeParagraph = body.appendParagraph(codeBlockContent);
        codeParagraph.setFontFamily("Courier New");
      }
      return;
    }
    
    // If within a code block, accumulate the code lines.
    if (inCodeBlock) {
      codeBlockContent += line + "\n";
      return;
    }
    
    // Handle display math: a line starting and ending with $$.
    if (trimmedLine.startsWith("$$") && trimmedLine.endsWith("$$") && trimmedLine.length > 4) {
      var equationText = trimmedLine.substring(2, trimmedLine.length - 2).trim();
      body.appendEquation(equationText);
      return;
    }
    
    // Handle headings: lines starting with one or more '#' characters.
    if (trimmedLine.startsWith("#")) {
      var headingLevel = trimmedLine.match(/^#+/)[0].length;
      var headingText = trimmedLine.replace(/^#+\s*/, '');
      var paragraph = body.appendParagraph(headingText);
      // Ensure heading level is between 1 and 6.
      headingLevel = Math.min(Math.max(headingLevel, 1), 6);
      paragraph.setHeading(DocumentApp.ParagraphHeading['HEADING' + headingLevel]);
      return;
    }
    
    // Handle list items: both numbered (e.g., "1. ") and unordered (e.g., "- " or "* ").
    if (trimmedLine.match(/^\d+\.\s/) || trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
      processListItem(trimmedLine, body);
      return;
    }
    
    // Handle inline math within a line.
    // This splits the line at each inline math expression delimited by a single pair of $ symbols.
    var segments = line.split(/(\$[^$]+\$)/g);
    segments.forEach(function(segment) {
      if (segment.match(/^\$[^$]+\$$/)) {
        // Remove the $ delimiters and append the equation.
        var inlineMath = segment.substring(1, segment.length - 1).trim();
        body.appendEquation(inlineMath);
      } else {
        // Append non-math segments as normal paragraphs, with inline formatting.
        if (segment.trim() !== "") {
          var paragraph = body.appendParagraph(segment);
          processInlineFormatting(paragraph.editAsText());
        }
      }
    });
  });
}

/**
 * Processes Markdown list items for both numbered and unordered lists.
 * @param {string} trimmedLine - A trimmed line representing a list item.
 * @param {Body} body - The Document body object.
 */
function processListItem(trimmedLine, body) {
  var listItem;
  // Handle numbered lists (e.g., "1. List item").
  if (trimmedLine.match(/^\d+\.\s/)) {
    var listText = trimmedLine.replace(/^\d+\.\s+/, '');
    listItem = body.appendListItem(listText);
    listItem.setGlyphType(DocumentApp.GlyphType.NUMBER);
  }
  // Handle unordered lists (e.g., "- List item" or "* List item").
  else if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
    var listText = trimmedLine.replace(/^[-*]\s+/, '');
    listItem = body.appendListItem(listText);
    listItem.setGlyphType(DocumentApp.GlyphType.BULLET);
  }
  
  // Apply inline formatting to the list item text.
  if (listItem) {
    processInlineFormatting(listItem.editAsText());
  }
}

/**
 * Processes inline formatting (bold, italic, inline code, and links) for a given Text element.
 * @param {Text} textElement - The Text element from the Google Document.
 */
function processInlineFormatting(textElement) {
  var text = textElement.getText();
  
  // Process inline code: text enclosed in single backticks.
  var inlineCodeRegex = /`([^`]+)`/g;
  var match;
  while ((match = inlineCodeRegex.exec(text)) !== null) {
    var start = match.index;
    var end = start + match[0].length - 1;  // Exclude the backticks.
    textElement.setFontFamily(start, end, "Courier New");
  }
  
  // Process bold text: text wrapped with **.
  var boldRegex = /\*\*([^*]+)\*\*/g;
  while ((match = boldRegex.exec(text)) !== null) {
    var boldText = match[1];
    var start = match.index;
    // Remove the ** markers and update the text.
    text = text.substring(0, start) + boldText + text.substring(start + match[0].length);
    textElement.setText(text);
    textElement.setBold(start, start + boldText.length - 1, true);
    boldRegex.lastIndex = start + boldText.length;
  }
  
  // Process italic text: text wrapped with a single *.
  var italicRegex = /\*([^*]+)\*/g;
  while ((match = italicRegex.exec(text)) !== null) {
    var italicText = match[1];
    var start = match.index;
    // Remove the * markers and update the text.
    text = text.substring(0, start) + italicText + text.substring(start + match[0].length);
    textElement.setText(text);
    textElement.setItalic(start, start + italicText.length - 1, true);
    italicRegex.lastIndex = start + italicText.length;
  }
  
  // Process links: [link text](url)
  var linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
  var newText = "";
  var lastIndex = 0;
  var linkRanges = [];
  while ((match = linkRegex.exec(text)) !== null) {
    newText += text.substring(lastIndex, match.index);
    var linkText = match[1];
    newText += linkText; // Insert only the display text.
    // Record the start and end positions for applying the link later.
    var startPos = newText.length - linkText.length;
    var endPos = newText.length - 1;
    linkRanges.push({ start: startPos, end: endPos, url: match[2] });
    lastIndex = match.index + match[0].length;
  }
  newText += text.substring(lastIndex);
  textElement.setText(newText);
  
  // Apply link URLs to the saved ranges.
  linkRanges.forEach(function(range) {
    textElement.setLinkUrl(range.start, range.end, range.url);
  });
}
