// External Dependencies.
import classnames from "classnames/dedupe";

// Internal Dependencies.
import Controls from "./controls";

const { applyFilters } = wp.hooks;
const { __ } = wp.i18n;
const { InnerBlocks } = wp.editor;
const { Component, Fragment } = wp.element;

class Edit extends Component {
  render() {
    let { className = "", isSelected } = this.props;

    className = classnames("ysc-container-block", className);

    className = applyFilters("ysc.editor.className", className, this.props);

    return (
      <Fragment>
        {isSelected && <Controls {...this.props} />}
        <div className={className}>
          <div className="ysc-container-content">
            <InnerBlocks templateLock={false} />
          </div>
        </div>
      </Fragment>
    );
  }
}

export default Edit;
