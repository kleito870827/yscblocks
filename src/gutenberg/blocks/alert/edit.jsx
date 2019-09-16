// External Dependencies.
import classnames from "classnames/dedupe";

// Internal Dependencies.
import ColorPicker from "../../components/color-picker";
import ApplyFilters from "../../components/apply-filters";
import IconPicker from "../../components/icon-picker";

const { applyFilters } = wp.hooks;
const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;
const {
  PanelBody,
  RangeControl,
  ToggleControl,
  Toolbar,
  DropdownMenu,
  TabPanel,
  ColorIndicator
} = wp.components;

const { InspectorControls, InnerBlocks, BlockControls } = wp.editor;

class Edit extends Component {
  render() {
    const { attributes, setAttributes } = this.props;

    let { className = "" } = this.props;

    const { color, hoverColor, icon, iconSize, hideButton } = attributes;

    className = classnames("ysc-alert", className);

    className = applyFilters("ysc.editor.className", className, this.props);

    return (
      <Fragment>
        <BlockControls>
          <Toolbar>
            <DropdownMenu
              icon="info"
              label={__("Type")}
              controls={[
                {
                  title: __("Primary"),
                  icon: "editor-help",
                  onClick: () => setAttributes({ color: "#2E77C3" })
                },
                {
                  title: __("Success"),
                  icon: "marker",
                  onClick: () => setAttributes({ color: "#22CF6E" })
                },
                {
                  title: __("Danger"),
                  icon: "dismiss",
                  onClick: () => setAttributes({ color: "#DC3232" })
                },
                {
                  title: __("Warning"),
                  icon: "warning",
                  onClick: () => setAttributes({ color: "#E47F3B" })
                },
                {
                  title: __("Info"),
                  icon: "info",
                  onClick: () => setAttributes({ color: "#2DC7E8" })
                }
              ]}
            />
          </Toolbar>
        </BlockControls>
        <InspectorControls>
          <PanelBody>
            <IconPicker
              label={__("Icon")}
              value={icon}
              onChange={value => setAttributes({ icon: value })}
            />
            <RangeControl
              label={__("Icon Size")}
              value={iconSize}
              onChange={value => setAttributes({ iconSize: value })}
              min={20}
              max={100}
              beforeIcon="editor-textcolor"
              afterIcon="editor-textcolor"
            />
          </PanelBody>
          <PanelBody>
            <ToggleControl
              label={__("Dismiss button")}
              checked={!!hideButton}
              onChange={val => setAttributes({ hideButton: val })}
            />
          </PanelBody>
          <PanelBody
            title={
              <Fragment>
                {__("Colors")}
                <ColorIndicator colorValue={color} />
              </Fragment>
            }
            initialOpen={false}
          >
            <TabPanel
              className="ysc-control-tabs"
              tabs={[
                {
                  name: "normal",
                  title: __("Normal"),
                  className: "ysc-control-tabs-tab"
                },
                {
                  name: "hover",
                  title: __("Hover"),
                  className: "ysc-control-tabs-tab"
                }
              ]}
            >
              {tabData => {
                const isHover = tabData.name === "hover";
                return (
                  <ApplyFilters
                    name="ysc.editor.controls"
                    attribute={isHover ? "hoverColor" : "color"}
                    props={this.props}
                  >
                    <ColorPicker
                      label={__("Color")}
                      value={isHover ? hoverColor : color}
                      onChange={val =>
                        setAttributes(
                          isHover ? { hoverColor: val } : { color: val }
                        )
                      }
                      alpha={true}
                    />
                  </ApplyFilters>
                );
              }}
            </TabPanel>
          </PanelBody>
        </InspectorControls>
        <div className={className}>
          {icon ? (
            <div className="ysc-alert-icon">
              <IconPicker.Dropdown
                onChange={value => setAttributes({ icon: value })}
                value={icon}
                renderToggle={({ onToggle }) => (
                  <IconPicker.Preview onClick={onToggle} name={icon} />
                )}
              />
            </div>
          ) : (
            ""
          )}
          <div className="ysc-alert-content">
            <InnerBlocks
              template={[
                [
                  "core/paragraph",
                  {
                    content: __(
                      "Wow, this is an important message, that you cannot miss!"
                    )
                  }
                ]
              ]}
              templateLock={false}
            />
          </div>
          {hideButton ? (
            <div className="ysc-alert-hide-button">
              <span className="fas fa-times" />
            </div>
          ) : (
            ""
          )}
        </div>
      </Fragment>
    );
  }
}

export default Edit;
