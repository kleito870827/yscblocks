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

        add_action( 'init', array( $this, 'add_custom_fields_support' ), 100 );

        add_action( 'save_post', array( $this, 'parse_styles_from_blocks' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'add_custom_css_js' ), 100 );
        
        // include blocks.
        // work only if Gutenberg available.
        if ( function_exists( 'register_block_type' ) ) { 
            add_action( 'init', array( $this, 'register_scripts' ) );
                     
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
     * Register scripts.
     */
    public function register_scripts() {
        // Jarallax.
        if ( apply_filters( 'ysc_enqueue_plugin_jarallax', true ) ) {
            wp_register_script( 'resize-observer-polyfill', plugins_url( 'assets/vendor/resize-observer-polyfill/ResizeObserver.global.min.js', __FILE__ ), array(), '1.5.0', true );
            wp_register_script( 'jarallax', plugins_url( 'assets/vendor/jarallax/dist/jarallax.min.js', __FILE__ ), array( 'jquery', 'resize-observer-polyfill' ), '1.10.7', true );
            wp_register_script( 'jarallax-video', plugins_url( 'assets/vendor/jarallax/dist/jarallax-video.min.js', __FILE__ ), array( 'jarallax' ), '1.10.7', true );
        }

        // Object Fit Images.
        if ( apply_filters( 'ysc_enqueue_plugin_object_fit_images', true ) ) {
            wp_register_script( 'object-fit-images', plugins_url( 'assets/vendor/object-fit-images/ofi.min.js', __FILE__ ), array(), '3.2.4', true );
        }

        // Swiper.
        if ( apply_filters( 'ysc_enqueue_plugin_swiper', true ) ) {
            wp_register_style( 'swiper', plugins_url( 'assets/vendor/swiper/css/swiper.min.css', __FILE__ ), array(), '4.4.6' );
            wp_register_script( 'swiper', plugins_url( 'assets/vendor/swiper/js/swiper.min.js', __FILE__ ), array(), '4.4.6', true );
        }

        // GistEmbed.
        if ( apply_filters( 'ysc_enqueue_plugin_gist_simple', true ) ) {
            wp_register_style( 'gist-simple', plugins_url( 'assets/vendor/gist-simple/gist-simple.css', __FILE__ ), array(), '1.0.1' );
            wp_register_script( 'gist-simple', plugins_url( 'assets/vendor/gist-simple/gist-simple.min.js', __FILE__ ), array( 'jquery' ), '1.0.1', true );
        }

        // ScrollReveal.
        if ( apply_filters( 'ysc_enqueue_plugin_scrollreveal', true ) ) {
            wp_register_script( 'scrollreveal', plugins_url( 'assets/vendor/scrollreveal/scrollreveal.min.js', __FILE__ ), array(), '4.0.5', true );
        }

        // Get all sidebars.
        $sidebars = false;
        if ( ! empty( $GLOBALS['wp_registered_sidebars'] ) ) {
            foreach ( $GLOBALS['wp_registered_sidebars'] as $k => $sidebar ) {
                $sidebars[ $k ] = array(
                    'id'   => $sidebar['id'],
                    'name' => $sidebar['name'],
                );
            }
        }

        // helper script.
        wp_register_script(
            'ysc-helper',
            plugins_url( 'assets/js/helper.min.js', __FILE__ ),
            array( 'jquery' ),
            filemtime( plugin_dir_path( __FILE__ ) . 'assets/js/helper.min.js' )
        );
        $default_variant = array(
            'default' => array(
                'title' => esc_html__( 'Default', '@@text_domain' ),
            ),
        );

        // Google Maps prepare localization as in WordPress settings.
        $gmaps_locale = get_locale();
        $gmaps_suffix = '.com';
        switch ( $gmaps_locale ) {
            case 'he_IL':
                // Hebrew correction.
                $gmaps_locale = 'iw';
                break;
            case 'zh_CN':
                // Chinese integration.
                $gmaps_suffix = '.cn';
                break;
        }
        $gmaps_locale = substr( $gmaps_locale, 0, 2 );

        $theme_data = wp_get_theme( get_template() );

        wp_localize_script( 'ysc-helper', 'yscVariables', array(
            'themeName'        => $theme_data->get( 'Name' ),

            'settings'          => get_option( 'ysc_settings', array() ),

            'disabledBlocks'    => get_option( 'ysc_disabled_blocks', array() ),

            // TODO: Move this to plugin options (part 1).
            'media_sizes'       => array(
                'sm' => 576,
                'md' => 768,
                'lg' => 992,
                'xl' => 1200,
            ),
            'googleMapsAPIKey'  => get_option( 'ysc_google_maps_api_key' ),
            'googleMapsAPIUrl'  => 'https://maps.googleapis' . $gmaps_suffix . '/maps/api/js?v=3.exp&language=' . esc_attr( $gmaps_locale ),
            'googleMapsLibrary' => apply_filters( 'ysc_enqueue_plugin_gmaps', true ) ? array(
                'url' => plugins_url( 'assets/vendor/gmaps/gmaps.min.js', __FILE__ ) . '?ver=0.4.25',
            ) : false, 
            'sidebars'          => $sidebars,           
            'icons'             => is_admin() ? apply_filters( 'ysc_icons_list', array(
                /**
                 * Example:
                   array(
                       'font-awesome' => array(
                           'name' => 'FontAwesome',
                           'icons' => array(
                               array(
                                    'class': 'fab fa-google',
                                    'keys': 'google',
                                    // optional preview for editor.
                                    'preview': `<span class="fab fa-google"></span>`,
                               ),
                               ...
                           ),
                       ),
                   )
                 */
            ) ) : array(),
            'variants'          => array(                            
                'button'             => array_merge( $default_variant, apply_filters( 'ysc_button_variants', array() ) ),                
            ),
            'admin_url'           => admin_url(),
            'admin_templates_url' => admin_url( 'edit.php?post_type=ysc_template' ),
        ) );
    }

    /**
     * Enqueue editor assets
     */
    public function enqueue_block_editor_assets() {
        $css_deps = array();
        $js_deps = array( 'ysc-helper', 'wp-editor', 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-edit-post', 'wp-compose', 'underscore', 'wp-components', 'jquery' );
        
        // Jarallax.
        if ( apply_filters( 'ysc_enqueue_plugin_jarallax', true ) ) {
            $js_deps[] = 'jarallax';
            $js_deps[] = 'jarallax-video';
        }

        // GistEmbed.
        if ( apply_filters( 'ysc_enqueue_plugin_gist_simple', true ) ) {
            $css_deps[] = 'gist-simple';
            $js_deps[] = 'gist-simple';
        }

        // YSC.  
        wp_enqueue_style(
            'ysc-editor',
            plugins_url( 'assets/admin/css/style.min.css', __FILE__ ),
            $css_deps,
            filemtime( plugin_dir_path( __FILE__ ) . 'assets/admin/css/style.min.css' )
        );      
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
        $js_deps = array( 'jquery', 'ysc-helper' );

        // Jarallax.
        if ( apply_filters( 'ysc_enqueue_plugin_jarallax', true ) ) {
            $js_deps[] = 'jarallax';
            $js_deps[] = 'jarallax-video';
        }

        // Object Fit Images.
        if ( apply_filters( 'ysc_enqueue_plugin_object_fit_images', true ) ) {
            $js_deps[] = 'object-fit-images';
        }

        // Swiper.
        if ( apply_filters( 'ysc_enqueue_plugin_swiper', true ) ) {
            $css_deps[] = 'swiper';
            $js_deps[] = 'swiper';
        }

        // GistEmbed.
        if ( apply_filters( 'ysc_enqueue_plugin_gist_simple', true ) ) {
            $css_deps[] = 'gist-simple';
            $js_deps[] = 'gist-simple';
        }

        // ScrollReveal.
        if ( apply_filters( 'ysc_enqueue_plugin_scrollreveal', true ) ) {
            $js_deps[] = 'scrollreveal';
        }

        // YSC.
        wp_enqueue_style(
            'ysc',
            plugins_url( 'gutenberg/style.min.css', __FILE__ ),
            $css_deps,
            filemtime( plugin_dir_path( __FILE__ ) . 'gutenberg/style.min.css' )
        );
        wp_enqueue_script(
            'ysc',
            plugins_url( 'assets/js/script.min.js', __FILE__ ),
            $js_deps,
            filemtime( plugin_dir_path( __FILE__ ) . 'assets/js/script.min.js' )
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

    /**
     * Add support for 'custom-fields' for all post types.
     * Required by Customizer and Custom CSS blocks.
     */
    public function add_custom_fields_support() {
        $available_post_types = get_post_types( array(
            'show_ui' => true,
        ), 'object' );

        foreach ( $available_post_types as $post_type ) {
            if ( 'attachment' !== $post_type->name ) {
                add_post_type_support( $post_type->name, 'custom-fields' );
            }
        }
    }

    /**
     * Parse styles from blocks and save it to the post meta.
     *
     * @param int $post_id - current post id.
     */
    public function parse_styles_from_blocks( $post_id ) {
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
            return;
        }
        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return;
        }

        $post = get_post( $post_id );

        if ( ! $post->post_content ) {
            return;
        }

        if ( class_exists( 'DOMDocument' ) ) {
            $css = '';
            $dom = new DOMDocument();
            @$dom->loadHTML( $post->post_content );
            foreach ( $dom->getElementsByTagName( '*' ) as $node ) {
                $styles = $node->getAttribute( 'data-ysc-styles' );
                if ( $styles ) {
                    $css .= ' ' . $styles;
                }
            }

            if ( empty( $css ) || ! $css ) {
                delete_post_meta( $post_id, '_ysc_blocks_custom_css' );
            } else {
                // TODO: Move this to plugin options (part 2).
                $vars = array(
                    'media_sm' => '(max-width: 576px)',
                    'media_md' => '(max-width: 768px)',
                    'media_lg' => '(max-width: 992px)',
                    'media_xl' => '(max-width: 1200px)',
                );

                foreach ( $vars as $k => $var ) {
                    $css = preg_replace( "/#{yscvar:$k}/", $var, $css );
                }

                update_post_meta( $post_id, '_ysc_blocks_custom_css', $css );
            }
        }
    }

    /**
     * Add styles from blocks to the head section.
     *
     * @param int $post_id - current post id.
     */
    public function add_custom_css_js( $post_id ) {
        $global_code = get_option( 'ysc_custom_code', array() );

        if ( is_singular() && ! $post_id ) {
            $post_id = get_the_ID();
        }

        $is_single = is_singular() && $post_id;

        // Blocks custom CSS.
        if ( $is_single ) {
            $blocks_css = get_post_meta( $post_id, '_ysc_blocks_custom_css', true );

            if ( ! empty( $blocks_css ) ) {
                $this->add_custom_css( 'ysc-blocks-custom-css', $blocks_css );
            }
        }

        // Global custom CSS.
        if ( $global_code && isset( $global_code['ysc_custom_css'] ) && $global_code['ysc_custom_css'] ) {
            $this->add_custom_css( 'ysc-global-custom-css', $global_code['ysc_custom_css'] );
        }

        // Local custom CSS.
        if ( $is_single ) {
            $meta_css = get_post_meta( $post_id, 'ysc_custom_css', true );

            if ( ! empty( $meta_css ) ) {
                $this->add_custom_css( 'ysc-custom-css', $meta_css );
            }
        }

        // Global custom JS head.
        if ( $global_code && isset( $global_code['ysc_custom_js_head'] ) && $global_code['ysc_custom_js_head'] ) {
            $this->add_custom_js( 'ysc-global-custom-js-head', $global_code['ysc_custom_js_head'] );
        }

        // Local custom JS head.
        if ( $is_single ) {
            $meta_js_head = get_post_meta( $post_id, 'ysc_custom_js_head', true );

            if ( ! empty( $meta_js_head ) ) {
                $this->add_custom_js( 'ysc-custom-js-head', $meta_js_head );
            }
        }

        // Global custom JS foot.
        if ( $global_code && isset( $global_code['ysc_custom_js_foot'] ) && $global_code['ysc_custom_js_foot'] ) {
            $this->add_custom_js( 'ysc-global-custom-js-foot', $global_code['ysc_custom_js_foot'], true );
        }

        // Local custom JS foot.
        if ( $is_single ) {
            $meta_js_foot = get_post_meta( $post_id, 'ysc_custom_js_foot', true );

            if ( ! empty( $meta_js_foot ) ) {
                $this->add_custom_js( 'ysc-custom-js-foot', $meta_js_foot, true );
            }
        }
    }

    /**
     * Add custom CSS.
     *
     * @param String $name - handle name.
     * @param String $css - code.
     */
    public function add_custom_css( $name, $css ) {
        $css = wp_kses( $css, array( '\'', '\"' ) );
        $css = str_replace( '&gt;', '>', $css );

        wp_register_style( $name, false );
        wp_enqueue_style( $name );
        wp_add_inline_style( $name, $css );
    }

    /**
     * Add custom JS.
     *
     * @param String  $name - handle name.
     * @param String  $js - code.
     * @param Boolean $footer - print in footer.
     */
    public function add_custom_js( $name, $js, $footer = false ) {
        wp_register_script( $name, '', array(), '', $footer );
        wp_enqueue_script( $name );
        wp_add_inline_script( $name, $js );
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