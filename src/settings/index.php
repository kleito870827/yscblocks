<?php
/**
 * Additional PHP for blocks.
 *
 * @package ysc
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * YSC_Settings
 */
class YSC_Settings {
    /**
     * Slug of the plugin screen.
     *
     * @var $plugin_screen_hook_suffix
     */
    protected $plugin_screen_hook_suffix = null;

    /**
     * YSC_Settings constructor.
     */
    public function __construct() {
        // work only if Gutenberg available.
        if ( ! function_exists( 'register_block_type' ) ) {
            return;
        }

        // Load admin style sheet and JavaScript.
        add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
    }

    /**
     * Register and enqueue admin-specific style sheet.
     */
    public function admin_enqueue_scripts() {
        global $post;

        $screen = get_current_screen();

        wp_enqueue_style(
            'ysc-admin',
            ysc()->plugin_url . 'assets/admin/css/admin.min.css',
            array(),
            filemtime( ysc()->plugin_path . 'assets/admin/css/admin.min.css' )
        );

        wp_enqueue_style(
            'ysc-settings',
            ysc()->plugin_url . 'assets/admin/css/settings.min.css',
            array(),
            filemtime( ysc()->plugin_path . 'assets/admin/css/settings.min.css' )
        );

        if ( 'toplevel_page_ysc' !== $screen->id ) {
            return;
        }

        $block_categories = array();
        if ( function_exists( 'get_block_categories' ) ) {
            $block_categories = get_block_categories( get_post() );
        } else if ( function_exists( 'gutenberg_get_block_categories' ) ) {
            $block_categories = gutenberg_get_block_categories( get_post() );
        }

        // enqueue blocks library.
        wp_enqueue_script( 'wp-block-library' );

        wp_add_inline_script(
            'wp-blocks',
            sprintf( 'wp.blocks.setCategories( %s );', wp_json_encode( $block_categories ) ),
            'after'
        );

        // YSC Settings.
        wp_enqueue_script(
            'ysc-settings',
            ysc()->plugin_url . 'settings/index.min.js',
            array( 'ysc-helper', 'wp-data', 'wp-element', 'wp-components', 'wp-api', 'wp-api-request', 'wp-i18n' ),
            filemtime( ysc()->plugin_path . 'settings/index.min.js' )
        );

        wp_localize_script( 'ysc-settings', 'yscSettingsData', array(
            'api_nonce' => wp_create_nonce( 'wp_rest' ),
            'api_url' => rest_url( 'ysc/v1/' ),
        ) );

        do_action( 'enqueue_block_editor_assets' );
    }

    /**
     * Render the admin page.
     */
    public function display_admin_page() {
        ?>
<div class="ysc-admin-page"></div>
<?php
    }
}

new YSC_Settings();