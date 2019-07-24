const { yscVariables } = window;
const $ = window.jQuery;
const $doc = $( document );

// prepare media vars.
const vars = {};
Object.keys( yscVariables.media_sizes ).forEach( ( k ) => {
    vars[ `media_${ k }` ] = yscVariables.media_sizes[ k ];
} );

function escapeRegExp( s ) {
    return s.replace( /[-/\\^$*+?.()|[\]{}]/g, '\\$&' );
}

window.YSC = {
    themeName: yscVariables.themeName,

    settings: yscVariables.settings,

    disabledBlocks: yscVariables.disabledBlocks,

    vars: vars,
    replaceVars( str ) {
        Object.keys( this.vars ).map( ( key ) => {
            str = str.replace( new RegExp( `#{yscvar:${ escapeRegExp( key ) }}`, 'g' ), `(max-width: ${ this.vars[ key ] }px)` );
        } );

        return str;
    },

    sidebars: yscVariables.sidebars,

    googleMapsAPIKey: yscVariables.googleMapsAPIKey,
    googleMapsAPIUrl: yscVariables.googleMapsAPIUrl,
    googleMapsLibrary: yscVariables.googleMapsLibrary,

    icons: yscVariables.icons,

    variants: yscVariables.variants,
    getVariants( name ) {
        if ( typeof this.variants[ name ] !== 'undefined' ) {
            return this.variants[ name ];
        }
        return false;
    },

    adminUrl: yscVariables.admin_url,
    adminTemplatesUrl: yscVariables.admin_templates_url,

    triggerEvent( name, ...args ) {
        $doc.trigger( `${ name }.ysc`, [ ...args ] );
    },

    /**
     * Check for block support ysc features.
     *
     * @param {Mixed} block - block props / block name
     * @param {String} featureName - feature name
     * @param {Mixed} defaultVal - default return value
     *
     * @return {Mixed} - supports flag
     */
    hasBlockSupport( block, featureName, defaultVal = false ) {
        if ( typeof block === 'string' && wp && wp.blocks ) {
            const {
                getBlockType,
            } = wp.blocks;

            if ( getBlockType ) {
                block = getBlockType( block );
            }
        }

        if (
            block &&
            block.ysc &&
            block.ysc.supports &&
            typeof block.ysc.supports[ featureName ] !== 'undefined'
        ) {
            return block.ysc.supports[ featureName ];
        }

        return defaultVal;
    },
};
