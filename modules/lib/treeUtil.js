function walkArray(node, visitor) {

  for (var i = 0; i < node.children.length; i++) {
    var treeNode = node.children[i];
    visitor(treeNode);
    if (treeNode.children) {
      walkArray(treeNode, visitor);
    }
  }

}

function flattenArray(root) {

  const flatten = [];

  walkArray(root, function(node) {
    flatten.push(node);
  });

  return flatten;

}

exports.walkArray = walkArray;


exports.flattenArray = flattenArray;

exports.findPrevNextById = function(root, id) {

  var flatten = flattenArray(root);

  var node, i;

  for (i = 0; i < flatten.length; i++) {
    node = flatten[i];
    if (node._id.toString() == id.toString()) break;
  }

  if (node._id.toString() != id.toString()) {
    throw new Error("Id is not in the tree: " + id);
  }

  var nextNum = i + 1, next;
  while(true) {
    if (!flatten[nextNum]) break; // array finished, no next, sorry
    if (!flatten[nextNum].parent) break; // next item is a root of another tree, search finished
    if (flatten[nextNum].isFolder) { // next item is a folder, go down
      nextNum++;
      continue;
    }
    next = flatten[nextNum];
    break;
  }

  var prevNum = i - 1, prev;
  while(true) {
    if (!flatten[prevNum]) break;
    if (!flatten[prevNum].parent) break;
    if (flatten[prevNum].isFolder) {
      prevNum--;
      continue;
    }
    prev = flatten[prevNum];
    break;
  }


  return { next: next, prev: prev };
};
