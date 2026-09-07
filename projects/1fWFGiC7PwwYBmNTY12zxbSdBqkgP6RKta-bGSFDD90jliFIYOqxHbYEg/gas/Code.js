// DocImageResizer.gs

// onHomepage: Displays a card with input and buttons
function onHomepage(e) {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle("DocImageResizer"))
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextParagraph().setText(
            "Enter the target height in pixels. Images with a height less than or equal to the target will be ignored."
          )
        )
        .addWidget(
          CardService.newTextInput()
            .setFieldName("targetHeight")
            .setTitle("Target Height (px)")
            .setHint("e.g., 200")
            .setValue("200")
        )
        .addWidget(
          CardService.newTextButton()
            .setText("Resize images")
            .setOnClickAction(CardService.newAction().setFunctionName("resizeImages"))
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        )
        .addWidget(
          CardService.newButtonSet()
            .addButton(CardService.newTextButton()
              .setText("Move images to top")
              .setOnClickAction(CardService.newAction().setFunctionName("moveImagesToTop")))
            .addButton(CardService.newTextButton()
              .setText("Move images to bottom")
              .setOnClickAction(CardService.newAction().setFunctionName("moveImagesToBottom")))
        )
    )
    .build();
}

// Resize images in selection if any, otherwise entire doc
function resizeImages(e) {
  var targetHeight = parseInt(e.formInputs.targetHeight[0], 10) || 200;
  var selection = DocumentApp.getActiveDocument().getSelection();

  if (selection) {
    var elements = selection.getRangeElements();
    elements.forEach(function(rangeElement) {
      resizeImagesInElement(rangeElement.getElement(), targetHeight);
    });
  } else {
    var body = DocumentApp.getActiveDocument().getBody();
    resizeImagesInElement(body, targetHeight);
  }

  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle("DocImageResizer"))
    .addSection(CardService.newCardSection().addWidget(
      CardService.newTextParagraph().setText("Images resized successfully.")))
    .build();
}

// Recursively resize images in element
function resizeImagesInElement(element, targetHeight) {
  if (element.getType() === DocumentApp.ElementType.INLINE_IMAGE) {
    var image = element.asInlineImage();
    if (image.getHeight() > targetHeight) {
      var newWidth = Math.round(image.getWidth() * targetHeight / image.getHeight());
      image.setHeight(targetHeight).setWidth(newWidth);
    }
  } else if (element.getNumChildren && typeof element.getNumChildren === 'function') {
    for (var i = 0; i < element.getNumChildren(); i++) {
      resizeImagesInElement(element.getChild(i), targetHeight);
    }
  }
}

// Move images to the top of the document
function moveImagesToTop() {
  moveImagesToPosition('top');
}

// Move images to the bottom of the document
function moveImagesToBottom() {
  moveImagesToPosition('bottom');
}

// Common logic to move images to top or bottom
function moveImagesToPosition(position) {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var selection = doc.getSelection();
  var images = [];

  if (selection) {
    selection.getRangeElements().forEach(function(rangeElement) {
      collectImages(rangeElement.getElement(), images);
    });
  } else {
    collectImages(body, images);
  }

  images.forEach(function(img) {
    var copy = img.copy();
    img.removeFromParent();
    if (position === 'top') {
      body.insertParagraph(0, '').appendInlineImage(copy);
    } else {
      body.appendParagraph('').appendInlineImage(copy);
    }
  });

  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle("DocImageResizer"))
    .addSection(CardService.newCardSection().addWidget(
      CardService.newTextParagraph().setText("Images moved to the " + position + " successfully.")))
    .build();
}

// Helper to collect inline images recursively
function collectImages(element, imagesArray) {
  if (element.getType() === DocumentApp.ElementType.INLINE_IMAGE) {
    imagesArray.push(element);
  } else if (element.getNumChildren && typeof element.getNumChildren === 'function') {
    for (var i = 0; i < element.getNumChildren(); i++) {
      collectImages(element.getChild(i), imagesArray);
    }
  }
}
