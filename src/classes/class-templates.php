<?php
/**
 * Templates
 *
 * @package @@plugin_name
 */

/**
 * YSC_Templates
 */
class YSC_Templates {
    /**
     * YSC_Templates constructor.
     */
    public function __construct() {
        // Register custom post type.
        add_action( 'init', array( $this, 'add_custom_post_type' ) );

        // custom post roles.
        add_action( 'admin_init', array( $this, 'add_role_caps' ) );
    }

    /**
     * Register custom post type.
     */
    public function add_custom_post_type() {
        register_post_type(
            'ysc_template',
            array(
                'labels' => array(
                    'name'                => _x( 'YSC Templates', 'Post Type General Name', '@@text_domain' ),
                    'singular_name'       => _x( 'YSC Template', 'Post Type Singular Name', '@@text_domain' ),
                    'menu_name'           => __( 'YSC Templates', '@@text_domain' ),
                    'parent_item_colon'   => __( 'Parent Template', '@@text_domain' ),
                    'all_items'           => __( 'Templates', '@@text_domain' ),
                    'view_item'           => __( 'View Template', '@@text_domain' ),
                    'add_new_item'        => __( 'Add New Template', '@@text_domain' ),
                    'add_new'             => __( 'Add New', '@@text_domain' ),
                    'edit_item'           => __( 'Edit Template', '@@text_domain' ),
                    'update_item'         => __( 'Update Template', '@@text_domain' ),
                    'search_items'        => __( 'Search Template', '@@text_domain' ),
                    'not_found'           => __( 'Not Found', '@@text_domain' ),
                    'not_found_in_trash'  => __( 'Not found in Trash', '@@text_domain' ),
                ),
                'public'        => false, // true?
                'publicly_queryable' => false, // true?
                'has_archive'   => false,
                'show_ui'       => true,
                'exclude_from_search' => true,
                'show_in_nav_menus' => false,
                'rewrite'       => false,
                'menu_icon'     => 'dashicons-admin-ysc-templates',
                'menu_position' => 57,
                'hierarchical'  => false,
                'show_in_menu'  => true,
                'show_in_admin_bar' => true,
                'show_in_rest'  => true,
                'taxonomies'    => array(
                    'ysc_template_category',
                ),
                'capabilities' => array(
                    'edit_post' => 'edit_ysc_template',
                    'edit_posts' => 'edit_ysc_templates',
                    'edit_others_posts' => 'edit_other_ysc_templates',
                    'publish_posts' => 'publish_ysc_templates',
                    'read_post' => 'read_ysc_template',
                    'read_private_posts' => 'read_private_ysc_templates',
                    'delete_posts' => 'delete_ysc_templates',
                    'delete_post' => 'delete_ysc_template',
                ),
                'supports' => array(
                    'title',
                    'editor',
                    'thumbnail',
                ),
            )
        );

        register_taxonomy(
            'ysc_template_category', 'ysc_template', array(
                'label'         => esc_html__( 'Categories', '@@text_domain' ),
                'labels'        => array(
                    'menu_name' => esc_html__( 'Categories', '@@text_domain' ),
                ),
                'rewrite'       => false,
                'hierarchical'  => false,
                'publicly_queryable' => false,
                'show_in_nav_menus' => false,
                'show_in_rest' => true,
                'show_admin_column' => true,
            )
        );
    }

    /**
     * Add Roles
     */
    public function add_role_caps() {
        global $wp_roles;

        if ( isset( $wp_roles ) ) {
            $wp_roles->add_cap( 'administrator', 'edit_ysc_template' );
            $wp_roles->add_cap( 'administrator', 'edit_ysc_templates' );
            $wp_roles->add_cap( 'administrator', 'edit_other_ysc_templates' );
            $wp_roles->add_cap( 'administrator', 'publish_ysc_templates' );
            $wp_roles->add_cap( 'administrator', 'read_ysc_template' );
            $wp_roles->add_cap( 'administrator', 'read_private_ysc_templates' );
            $wp_roles->add_cap( 'administrator', 'delete_ysc_templates' );
            $wp_roles->add_cap( 'administrator', 'delete_ysc_template' );

            $wp_roles->add_cap( 'editor', 'read_ysc_template' );
            $wp_roles->add_cap( 'editor', 'read_private_ysc_templates' );

            $wp_roles->add_cap( 'author', 'read_ysc_template' );
            $wp_roles->add_cap( 'author', 'read_private_ysc_templates' );

            $wp_roles->add_cap( 'contributor', 'read_ysc_template' );
            $wp_roles->add_cap( 'contributor', 'read_private_ysc_templates' );
        }
    }
}

new YSC_Templates();