// Import CSS
import "./style.scss";
import "./editor.scss";

const { __ } = wp.i18n;

export const name = "ysc/button";

export const settings = {
  title: __("Buttons"),

  description: __("Change important links to buttons to get more click rate."),

  icon: "wordpress",

  category: "ysc",

  keywords: [__("btn"), __("button")],

  edit: function(props) {
    return <h1>button</h1>;
  },

  save: function(props) {
    return <h1>button</h1>;
  }
};
