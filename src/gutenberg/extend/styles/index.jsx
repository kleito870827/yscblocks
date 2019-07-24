// External Dependencies.
import shorthash from 'shorthash';
import classnames from 'classnames/dedupe';
import deepEqual from 'deep-equal';

// Internal Dependencies.
import camelCaseToDash from '../../utils/camel-case-to-dash';

const {
    applyFilters,
    addFilter,
} = wp.hooks;

const {
    getBlockType,
} = wp.blocks;

const {
    withSelect,
} = wp.data;

const {
    Component,
    Fragment,
} = wp.element;

const {
    createHigherOrderComponent,
} = wp.compose;

const { YSC } = window;

const cssPropsWithPixels = [ 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-width', 'border-bottom-left-radius', 'border-bottom-right-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-radius', 'bottom', 'top', 'left', 'right', 'font-size', 'height', 'width', 'min-height', 'min-width', 'max-height', 'max-width', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom', 'margin', 'padding-left', 'padding-right', 'padding-top', 'padding-bottom', 'padding', 'outline-width' ];

/**
 * Get styles from object.
 *
 * @param {object} data - styles data.
 * @param {string} selector - current styles selector (useful for nested styles).
 * @param {boolean} escape - escape strings to save in database.
 * @return {string} - ready to use styles string.
 */
const getStyles = ( data = {}, selector = '', escape = true ) => {
    const result = {};
    let resultCSS = '';

    // add styles.
    Object.keys( data ).map( ( key ) => {
        // object values.
        if ( data[ key ] !== null && typeof data[ key ] === 'object' ) {
            // media for different screens
            if ( /^media_/.test( key ) ) {
                resultCSS += ( resultCSS ? ' ' : '' ) + `@media #{yscvar:${ key }} { ${ getStyles( data[ key ], selector, escape ) } }`;

            // @supports css
            } else if ( /^@supports/.test( key ) ) {
                resultCSS += ( resultCSS ? ' ' : '' ) + `${ key } { ${ getStyles( data[ key ], selector, escape ) } }`;

            // nested selectors.
            } else {
                let nestedSelector = selector;
                if ( nestedSelector ) {
                    if ( key.indexOf( '&' ) !== -1 ) {
                        nestedSelector = key.replace( /&/g, nestedSelector );

                    // inside exported xml file all & symbols converted to \u0026
                    } else if ( key.indexOf( 'u0026' ) !== -1 ) {
                        nestedSelector = key.replace( /u0026/g, nestedSelector );
                    } else {
                        nestedSelector = `${ nestedSelector } ${ key }`;
                    }
                } else {
                    nestedSelector = key;
                }
                resultCSS += ( resultCSS ? ' ' : '' ) + getStyles( data[ key ], nestedSelector, escape );
            }

        // style properties and values.
        } else if ( typeof data[ key ] !== 'undefined' && data[ key ] !== false ) {
            // fix selector > and < usage.
            if ( escape ) {
                selector = selector.replace( />/g, '&gt;' );
                selector = selector.replace( /</g, '&lt;' );
            }

            // inside exported xml file all > symbols converted to \u003e
            // inside exported xml file all < symbols converted to \u003c
            if ( selector.indexOf( 'u003e' ) !== -1 ) {
                selector = selector.replace( /u003e/g, '&gt;' );
                selector = selector.replace( /u003c/g, '&lt;' );
            }

            if ( ! result[ selector ] ) {
                result[ selector ] = '';
            }
            const propName = camelCaseToDash( key );
            let propValue = data[ key ];

            // inside exported xml file all " symbols converted to \u0022
            if ( typeof propValue === 'string' && propValue.indexOf( 'u0022' ) !== -1 ) {
                propValue = propValue.replace( /u0022/g, '"' );
            }
            // inside exported xml file all ' symbols converted to \u0027
            if ( typeof propValue === 'string' && propValue.indexOf( 'u0027' ) !== -1 ) {
                propValue = propValue.replace( /u0027/g, '\'' );
            }

            const thereIsImportant = / !important$/.test( propValue );
            if ( thereIsImportant ) {
                propValue = propValue.replace( / !important$/, '' );
            }

            // add pixels.
            if (
                ( typeof propValue === 'number' && propValue !== 0 && cssPropsWithPixels.includes( propName ) ) ||
                ( typeof propValue === 'string' && /^[0-9.\-]*$/.test( propValue ) )
            ) {
                propValue += 'px';
            }

            if ( thereIsImportant ) {
                propValue += ' !important';
            }

            result[ selector ] += ` ${ propName }: ${ propValue };`;
        }
    } );

    // add styles to selectors.
    Object.keys( result ).map( ( key ) => {
        resultCSS = `${ key } {${ result[ key ] } }${ resultCSS ? ` ${ resultCSS }` : '' }`;
    } );

    return resultCSS;
};

/**
 * Get styles attribute.
 *
 * @param {object} data - styles data.
 * @param {object} blockType - styles data.
 * @param {object} attributes - block attributes.
 * @return {string} - data attribute with styles.
 */
const getCustomStylesAttr = ( data = {}, blockType, attributes ) => {
    let styles = getStyles( data );

    if ( blockType.ysc && blockType.ysc.customStylesFilter ) {
        styles = blockType.ysc.customStylesFilter( styles, data, false, attributes );
    }

    return {
        'data-ysc-styles': styles,
    };
};

/**
 * Extend block attributes with styles.
 *
 * @param {Object} blockSettings Original block settings.
 * @param {String} name Original block name.
 *
 * @return {Object} Filtered block settings.
 */
function addAttribute( blockSettings, name ) {
    let allow = false;

    // prepare settings of block + deprecated blocks.
    const eachSettings = [ blockSettings ];
    if ( blockSettings.deprecated && blockSettings.deprecated.length ) {
        blockSettings.deprecated.forEach( ( item ) => {
            eachSettings.push( item );
        } );
    }

    eachSettings.forEach( ( settings ) => {
        allow = false;

        if ( settings && settings.attributes ) {
            if ( YSC.hasBlockSupport( settings || blockSettings, 'styles', false ) ) {
                allow = true;
            } else {
                allow = applyFilters(
                    'ysc.blocks.allowCustomStyles',
                    false,
                    settings,
                    settings.name || blockSettings.name
                );
            }
        }

        if ( allow ) {
            if ( ! settings.attributes.yscStyles ) {
                settings.attributes.yscStyles = {
                    type: 'object',
                    default: '',
                };

                // add to deprecated items.
                if ( settings.deprecated && settings.deprecated.length ) {
                    settings.deprecated.forEach( ( item, i ) => {
                        if ( settings.deprecated[ i ].attributes ) {
                            settings.deprecated[ i ].attributes.yscStyles = settings.attributes.yscStyles;
                        }
                    } );
                }
            }
            if ( ! settings.attributes.yscClassname ) {
                settings.attributes.yscClassname = {
                    type: 'string',
                    default: '',
                };

                // add to deprecated items.
                if ( settings.deprecated && settings.deprecated.length ) {
                    settings.deprecated.forEach( ( item, i ) => {
                        if ( settings.deprecated[ i ].attributes ) {
                            settings.deprecated[ i ].attributes.yscClassname = settings.attributes.yscClassname;
                        }
                    } );
                }
            }
            if ( ! settings.attributes.yscId ) {
                settings.attributes.yscId = {
                    type: 'string',
                    default: '',
                };

                // add to deprecated items.
                if ( settings.deprecated && settings.deprecated.length ) {
                    settings.deprecated.forEach( ( item, i ) => {
                        if ( settings.deprecated[ i ].attributes ) {
                            settings.deprecated[ i ].attributes.yscId = settings.attributes.yscId;
                        }
                    } );
                }
            }

            settings = applyFilters( 'ysc.blocks.withCustomStyles', settings, name );
        }
    } );

    return blockSettings;
}

/**
 * Extend block attributes with styles after block transformation
 *
 * @param {Object} transformedBlock Original transformed block.
 * @param {Object} blocks           Blocks on which transform was applied.
 *
 * @return {Object} Modified transformed block, with layout preserved.
 */
function addAttributeTransform( transformedBlock, blocks ) {
    if (
        blocks &&
        blocks[ 0 ] &&
        blocks[ 0 ].clientId === transformedBlock.clientId &&
        blocks[ 0 ].attributes &&
        blocks[ 0 ].attributes.yscStyles &&
        Object.keys( blocks[ 0 ].attributes.yscStyles ).length
    ) {
        Object.keys( blocks[ 0 ].attributes ).forEach( ( attrName ) => {
            if ( /^ysc/.test( attrName ) ) {
                transformedBlock.attributes[ attrName ] = blocks[ 0 ].attributes[ attrName ];
            }
        } );
    }

    return transformedBlock;
}

/**
 * List of used IDs to prevent duplicates.
 *
 * @type {Object}
 */
const usedIds = {};

/**
 * Override the default edit UI to include a new block inspector control for
 * assigning the custom styles if needed.
 *
 * @param {function|Component} BlockEdit Original component.
 *
 * @return {string} Wrapped component.
 */
const withNewAttrs = createHigherOrderComponent( ( BlockEdit ) => {
    class newEdit extends Component {
        constructor() {
            super( ...arguments );

            const {
                attributes,
                clientId,
            } = this.props;

            // fix duplicated classes after block clone.
            if ( clientId && attributes.yscId ) {
                if ( typeof usedIds[ attributes.yscId ] === 'undefined' ) {
                    usedIds[ attributes.yscId ] = clientId;
                } else {
                    this.props.attributes.yscId = '';
                }
            }

            this.onUpdate = this.onUpdate.bind( this );
            this.getyscAtts = this.getyscAtts.bind( this );
        }

        componentDidMount() {
            this.onUpdate();
        }
        componentDidUpdate() {
            this.onUpdate();
        }

        onUpdate() {
            const {
                setAttributes,
                attributes,
                blockSettings,
            } = this.props;

            const newAttrs = {};

            // prepare custom block styles.
            const blockCustomStyles = applyFilters(
                'ysc.blocks.customStyles',
                blockSettings.ysc && blockSettings.ysc.customStylesCallback ? blockSettings.ysc.customStylesCallback( attributes, this.props ) : {},
                this.props
            );

            if ( blockCustomStyles && Object.keys( blockCustomStyles ).length ) {
                const yscAtts = this.getyscAtts();

                if ( yscAtts.yscClassname ) {
                    let updateAttrs = false;

                    let className = `.${ attributes.yscClassname }`;

                    if ( blockSettings.ysc && blockSettings.ysc.customSelector ) {
                        className = blockSettings.ysc.customSelector( className, this.props );
                    }

                    newAttrs.yscStyles = {
                        [ className ]: blockCustomStyles,
                    };

                    if ( yscAtts.yscClassname !== attributes.yscClassname ) {
                        newAttrs.yscClassname = yscAtts.yscClassname;
                        updateAttrs = true;
                    }
                    if ( yscAtts.yscId !== attributes.yscId ) {
                        newAttrs.yscId = yscAtts.yscId;
                        updateAttrs = true;
                    }

                    updateAttrs = updateAttrs || ! deepEqual( attributes.yscStyles, newAttrs.yscStyles );

                    if ( updateAttrs ) {
                        setAttributes( newAttrs );
                    }
                }
            } else if ( attributes.yscStyles ) {
                if ( attributes.yscId && typeof usedIds[ attributes.yscId ] !== 'undefined' ) {
                    delete usedIds[ attributes.yscId ];
                }

                setAttributes( {
                    yscClassname: '',
                    yscId: '',
                    yscStyles: '',
                } );
            }
        }

        getyscAtts() {
            const props = this.props;
            let result = false;

            if ( props.attributes.yscId && props.attributes.yscClassname ) {
                result = {
                    yscId: props.attributes.yscId,
                    yscClassname: props.attributes.yscClassname,
                };

                // add new ysc props.
            } else if ( props.clientId && props.attributes && typeof props.attributes.yscId !== 'undefined' ) {
                let ID = props.attributes.yscId || '';

                // check if ID already exist.
                let tryCount = 10;
                while ( ! ID || ( typeof usedIds[ ID ] !== 'undefined' && usedIds[ ID ] !== props.clientId && tryCount > 0 ) ) {
                    ID = shorthash.unique( props.clientId );
                    tryCount--;
                }

                if ( ID && typeof usedIds[ ID ] === 'undefined' ) {
                    usedIds[ ID ] = props.clientId;
                }

                if ( ID !== props.attributes.yscId ) {
                    result = {
                        yscId: ID,
                        yscClassname: props.name.replace( '/', '-' ) + '-' + ID,
                    };
                }
            }

            return result;
        }

        render() {
            const {
                attributes,
                blockSettings,
            } = this.props;

            if ( attributes.yscClassname && attributes.yscStyles && Object.keys( attributes.yscStyles ).length !== 0 ) {
                let styles = getStyles( attributes.yscStyles, '', false );

                if ( blockSettings && blockSettings.ysc && blockSettings.ysc.customStylesFilter ) {
                    styles = blockSettings.ysc.customStylesFilter( styles, attributes.yscStyles, true, attributes );
                }

                return (
                    <Fragment>
                        <BlockEdit { ...this.props } />
                        <style>{ window.YSC.replaceVars( styles ) }</style>
                    </Fragment>
                );
            }

            return <BlockEdit { ...this.props } />;
        }
    }

    return withSelect( ( select, ownProps ) => {
        return {
            blockSettings: getBlockType( ownProps.name ),
        };
    } )( newEdit );
}, 'withNewAttrs' );

/**
 * Add block custom classname.
 *
 * @param {string} className block editor/save classname
 * @param {object} { attributes } - block attributes
 * @return {string} changed classname
 */
function blocksEditorCustomClassName( className, { attributes } ) {
    if ( attributes.yscClassname ) {
        className = classnames( className, attributes.yscClassname );
    }

    return className;
}

/**
 * Override props assigned to save component to inject custom styles.
 * This is only applied if the block's save result is an
 * element and not a markup string.
 *
 * @param {Object} extraProps Additional props applied to save element.
 * @param {Object} blockType  Block type.
 * @param {Object} attributes Current block attributes.
 *
 * @return {Object} Filtered props applied to save element.
 */
function addSaveProps( extraProps, blockType, attributes ) {
    const customStyles = attributes.yscStyles ? Object.assign( {}, attributes.yscStyles ) : false;

    if ( customStyles && Object.keys( customStyles ).length !== 0 ) {
        extraProps = Object.assign( extraProps || {}, getCustomStylesAttr( customStyles, blockType, attributes ) );
        extraProps.className = blocksEditorCustomClassName( extraProps.className, { attributes } );
    }

    return extraProps;
}

// Init filters.
addFilter( 'blocks.registerBlockType', 'ysc/styles/additional-attributes', addAttribute );
addFilter( 'blocks.switchToBlockType.transformedBlock', 'ysc/styles/additional-attributes', addAttributeTransform );
addFilter( 'editor.BlockEdit', 'ysc/styles/additional-attributes', withNewAttrs );
addFilter( 'blocks.getSaveContent.extraProps', 'ysc/styles/save-props', addSaveProps );
addFilter( 'ysc.editor.className', 'ysc/editor/custom-class-name', blocksEditorCustomClassName );
