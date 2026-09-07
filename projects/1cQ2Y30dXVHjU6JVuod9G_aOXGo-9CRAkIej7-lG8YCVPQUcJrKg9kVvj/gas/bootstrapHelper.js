stack = [];
function peek(){
  return stack[stack.length-1];
}

function pop(){
  var x = stack.pop();
  return x;
}

function push(x){
  stack.push();
}

function beginContainer(classes) {
  if(classes === undefined) {
    classes = [];
  }
  classes.unshift("container");
  push("container");
  return '<div class="' + classes.join(" ") + '">';
}

function endContainer(){
  if(peek() == "container") {
    pop();
    return "</div>";
  }
  throw "abnormal elementStack";
}

function beginPanel(classes){
  if(classes === undefined) {
    classes = [];
  }
  classes.unshift("panel");
  if(peek() == "panel") {
    endPanel();
  }
  if(peek() == "container") {
    push("panel");
    return '<div class="' + classes.join(" ") + '">';
  }
}

function endPanel(){
  if(peek() == "panel") {
    pop();
    return "</div>";
  }
}
