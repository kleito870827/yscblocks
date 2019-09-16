// Import CSS
import "./style.scss";
import "./editor.scss";

// Internal Dependencies.
import getIcon from "../../utils/get-icon";

import IconPicker from "../../components/icon-picker";
import edit from "./edit";

import transforms from "./transforms";

const { applyFilters } = wp.hooks;
const { __ } = wp.i18n;

const { InnerBlocks } = wp.editor;

export const name = "ysc/alert";

export const settings = {
  title: __("Alert"),
  description: __("Provide contextual feedback messages for user actions."),
  icon: getIcon("block-alert", true),
  category: "ysc",
  keywords: [__("alert"), __("notification")],
  ysc: {
    customStylesCallback(attributes) {
      const styles = {
        borderLeftColor: attributes.color,
        ".ysc-alert-icon": {
          fontSize: attributes.iconSize,
          color: attributes.color
        }
      };

      if (attributes.hoverColor) {
        styles["&:hover"] = {
          borderLeftColor: attributes.hoverColor,
          ".ysc-alert-icon": {
            color: attributes.hoverColor
          }
        };
      }

      return styles;
    },
    supports: {
      styles: true,
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
    color: {
      type: "string",
      default: "#E47F3B"
    },
    hoverColor: {
      type: "string"
    },
    icon: {
      type: "string",
      default: "fas fa-exclamation-circle"
    },
    iconSize: {
      type: "number",
      default: 17
    },
    hideButton: {
      type: "boolean",
      default: false
    }
  },

  edit,

  save: function(props) {
    const { icon, hideButton } = props.attributes;

    let className = "ysc-alert";

    className = applyFilters("ysc.blocks.className", className, {
      ...{
        name
      },
      ...props
    });

    return (
      <div className={className}>
        {icon ? (
          <div className="ysc-alert-icon">
            <IconPicker.Render name={icon} />
          </div>
        ) : (
          ""
        )}
        <div className="ysc-alert-content">
          <InnerBlocks.Content />
        </div>
        {hideButton ? (
          <div className="ysc-alert-hide-button">
            <span className="fas fa-times" />
          </div>
        ) : (
          ""
        )}
      </div>
    );
  },

  transforms
};
