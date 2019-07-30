// Import CSS
import "./editor.scss";

// External Dependencies.
import classnames from "classnames/dedupe";

// Internal Dependencies.
import getIcon from "../../../utils/get-icon";

const { applyFilters } = wp.hooks;
const { __, sprintf } = wp.i18n;
const { Component, Fragment } = wp.element;
const { PanelBody, RangeControl, SelectControl } = wp.components;

const { RichText, InspectorControls, InnerBlocks } = wp.editor;

/**
 * Returns the layouts configuration for a given number of tabs.
 *
 * @param {number} attributes tabs attributes.
 *
 * @return {Object[]} Tabs layout configuration.
 */
const getTabsTemplate = attributes => {
  const { tabsCount } = attributes;
  const result = [];

  for (let k = 1; k <= tabsCount; k++) {
    result.push(["ysc/tabs-tab", { tabNumber: k }]);
  }

  return result;
};

const getTabs = ({ tabsCount, tabsSettings }) => {
  const result = [];

  for (let k = 1; k <= tabsCount; k++) {
    result.push({
      label: tabsSettings["tab_" + k]
        ? tabsSettings["tab_" + k].label
        : sprintf(__("Tab %d"), k),
      number: k
    });
  }

  return result;
};

class TabsBlock extends Component {
  render() {
    const { attributes, setAttributes } = this.props;

    let { className = "" } = this.props;

    const { tabsCount, tabActive, tabsSettings, buttonsAlign } = attributes;

    const tabs = getTabs(attributes);

    className = classnames(className, "ysc-tabs ysc-tabs-legacy");

    className = applyFilters("ysc.editor.className", className, this.props);

    return (
      <Fragment>
        <InspectorControls>
          <PanelBody>
            <div className="ysc-alert" style={{ borderLeftColor: "#de9116" }}>
              <div className="ysc-alert-content">
                {__(
                  "This Tabs block has a legacy structure. To use new tabs, add it again from blocks inserter."
                )}
              </div>
            </div>
          </PanelBody>
          <PanelBody>
            <RangeControl
              label={__("Tabs")}
              value={tabsCount}
              onChange={value => setAttributes({ tabsCount: value })}
              min={1}
              max={6}
            />
            <SelectControl
              label={__("Tabs align")}
              value={buttonsAlign}
              options={[
                {
                  value: "start",
                  label: __("Start")
                },
                {
                  value: "center",
                  label: __("Center")
                },
                {
                  value: "end",
                  label: __("End")
                }
              ]}
              onChange={value => setAttributes({ buttonsAlign: value })}
            />
          </PanelBody>
        </InspectorControls>
        <div className={className} data-tab-active={tabActive}>
          <div
            className={classnames(
              "ysc-tabs-buttons",
              `ysc-tabs-buttons-align-${buttonsAlign}`
            )}
          >
            {tabs.map(val => {
              const selected = tabActive === val.number;

              return (
                <RichText
                  tagName="div"
                  data-tab={val.number}
                  className={classnames(
                    "ysc-tabs-buttons-item",
                    selected ? "ysc-tabs-buttons-item-active" : ""
                  )}
                  placeholder={__("Tab label")}
                  value={val.label}
                  unstableOnFocus={() =>
                    setAttributes({ tabActive: val.number })
                  }
                  onChange={value => {
                    if (typeof tabs[val.number - 1] !== "undefined") {
                      if (
                        typeof tabsSettings[`tab_${val.number}`] === "undefined"
                      ) {
                        tabsSettings[`tab_${val.number}`] = {};
                      }
                      tabsSettings[`tab_${val.number}`].label = value;
                      setAttributes({
                        tabsSettings: Object.assign({}, tabsSettings)
                      });
                    }
                  }}
                  formattingControls={["bold", "italic", "strikethrough"]}
                  keepPlaceholderOnFocus
                  key={`tab_button_${val.number}`}
                />
              );
            })}
          </div>
          <div className="ysc-tabs-content">
            <InnerBlocks
              template={getTabsTemplate(attributes)}
              templateLock="all"
              allowedBlocks={["ysc/tabs-tab"]}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}

export const name = "ysc/tabs";

export const settings = {
  title: __("Tabs (legacy)"),
  description: __("Tabs."),
  icon: getIcon("block-tabs", true),
  category: "ysc",
  keywords: [__("tabs"), __("tab"), __("ysc")],
  ysc: {
    supports: {
      styles: true,
      spacings: true,
      display: true,
      scrollReveal: true
    }
  },
  supports: {
    inserter: false,
    html: false,
    className: false,
    anchor: true
  },
  attributes: {
    tabsCount: {
      type: "number",
      default: 2
    },
    tabActive: {
      type: "number",
      default: 1
    },
    tabsSettings: {
      type: "object",
      default: {}
    },
    buttonsAlign: {
      type: "string",
      default: "start"
    }
  },

  edit: TabsBlock,

  save: function(props) {
    const { tabsCount, tabActive, buttonsAlign } = props.attributes;

    let className = `ysc-tabs ysc-tabs-${tabsCount}`;

    className = applyFilters("ysc.blocks.className", className, {
      ...{
        name
      },
      ...props
    });

    const tabs = getTabs(props.attributes);

    return (
      <div className={className} data-tab-active={tabActive}>
        <div
          className={classnames(
            "ysc-tabs-buttons",
            `ysc-tabs-buttons-align-${buttonsAlign}`
          )}
        >
          {tabs.map(val => {
            return (
              <RichText.Content
                tagName="a"
                data-tab={val.number}
                href={`#tab-${val.number}`}
                className="ysc-tabs-buttons-item"
                key={`tab_button_${val.number}`}
                value={val.label}
              />
            );
          })}
        </div>
        <div className="ysc-tabs-content">
          <InnerBlocks.Content />
        </div>
      </div>
    );
  }
};
