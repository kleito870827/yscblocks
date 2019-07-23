import * as button from "./button";

/**
 * Internal dependencies
 */
const { registerBlockType } = wp.blocks;

/**
 * Register blocks
 */
jQuery(() => {
  [button].forEach(({ name, settings }) => {
    registerBlockType(name, settings);
  });
});
