import * as buttonWrapper from "./button";
import * as button from "./button/button";
import * as accordion from "./accordion";
import * as accordionItem from "./accordion/item";
import * as alert from "./alert";
import * as divider from "./divider";
import * as tabs from "./tabs";
import * as tabsTab from "./tabs/tab";
import * as tabsLegacy from "./tabs/legacy";
import * as tabsLegacyTab from "./tabs/legacy/tab";
import * as widgetizedArea from "./widgetized-area";

/**
 * Internal dependencies
 */
const { registerBlockType } = wp.blocks;

/**
 * Register blocks
 */
jQuery(() => {
  [
    buttonWrapper,
    button,
    accordion,
    accordionItem,
    alert,
    divider,
    tabs,
    tabsTab,
    tabsLegacy,
    tabsLegacyTab,
    widgetizedArea
  ].forEach(({ name, settings }) => {
    registerBlockType(name, settings);
  });
});
