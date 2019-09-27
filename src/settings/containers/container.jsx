// External Dependencies.
import classnames from "classnames/dedupe";
import { Component, Fragment } from "react";
import PropTypes from "prop-types";

// Internal Dependencies.
import "./container.scss";
import pages from "../pages/index.jsx";
import Logo from "../assets/logo.svg";

const { __ } = wp.i18n;

const $ = window.jQuery;

export default class Container extends Component {
  constructor(props) {
    super(props);

    // get variable.
    const $_GET = [];
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
      a,
      name,
      value
    ) {
      $_GET[name] = value;
    });

    // Set the default states
    this.state = {
      activePage: $_GET.sub_page ? $_GET.sub_page : Object.keys(pages)[0],
      blocks: {}
    };

    this.updateAdminPageActiveLink = this.updateAdminPageActiveLink.bind(this);
  }

  componentDidMount() {
    this.updateAdminPageActiveLink();
  }

  updateAdminPageActiveLink() {
    const { activePage } = this.state;

    // disable active link.
    $(".toplevel_page_ysc .current").removeClass("current");

    // find new active link.
    let $link = $(
      `.toplevel_page_ysc [href="admin.php?page=ysc&sub_page=${activePage}"]`
    );

    if (!$link.length) {
      $link = $('.toplevel_page_ysc [href="admin.php?page=ysc"]');
    }

    $link.parent().addClass("current");

    // change address bar link
    if ($link.length) {
      window.history.pushState(
        document.title,
        document.title,
        $link.prop("href")
      );
    }
  }

  render() {
    const { activePage } = this.state;

    const resultTabs = [];
    let resultContent = "";

    Object.keys(pages).forEach(k => {
      resultTabs.push(
        <li key={k}>
          <button
            className={classnames(
              "ysc-admin-tabs-button",
              activePage === k ? "ysc-admin-tabs-button-active" : ""
            )}
            onClick={() => {
              this.setState(
                {
                  activePage: k
                },
                () => {
                  this.updateAdminPageActiveLink();
                }
              );
            }}
          >
            {pages[k].label}
          </button>
        </li>
      );
    });

    if (activePage && pages[activePage]) {
      const NewBlock = pages[activePage].block;
      resultContent = (
        <NewBlock
          data={this.props.data}
          settings={this.state.settings}
          updateSettings={this.updateSettings}
        />
      );
    }

    return (
      <Fragment>
        <div className="ysc-admin-head">
          <div className="ysc-admin-head-wrap">
            <a href="https://ysc.io/">
              <Logo />
            </a>
            <h1>{__("YSC")}</h1>
            <ul className="ysc-admin-tabs">{resultTabs}</ul>
          </div>
        </div>
        <div className="ysc-admin-content">{resultContent}</div>
      </Fragment>
    );
  }
}

Container.propTypes = {
  data: PropTypes.object
};
