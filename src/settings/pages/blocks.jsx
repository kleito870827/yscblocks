import classnames from "classnames/dedupe";
import { Component, Fragment } from "react";
import PropTypes from "prop-types";
import deepAssign from "deep-assign";
import { debounce } from "throttle-debounce";

import "./blocks.scss";
import Info from "../components/info.jsx";
import Tooltip from "../components/tooltip.jsx";
import ToggleControl from "../components/toggle.jsx";

const { apiFetch } = wp;

const { __, sprintf } = wp.i18n;

const { YSC } = window;

// register core Gutenberg blocks.
if (wp.blockLibrary && wp.blockLibrary.registerCoreBlocks) {
  wp.blockLibrary.registerCoreBlocks();
}

export default class Blocks extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeCategory: false,
      disabledBlocks: YSC.disabledBlocks || {}
    };

    this.updateDisabledBlocks = this.updateDisabledBlocks.bind(this);
    this.updateDisabledBlocksDebounce = debounce(
      1000,
      this.updateDisabledBlocksDebounce.bind(this)
    );
    this.getBlocksCategories = this.getBlocksCategories.bind(this);
    this.getBlocksFromCategory = this.getBlocksFromCategory.bind(this);
    this.getDisabledBlock = this.getDisabledBlock.bind(this);
    this.setDisabledBlock = this.setDisabledBlock.bind(this);
    this.setDisabledAllBlocks = this.setDisabledAllBlocks.bind(this);
    this.getDisabledCount = this.getDisabledCount.bind(this);
  }

  componentDidMount() {
    const categories = this.getBlocksCategories();
    let activeCategory = categories[0].slug;

    categories.forEach(cat => {
      if ("ysc" === cat.slug) {
        activeCategory = "ysc";
      }
    });

    this.setState({
      activeCategory: activeCategory
    });
  }

  updateDisabledBlocks(newBlocks) {
    const allBlocks = deepAssign({}, this.state.disabledBlocks, newBlocks);

    this.setState(
      {
        disabledBlocks: allBlocks
      },
      () => {
        this.updateDisabledBlocksDebounce();
      }
    );
  }

  updateDisabledBlocksDebounce() {
    apiFetch({
      path: "/ysc/v1/update_disabled_blocks",
      method: "POST",
      data: {
        blocks: this.state.disabledBlocks
      }
    }).then(result => {
      if (!result.success || !result.response) {
        // eslint-disable-next-line
        console.log(result);
      }
    });
  }

  getBlocksCategories() {
    const categories = wp.blocks.getCategories();

    // Move YSC category to the fist place
    categories.sort(function(x, y) {
      if (x.slug === "ysc") {
        return -1;
      } else if (y.slug === "ysc") {
        return 1;
      }
      return 0;
    });

    return categories;
  }

  getBlocksFromCategory(category) {
    const result = {};

    if (category) {
      const blocks = wp.blocks.getBlockTypes();
      blocks.forEach(block => {
        if (
          // blocks from needed category only
          block.category === category &&
          // prevent adding blocks with parent option (fe Grid Column).
          !(block.parent && block.parent.length) &&
          // prevent showing blocks with disabled inserter.
          !(
            block.supports &&
            typeof block.supports.inserter !== "undefined" &&
            !block.supports.inserter
          )
        ) {
          let icon = block.icon.src ? block.icon.src : block.icon;

          // Prepare icon.
          if (typeof icon === "function") {
            icon = wp.element.renderToString(icon());
          } else if (typeof icon === "object") {
            icon = wp.element.renderToString(icon);
          } else if (typeof icon === "string") {
            icon = wp.element.createElement(wp.components.Dashicon, {
              icon: icon
            });
            icon = wp.element.renderToString(icon);
          }

          result[block.name] = {
            ...block,
            ...{ icon }
          };
        }
      });
    }

    return result;
  }

  getDisabledBlock(data) {
    let result = false;

    if (typeof this.state.disabledBlocks[data.name] !== "undefined") {
      result = this.state.disabledBlocks[data.name];
    }

    return result;
  }

  setDisabledBlock(data) {
    this.updateDisabledBlocks({
      [data.name]: !this.getDisabledBlock(data)
    });
  }

  setDisabledAllBlocks(disabled) {
    const { activeCategory } = this.state;

    const disabledBlocks = {};

    const blocks = this.getBlocksFromCategory(activeCategory);
    Object.keys(blocks).forEach(name => {
      const block = blocks[name];
      disabledBlocks[block.name] = !disabled;
    });

    this.updateDisabledBlocks(disabledBlocks);
  }

  getDisabledCount(blocks) {
    let result = 0;

    Object.keys(blocks).forEach(name => {
      if (this.getDisabledBlock(blocks[name])) {
        result += 1;
      }
    });

    return result;
  }

  render() {
    const { activeCategory, disabledBlocks } = this.state;

    const blocks = this.getBlocksFromCategory(activeCategory);
    const categories = this.getBlocksCategories();
    const resultTabs = [];
    const resultBlocks = [];

    let count = 0;
    const disabledCount = this.getDisabledCount(blocks);

    // category content.
    Object.keys(blocks).forEach(name => {
      const block = blocks[name];

      count += 1;

      resultBlocks.push(
        <li
          className={classnames(
            "ysc-settings-blocks-item",
            disabledBlocks[block.name]
              ? "ysc-settings-blocks-item-disabled"
              : ""
          )}
          key={block.name}
        >
          <h3>
            <span
              className="ysc-settings-blocks-item-icon"
              dangerouslySetInnerHTML={{ __html: block.icon }}
            />
            {block.title}
          </h3>
          {block.description ? (
            <div className="ysc-settings-blocks-item-description">
              {block.description}
            </div>
          ) : (
            ""
          )}
          {block.ysc && block.ysc.previewUrl ? (
            <div className="ysc-settings-blocks-item-preview-url">
              <a href={block.ysc.previewUrl}>{__("Preview")}</a>
            </div>
          ) : (
            ""
          )}
          <Tooltip
            text={
              this.getDisabledBlock(block)
                ? __("Enable Block")
                : __("Disable Block")
            }
          >
            <div className="ysc-settings-blocks-item-check">
              <ToggleControl
                checked={!this.getDisabledBlock(block)}
                onChange={() => {
                  this.setDisabledBlock(block);
                }}
              />
            </div>
          </Tooltip>
        </li>
      );
    });

    // categories tabs.
    categories.forEach(cat => {
      const disabledCurrentCount = this.getDisabledCount(
        this.getBlocksFromCategory(cat.slug)
      );
      const categoryContent = (
        <li key={`tab-${cat.slug}`}>
          <button
            className={classnames(
              "ysc-settings-blocks-categories-button",
              activeCategory === cat.slug
                ? "ysc-settings-blocks-categories-button-active"
                : ""
            )}
            onClick={() => {
              this.setState({
                activeCategory: cat.slug
              });
            }}
          >
            {cat.title}
            {disabledCurrentCount ? (
              <span className="ysc-settings-blocks-categories-button-indicator" />
            ) : (
              ""
            )}
          </button>
        </li>
      );

      if (disabledCurrentCount) {
        resultTabs.push(
          <Tooltip
            text={sprintf(__("Disabled Blocks: %s"), disabledCurrentCount)}
            key="tab-disabled-blocks"
          >
            {categoryContent}
          </Tooltip>
        );
      } else {
        resultTabs.push(categoryContent);
      }
    });

    if (!count) {
      resultBlocks.push(
        <Info key="no-blocks">{__("No blocks in selected category.")}</Info>
      );
    }

    return (
      <Fragment>
        <div className="ysc-settings-blocks">
          <div className="ysc-settings-blocks-left" />
          <div className="ysc-settings-blocks-right">
            <div
              className={classnames(
                "ysc-settings-blocks-items-head",
                !count ? "ysc-settings-blocks-items-head-hidden" : ""
              )}
            >
              <span className="ysc-settings-blocks-items-head-count">
                {sprintf(__("Blocks: %s"), count)}
              </span>
              <Tooltip
                text={
                  disabledCount !== count
                    ? __("Disable All Blocks")
                    : __("Enable All Blocks")
                }
              >
                <div
                  className={classnames(
                    "ysc-settings-blocks-all-check",
                    disabledCount !== 0 && disabledCount !== count
                      ? "ysc-settings-blocks-check-gray"
                      : ""
                  )}
                >
                  <ToggleControl
                    checked={disabledCount !== count}
                    onChange={() => {
                      this.setDisabledAllBlocks(!(disabledCount !== count));
                    }}
                  />
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="ysc-settings-blocks">
          <div className="ysc-settings-blocks-left">
            <ul className="ysc-settings-blocks-categories">{resultTabs}</ul>
          </div>
          <div className="ysc-settings-blocks-right">
            <ul className="ysc-settings-blocks-items">{resultBlocks}</ul>
          </div>
        </div>
      </Fragment>
    );
  }
}

Blocks.propTypes = {
  data: PropTypes.object
};
