/**
 * Store
 */
import "./store";

/**
 * Blocks
 */
import "./blocks";

/**
 * Extensions
 */
import "./extend";

/**
 * Plugins
 */
import "./plugins";

/**
 * Icon
 */
import YSCCategoryIcon from "./icons/ysc-category.svg";

/**
 * Internal dependencies
 */
const { updateCategory } = wp.blocks;

/**
 * Add category icon.
 */
if (updateCategory) {
  updateCategory("ysc", {
    icon: (
      <YSCCategoryIcon
        style={{
          color: "#006159",
          width: "20px",
          height: "20px",
          marginLeft: "7px",
          marginTop: "-1px"
        }}
        className="components-panel__icon"
      />
    )
  });
}
