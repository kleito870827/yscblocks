import * as button from "./button";
import * as accordion from './accordion';
import * as accordionItem from './accordion/item';

/**
 * Internal dependencies
 */
const { registerBlockType } = wp.blocks;

/**
 * Register blocks
 */
jQuery(() => {
  [button, accordion, accordionItem].forEach(({ name, settings }) => {
    registerBlockType(name, settings);
  });
});
