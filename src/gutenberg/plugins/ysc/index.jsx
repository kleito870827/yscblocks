// Import CSS
import "./editor.scss";

// Internal Dependencies.
import getIcon from "../../utils/get-icon";
import { TemplatesModal } from "../templates";

const { Fragment } = wp.element;

const { __ } = wp.i18n;
const { Component } = wp.element;

const { PluginSidebar, PluginSidebarMoreMenuItem } = wp.editPost;
const { registerPlugin } = wp.plugins;

const { Button, PanelBody } = wp.components;

class YSC extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      isModalOpen: false
    };
  }

  render() {
    const { isModalOpen } = this.state;

    return (
      <Fragment>
        <PluginSidebarMoreMenuItem target="ysc">
          {__("YSC")}
        </PluginSidebarMoreMenuItem>
        <PluginSidebar name="ysc" title={__("YSC")}>
          <PanelBody className="plugin-ysc-panel">
            <Button
              className="plugin-ysc-panel-button"
              isDefault
              isLarge
              onClick={() => {
                this.setState({ isModalOpen: "templates" });
              }}
            >
              {getIcon("plugin-templates")}
              {__("Templates")}
            </Button>            
          </PanelBody>
        </PluginSidebar>
        {"templates" === isModalOpen ? (
          <TemplatesModal
            onRequestClose={() => this.setState({ isModalOpen: false })}
          />
        ) : (
          ""
        )}        
      </Fragment>
    );
  }
}

registerPlugin("ysc", {
  icon: <div className="ysc-plugin-icon">{getIcon("plugin-ysc")}</div>,
  render: YSC
});
