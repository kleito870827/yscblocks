import { Component, Fragment } from "react";
import PropTypes from "prop-types";
import deepAssign from "deep-assign";
import { debounce } from "throttle-debounce";

import "./settings.scss";
import ToggleControl from "../components/toggle.jsx";
import Spinner from "../components/spinner.jsx";
import CodeEditor from "../../gutenberg/components/code-editor";

const { apiFetch } = wp;

const { __ } = wp.i18n;

const { compose } = wp.compose;

const { withSelect, withDispatch } = wp.data;

const { YSC } = window;

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      settings: YSC.settings || {},
      customCSS: false,
      customJSHead: false,
      customJSFoot: false
    };

    this.maybePrepareCode = this.maybePrepareCode.bind(this);
    this.getSetting = this.getSetting.bind(this);
    this.updateSetting = this.updateSetting.bind(this);
    this.updateSettingsDebounce = debounce(
      1000,
      this.updateSettingsDebounce.bind(this)
    );
    this.updateCustomCode = this.updateCustomCode.bind(this);
    this.updateCustomCodeDebounce = debounce(
      1000,
      this.updateCustomCodeDebounce.bind(this)
    );
  }

  componentDidMount() {
    this.maybePrepareCode();
  }
  componentDidUpdate() {
    this.maybePrepareCode();
  }

  maybePrepareCode() {
    const { customCode = {} } = this.props;

    if (
      customCode &&
      false === this.state.customCSS &&
      false === this.state.customJSHead &&
      false === this.state.customJSFoot
    ) {
      this.setState({
        customCSS: customCode.ysc_custom_css || "",
        customJSHead: customCode.ysc_custom_js_head || "",
        customJSFoot: customCode.ysc_custom_js_foot || ""
      });
    }
  }

  getSetting(name, defaultVal) {
    let result = defaultVal;

    if (typeof this.state.settings[name] !== "undefined") {
      result = this.state.settings[name];
    }

    return result;
  }

  updateSetting(name, val) {
    const allSettings = deepAssign({}, this.state.settings, {
      [name]: val
    });

    this.setState(
      {
        settings: allSettings
      },
      () => {
        this.updateSettingsDebounce();
      }
    );
  }

  updateSettingsDebounce() {
    apiFetch({
      path: "/ysc/v1/update_settings",
      method: "POST",
      data: {
        settings: this.state.settings
      }
    }).then(result => {
      if (!result.success || !result.response) {
        // eslint-disable-next-line
        console.log(result);
      }
    });
  }

  updateCustomCode(name, val) {
    if (this.state[name] === val) {
      return;
    }

    this.setState(
      {
        [name]: val
      },
      () => {
        this.updateCustomCodeDebounce();
      }
    );
  }

  updateCustomCodeDebounce() {
    this.props.updateCustomCode({
      ysc_custom_css: this.state.customCSS,
      ysc_custom_js_head: this.state.customJSHead,
      ysc_custom_js_foot: this.state.customJSFoot
    });
  }

  render() {
    const { icons } = YSC;

    return (
      <div className="ysc-settings">
        {icons && Object.keys(icons).length ? (
          <Fragment>
            <h3>{__("Icons")}</h3>
            {Object.keys(icons).map(k => (
              <ToggleControl
                key={k}
                label={icons[k].name}
                checked={this.getSetting(`icon_pack_${k}`, true)}
                onChange={() => {
                  this.updateSetting(
                    `icon_pack_${k}`,
                    !this.getSetting(`icon_pack_${k}`, true)
                  );
                }}
              />
            ))}
            <h3>{__("CSS")}</h3>
            {false !== this.state.customCSS ? (
              <CodeEditor
                mode="css"
                onChange={value => {
                  this.updateCustomCode("customCSS", value);
                }}
                value={this.state.customCSS || ""}
                maxLines={20}
                minLines={5}
                height="300px"
              />
            ) : (
              <Spinner />
            )}
            <h3>{__("JavaScript")}</h3>
            {false !== this.state.customJSHead &&
            false !== this.state.customJSFoot ? (
              <Fragment>
                <p className="ysc-help-text">
                  {__(
                    "Add custom JavaScript code in <head> section or in the end of <body> tag. Insert Google Analytics, Tag Manager or other JavaScript code snippets."
                  )}
                </p>
                <p>
                  <code className="ysc-code">{"<head>"}</code> :
                </p>
                <CodeEditor
                  mode="javascript"
                  onChange={value => {
                    this.updateCustomCode("customJSHead", value);
                  }}
                  value={this.state.customJSHead}
                  maxLines={20}
                  minLines={5}
                  height="300px"
                />
                <p>
                  <code className="ysc-code">{"<foot>"}</code> :
                </p>
                <CodeEditor
                  mode="javascript"
                  onChange={value => {
                    this.updateCustomCode("customJSFoot", value);
                  }}
                  value={this.state.customJSFoot}
                  maxLines={20}
                  minLines={5}
                  height="300px"
                />
              </Fragment>
            ) : (
              <Spinner />
            )}
          </Fragment>
        ) : (
          ""
        )}
      </div>
    );
  }
}

Settings.propTypes = {
  data: PropTypes.object
};

export default compose([
  withSelect(select => {
    const customCode = select("ysc/plugins/custom-code").getCustomCode();

    return {
      customCode
    };
  }),
  withDispatch(dispatch => ({
    updateCustomCode(value) {
      dispatch("ysc/plugins/custom-code").setCustomCode(value);

      apiFetch({
        path: "/ysc/v1/update_custom_code",
        method: "POST",
        data: {
          data: value
        }
      });
    }
  }))
])(Settings);
