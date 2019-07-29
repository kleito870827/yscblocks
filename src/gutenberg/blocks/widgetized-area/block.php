<?php
/**
 * Widgetized area block.
 *
 * @package ysc
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class YSC_Widgetized_Area_Block
 */
class YSC_Widgetized_Area_Block {
    /**
     * YSC_Widgetized_Area_Block constructor.
     */
    public function __construct() {
        add_action( 'init', array( $this, 'init' ) );
    }

    /**
     * Init.
     */
    public function init() {
        if ( function_exists( 'register_block_type' ) ) {
            register_block_type( 'ysc/widgetized-area', array(
                'render_callback' => array( $this, 'block_render' ),
            ) );
        }
    }

    /**
     * Register gutenberg block output
     *
     * @param array $attributes - block attributes.
     *
     * @return string
     */
    public function block_render( $attributes ) {
        ob_start();

        $class = isset( $attributes['className'] ) ? $attributes['className'] : '';
        $class .= ' ysc-widgetized-area';

        if ( $attributes['id'] ) {
            echo '<div class="' . esc_attr( $class ) . '">';
                dynamic_sidebar( $attributes['id'] );
            echo '</div>';
        }

        return ob_get_clean();
    }
}
new YSC_Widgetized_Area_Block();