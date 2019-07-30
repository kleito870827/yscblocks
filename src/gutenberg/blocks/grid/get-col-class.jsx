// External Dependencies.
import classnames from "classnames/dedupe";

const { applyFilters } = wp.hooks;

/**
 * Returns the ready to use className for grid column.
 *
 * @param {object} props - block properties.
 *
 * @return {String} Classname for Grid container.
 */
export default function getColClass(props) {
  const { attributes } = props;
  let result = "ysc-col";

  Object.keys(attributes).map(key => {
    if (attributes[key]) {
      let prefix = key.split("_")[0];
      let type = key.split("_")[1];

      if (!type) {
        type = prefix;
        prefix = "";
      }

      if (
        type &&
        (type === "size" || type === "order" || type === "verticalAlign")
      ) {
        prefix = prefix ? `-${prefix}` : "";

        switch (type) {
          case "size":
            type = "";
            break;
          case "order":
            type = `-${type}`;
            break;
          case "verticalAlign":
            type = "-align-self";
            break;
        }

        result = classnames(
          result,
          `ysc-col${type}${prefix || ""}${
            attributes[key] !== "auto" ? `-${attributes[key]}` : ""
          }`
        );
      }
    }
  });

  result = applyFilters("ysc.editor.className", result, props);

  return result;
}
