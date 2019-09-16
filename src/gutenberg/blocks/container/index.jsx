// Import CSS
import "./style.scss";
import "./editor.scss";

/**
 * External dependencies
 */
import classnames from "classnames";

// Internal Dependencies.
import getIcon from "../../utils/get-icon";

import edit from "./edit";

const { applyFilters } = wp.hooks;
const { __ } = wp.i18n;

const { InnerBlocks } = wp.editor;

export const name = "ysc/container";

export const settings = {
  title: __("Container"),
  description: __("Containers are the most basic layout element."),
  icon: getIcon("block-container", true),
  category: "ysc",
  keywords: [__("container"), __("layout")],
  ysc: {
    supports: {
      spacings: true,
      display: true,
      scrollReveal: true
    }
  },
  supports: {
    html: false,
    className: false,
    anchor: true
  },
  attributes: {
    containers: {
      type: "string",
      default: ""
    }
  },

  getEditWrapperProps(attributes) {
    if (!attributes.containers) {
      return { "data-align": "full" };
    }
    return { "data-align": attributes.containers };
  },

  edit,

  save: function(props) {
    const { attributes } = props;
    const { containers } = attributes;
    let className = "ysc-container-block";

    const layout = {
      "ysc-container": containers === "wide",
      "ysc-container-fluid": containers === "full"
    };

    className = applyFilters("ysc.blocks.className", className, {
      ...{
        name
      },
      ...props
    });
    const wrapperClasses = classnames(layout, className);
    return (
      <div className={wrapperClasses}>
        <InnerBlocks.Content />
      </div>
    );
  }
};
