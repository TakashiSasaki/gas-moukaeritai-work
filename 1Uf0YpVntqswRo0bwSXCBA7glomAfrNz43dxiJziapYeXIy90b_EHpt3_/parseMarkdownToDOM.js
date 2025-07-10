/**
 * Parses Markdown text and returns a DocumentFragment
 * containing the corresponding DOM nodes.
 * 
 * This function handles:
 * - Code blocks (``` delimited)
 * - Display math blocks (lines wrapped with $$)
 * - Headings (lines starting with one or more #)
 * - Unordered lists (lines starting with "-" or "*")
 * - Numbered lists (lines starting with "1. ", etc.)
 * - Inline markdown for code, bold, italic, links, and inline math.
 */
function parseMarkdownToDOM(markdown) {
  var fragment = document.createDocumentFragment();
  var lines = markdown.split("\n");
  var inCodeBlock = false;
  var codeBlockContent = [];
  var currentList = null; // track current list container (UL or OL)

  // Loop through each line
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var trimmedLine = line.trim();

    // Handle code block start/end markers (```).
    if (trimmedLine.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockContent = [];
      } else {
        inCodeBlock = false;
        var pre = document.createElement("pre");
        pre.textContent = codeBlockContent.join("\n");
        pre.style.fontFamily = "Courier New";
        fragment.appendChild(pre);
      }
      // Reset any open list
      currentList = null;
      continue;
    }
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Handle display math: line starts and ends with $$.
    if (trimmedLine.startsWith("$$") && trimmedLine.endsWith("$$") && trimmedLine.length > 4) {
      var mathText = trimmedLine.substring(2, trimmedLine.length - 2).trim();
      var mathDiv = document.createElement("div");
      mathDiv.className = "display-math";
      // In a real app you might hand off mathText to MathJax for rendering.
      mathDiv.textContent = mathText;
      fragment.appendChild(mathDiv);
      currentList = null;
      continue;
    }

    // Handle headings: lines starting with #.
    if (trimmedLine.startsWith("#")) {
      var headingLevel = trimmedLine.match(/^#+/)[0].length;
      headingLevel = Math.min(Math.max(headingLevel, 1), 6); // ensure 1 <= level <= 6
      var headingText = trimmedLine.replace(/^#+\s*/, '');
      var heading = document.createElement("h" + headingLevel);
      heading.appendChild(parseInlineMarkdown(headingText));
      fragment.appendChild(heading);
      currentList = null;
      continue;
    }

    // Handle numbered lists (e.g., "1. List item") and unordered lists ("- item" or "* item").
    if (trimmedLine.match(/^\d+\.\s/) || trimmedLine.match(/^[-*]\s/)) {
      var isNumbered = !!trimmedLine.match(/^\d+\.\s/);
      var listItemText = trimmedLine.replace(isNumbered ? /^\d+\.\s+/ : /^[-*]\s+/, '');
      
      // If the previous element is the same type of list, then reuse it.
      if (currentList && currentList.tagName === (isNumbered ? "OL" : "UL")) {
        // no need to create a new list element
      } else {
        // Otherwise, create a new list container.
        currentList = document.createElement(isNumbered ? "OL" : "UL");
        fragment.appendChild(currentList);
      }
      var li = document.createElement("li");
      li.appendChild(parseInlineMarkdown(listItemText));
      currentList.appendChild(li);
      continue;
    } else {
      // End any running list if the current line is not a list item.
      currentList = null;
    }

    // For other lines, process inline markdown and wrap in a paragraph.
    if (trimmedLine !== "") {
      var p = document.createElement("p");
      p.appendChild(parseInlineMarkdown(line));
      fragment.appendChild(p);
    }
  }
  
  return fragment;
}

/**
 * Processes inline Markdown syntax within a text string and returns a DOM subtree.
 * 
 * This function converts:
 * - Inline code: `code` → <code>code</code>
 * - Bold: **bold** → <strong>bold</strong>
 * - Italic: *italic* → <em>italic</em>
 * - Links: [text](url) → <a href="url" target="_blank">text</a>
 * - Inline math: $math$ → <span class="inline-math">math</span>
 */
function parseInlineMarkdown(text) {
  // Create a temporary container element.
  var container = document.createElement("span");
  // Escape HTML to avoid XSS issues.
  text = text.replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;");

  // Use simple regex replacements to handle inline elements.
  // For a full-featured solution, consider using a Markdown parser library.
  text = text
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    // Links
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Inline math (wrap in a span; MathJax can process it later)
    .replace(/\$([^$]+)\$/g, '<span class="inline-math">$1</span>');

  container.innerHTML = text;
  return container;
}
