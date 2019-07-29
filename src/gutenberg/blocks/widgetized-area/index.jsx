// Import CSS
import "./editor.scss";
import classnames from "classnames/dedupe";

// Internal Dependencies.
import getIcon from "../../utils/get-icon";

const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;
const { Placeholder, SelectControl } = wp.components;

const { YSC } = window;

class WidgetizedAreaBlock extends Component {
  render() {
    const { setAttributes, attributes } = this.props;

    let { className } = this.props;

    const { id } = attributes;

    className = classnames("ysc-widgetized-area", className);

    return (
      <Fragment>
        <Placeholder
          icon={getIcon("block-widgetized-area")}
          label={__("Widgetized Area")}
          className={className}
        >
          <SelectControl
            value={id}
            onChange={value => setAttributes({ id: value })}
            options={(() => {
              const sidebars = [
                {
                  label: __("--- Select sidebar ---"),
                  value: ""
                }
              ];

              if (YSC.sidebars) {
                Object.keys(YSC.sidebars).forEach(k => {
                  sidebars.push({
                    label: YSC.sidebars[k].name,
                    value: YSC.sidebars[k].id
                  });
                });
              }

              return sidebars;
            })()}
          />
        </Placeholder>
      </Fragment>
    );
  }
}

export const name = "ysc/widgetized-area";

export const settings = {
  title: __("Widgetized Area"),
  description: __("Select registered sidebars and put it in any place."),
  icon: getIcon("block-widgetized-area", true),
  category: "ysc",
  keywords: [__("widget"), __("sidebar")],
  supports: {
    html: false,
    className: false,
    align: ["wide", "full"]
  },
  attributes: {
    id: {
      type: "string"
    }
  },

  edit: WidgetizedAreaBlock,

  save: function() {
    return null;
  }
};
