const sass = require("sass");

Object.defineProperty(exports, "__esModule", {
  value: true
});
module.exports.default = function({ types: t }) {
  return {
    visitor: {
      Program: {
        enter: () => {},
        exit: () => {}
      },
      TaggedTemplateExpression(path) {
        let node = path.node;
        if (node.tag.name === "$scss") {
          if (node.quasi.quasis.length !== 1) {
            throw new Error("There can only be one part in scss string");
          }
          let raw = node.quasi.quasis[0].value.raw;
          let value = sass
            .renderSync({ data: raw, outputStyle: "compressed" })
            .css.toString("utf-8");
          console.log(raw, value);
          node.quasi.quasis[0].value.raw = JSON.stringify(value).replace(
            /(^"|"$)/g,
            ""
          );
          node.quasi.quasis[0].value.cooked = value;
          // node.tag.name = "$css";
        }
      }
    }
  };
};
