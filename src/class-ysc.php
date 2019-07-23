<?php
/**
 * Plugin Name:  YSC Blocks
 * Description:  YSC, Blocks collection and extensions for Gutenberg
 * Version:      @@plugin_version
 * Author:       YSC, SpiderBoost
 * Author URI:   https://yasielscaleo.com/
 * License:      GPLv2 or later
 * License URI:  https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:  ysc
 *
 * @package ysc
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}


/**
 * YSC Class
 */
class YSC {

    /**
     * The single class instance.
     *
     * @var $_instance
     */
    private static $_instance = null;

    /**
     * Path to the plugin directory
     *
     * @var $plugin_path
     */
    public $plugin_path;

    /**
     * URL to the plugin directory
     *
     * @var $plugin_url
     */
    public $plugin_url;

    /**
     * Plugin name
     *
     * @var $plugin_name
     */
    public $plugin_name;

    /**
     * Plugin version
     *
     * @var $plugin_version
     */
    public $plugin_version;

    /**
     * Plugin slug
     *
     * @var $plugin_slug
     */
    public $plugin_slug;

    /**
     * Plugin name sanitized
     *
     * @var $plugin_name_sanitized
     */
    public $plugin_name_sanitized;

    /**
     * YSC constructor.
     */
    public function __construct() {
        /* We do nothing here! */
    }

    /**
     * Main Instance
     * Ensures only one instance of this class exists in memory at any one time.
     */
    public static function instance() {
        if ( is_null( self::$_instance ) ) {
            self::$_instance = new self();   
            self::$_instance->init_options();        
            self::$_instance->init_hooks();
        }
        return self::$_instance;
    }

    /**
     * Init options
     */
    public function init_options() {
        $this->plugin_path = plugin_dir_path( __FILE__ );
        $this->plugin_url = plugin_dir_url( __FILE__ );        

        // additional blocks php.
        require_once( $this->plugin_path . 'gutenberg/index.php' );        
    }

    /**
     * Init hooks
     */
    public function init_hooks() {   
        add_action( 'admin_init', array( $this, 'admin_init' ) );
        
        // include blocks.
        // work only if Gutenberg available.
        if ( function_exists( 'register_block_type' ) ) { 
                     
            // add YSC blocks category.
            add_filter( 'block_categories', array( $this, 'block_categories' ), 9 );

            // Enqueue the main script.
            add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_editor_assets' ), 9 );
            add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_block_assets' ) );
        }
    }

    /**
     * Register YSC blocks category
     *
     * @param array $categories - available categories.
     * @return array
     */
    public function block_categories( $categories ) {
        return array_merge(
            array(
                array(
                    'slug'  => 'ysc',
                    'title' => __( 'YSC Blocks', '@@text_domain' ),
                ),
            ),
            $categories
        );
    }

    /**
     * Enqueue editor assets
     */
    public function enqueue_block_editor_assets() {
        $css_deps = array();
        $js_deps = array( 'wp-editor', 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-edit-post', 'wp-compose', 'underscore', 'wp-components', 'jquery' );

        // YSC.        
        wp_enqueue_script(
            'ysc-editor',
            plugins_url( 'gutenberg/index.min.js', __FILE__ ),
            $js_deps,
            filemtime( plugin_dir_path( __FILE__ ) . 'gutenberg/index.min.js' )
        );
    }
    
    /**
     * Enqueue editor frontend assets
     */
    public function enqueue_block_assets() {
        $css_deps = array();
        $js_deps = array( 'jquery' );

        // YSC.
        wp_enqueue_style(
            'ysc',
            plugins_url( 'gutenberg/style.min.css', __FILE__ ),
            $css_deps,
            filemtime( plugin_dir_path( __FILE__ ) . 'gutenberg/style.min.css' )
        );
    }

    /**
     * Init variables
     */
    public function admin_init() {
        // get current plugin data.
        $data = get_plugin_data( __FILE__ );
        $this->plugin_name = $data['Name'];
        $this->plugin_version = $data['Version'];
        $this->plugin_slug = plugin_basename( __FILE__, '.php' );
        $this->plugin_name_sanitized = basename( __FILE__, '.php' );
    }
}



/**
 * Function works with the YSC class instance
 *
 * @return object YSC
 */
function ysc() {
    return YSC::instance();
}
add_action( 'plugins_loaded', 'ysc' );