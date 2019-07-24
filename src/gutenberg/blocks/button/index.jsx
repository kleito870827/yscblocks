// Import CSS
import "./style.scss";
import "./editor.scss";

// Internal Dependencies.
import getIcon from '../../utils/get-icon';

const { __ } = wp.i18n;

export const name = "ysc/button";

export const settings = {
  title: __("Buttons"),

  description: __("Change important links to buttons to get more click rate."),

  icon: getIcon( 'block-button', true ),

  category: "ysc",

  keywords: [__("btn"), __("button")],

  ysc: {
    supports: {
      spacings: true,
    }
  },

  edit: function(props) {   
    return <h1>button</h1>;
  },

  save: function(props) {
    return <h1>button</h1>;
  }
};
