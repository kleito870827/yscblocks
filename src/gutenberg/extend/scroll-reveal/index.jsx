import ScrollReveal from 'scrollreveal';

import parseSRConfig from './parseSRConfig';

// Import CSS
import './editor.scss';

import getIcon from '../../utils/get-icon';

const $ = window.jQuery;

const { __ } = wp.i18n;

const {
    applyFilters,
    addFilter,
} = wp.hooks;

const {
    Component,
    Fragment,
} = wp.element;

const {
    createHigherOrderComponent,
} = wp.compose;

const { YSC } = window;

const { InspectorControls } = wp.editor;

const {
    BaseControl,
    PanelBody,
    TextControl,
    Button,
    ButtonGroup,
} = wp.components;

let initialOpenPanel = false;

/**
 * Add support for core blocks.
 *
 * @param {String} name - block name.
 *
 * @return {Boolean} block supported.
 */
function addCoreBlocksSupport( name ) {
    return name && /^core/.test( name ) && ! /^core\/block$/.test( name ) && ! /^core\/archives/.test( name );
}

/**
 * Check if block SR allowed.
 *
 * @param {object} data - block data.
 * @return {boolean} allowed SR.
 */
function allowedSR( data ) {
    let allow = false;
    const checkSupportVar = data && data.ysc && data.ysc.supports ? data : data.name;

    if ( YSC.hasBlockSupport( checkSupportVar, 'scrollReveal', false ) ) {
        allow = true;
    }

    if ( ! allow ) {
        allow = data && data.attributes && applyFilters(
            'ysc.blocks.allowScrollReveal',
            addCoreBlocksSupport( data.name ),
            data,
            data.name
        );
    }

    return allow;
}

/**
 * Extend ysc block attributes with SR.
 *
 * @param {Object} settings Original block settings.
 *
 * @return {Object} Filtered block settings.
 */
function addAttribute( settings ) {
    const allow = allowedSR( settings );

    if ( allow ) {
        if ( ! settings.attributes.yscSR ) {
            settings.attributes.yscSR = {
                type: 'string',
                default: '',
            };

            // add to deprecated items.
            if ( settings.deprecated && settings.deprecated.length ) {
                settings.deprecated.forEach( ( item, i ) => {
                    if ( settings.deprecated[ i ].attributes ) {
                        settings.deprecated[ i ].attributes.yscSR = settings.attributes.yscSR;
                    }
                } );
            }
        }
    }
    return settings;
}

/**
 * Override the default edit UI to include a new block inspector control for
 * assigning the custom attribute if needed.
 *
 * @param {function|Component} BlockEdit Original component.
 *
 * @return {string} Wrapped component.
 */
const withInspectorControl = createHigherOrderComponent( ( OriginalComponent ) => {
    class YSCSRWrapper extends Component {
        constructor() {
            super( ...arguments );

            const {
                yscSR = '',
            } = this.props.attributes;

            const state = {
                effect: '',
                direction: '',
                distance: 50,
                scale: 0.9,
                duration: 900,
                delay: 0,
            };

            // parse data from string.
            // fade-right;duration:500;delay:1000;distance:60px;scale:0.8
            const data = yscSR.split( ';' );

            let effect = data[ 0 ];
            if ( effect ) {
                let direction = effect.split( '-' );
                if ( 2 === direction.length ) {
                    effect = direction[ 0 ];
                    direction = direction[ 1 ];
                } else {
                    direction = '';
                }

                state.effect = effect;
                state.direction = direction;

                // replace other data config.
                if ( data.length > 1 ) {
                    data.forEach( ( item ) => {
                        const itemData = item.split( ':' );
                        if ( 2 === itemData.length ) {
                            const name = itemData[ 0 ];
                            const val = itemData[ 1 ];
                            state[ name ] = val;
                        }
                    } );
                }

                state.distance = parseFloat( state.distance );
                state.scale = parseFloat( state.scale );
                state.duration = parseFloat( state.duration );
                state.delay = parseFloat( state.delay );
            }

            this.state = state;

            this.updateData = this.updateData.bind( this );
        }

        updateData( newData ) {
            const {
                yscSR,
            } = this.props.attributes;

            const {
                setAttributes,
            } = this.props;

            const newState = { ...this.state, ...newData };

            let newAttribute = '';
            if ( newState.effect ) {
                newAttribute = newState.effect;

                if ( newState.direction ) {
                    newAttribute += '-' + newState.direction;

                    if ( 50 !== newState.distance ) {
                        newAttribute += ';distance:' + newState.distance + 'px';
                    }
                }
                if ( 900 !== newState.duration ) {
                    newAttribute += ';duration:' + newState.duration;
                }
                if ( 0 !== newState.delay ) {
                    newAttribute += ';delay:' + newState.delay;
                }

                if ( 'zoom' === newState.effect && 0.9 !== newState.scale ) {
                    newAttribute += ';scale:' + newState.scale;
                }
            }

            this.setState( newData );

            if ( yscSR !== newAttribute ) {
                setAttributes( { yscSR: newAttribute } );
            }
        }

        render() {
            const props = this.props;
            const allow = allowedSR( props );

            if ( ! allow ) {
                return <OriginalComponent { ...props } />;
            }

            // add new SR controls.
            return (
                <Fragment>
                    <OriginalComponent
                        { ...props }
                        setState={ this.setState }
                    />
                    <InspectorControls>
                        <PanelBody
                            title={ (
                                <Fragment>
                                    { __( 'Animate on Scroll' ) }
                                    <span className="ysc-ext-badge">{ __( 'ext' ) }</span>
                                </Fragment>
                            ) }
                            initialOpen={ initialOpenPanel }
                            onToggle={ () => {
                                initialOpenPanel = ! initialOpenPanel;
                            } }
                        >
                            <ButtonGroup>
                                {
                                    [
                                        {
                                            label: __( 'none' ),
                                            value: '',
                                        },
                                        {
                                            label: __( 'Fade' ),
                                            value: 'fade',
                                        },
                                        {
                                            label: __( 'Zoom' ),
                                            value: 'zoom',
                                        },
                                    ].map( ( val ) => {
                                        const selected = this.state.effect === val.value;

                                        return (
                                            <Button
                                                isLarge
                                                isPrimary={ selected }
                                                aria-pressed={ selected }
                                                onClick={ () => this.updateData( { effect: val.value } ) }
                                                key={ `effect_${ val.label }` }
                                            >
                                                { val.label }
                                            </Button>
                                        );
                                    } )
                                }
                            </ButtonGroup>

                            { this.state.effect ? (
                                <Fragment>
                                    <BaseControl className="ysc-control-sr-direction">
                                        <div className="ysc-control-sr-direction-wrap">
                                            <div className="ysc-control-sr-direction-left">
                                                <Button
                                                    className={ 'left' === this.state.direction ? 'ysc-control-sr-direction-active' : '' }
                                                    onClick={ () => this.updateData( { direction: 'left' } ) }
                                                >
                                                    { getIcon( 'icon-arrow-right' ) }
                                                </Button>
                                            </div>
                                            <div className="ysc-control-sr-direction-top">
                                                <Button
                                                    className={ 'down' === this.state.direction ? 'ysc-control-sr-direction-active' : '' }
                                                    onClick={ () => this.updateData( { direction: 'down' } ) }
                                                >
                                                    { getIcon( 'icon-arrow-down' ) }
                                                </Button>
                                            </div>
                                            <div className="ysc-control-sr-direction-right">
                                                <Button
                                                    className={ 'right' === this.state.direction ? 'ysc-control-sr-direction-active' : '' }
                                                    onClick={ () => this.updateData( { direction: 'right' } ) }
                                                >
                                                    { getIcon( 'icon-arrow-left' ) }
                                                </Button>
                                            </div>
                                            <div className="ysc-control-sr-direction-bottom">
                                                <Button
                                                    className={ 'up' === this.state.direction ? 'ysc-control-sr-direction-active' : '' }
                                                    onClick={ () => this.updateData( { direction: 'up' } ) }
                                                >
                                                    { getIcon( 'icon-arrow-up' ) }
                                                </Button>
                                            </div>
                                            <div className="ysc-control-sr-direction-center">
                                                <Button
                                                    className={ ! this.state.direction ? 'ysc-control-sr-direction-active' : '' }
                                                    onClick={ () => this.updateData( { direction: '' } ) }
                                                >
                                                    { getIcon( 'icon-circle' ) }
                                                </Button>
                                            </div>
                                        </div>
                                    </BaseControl>

                                    { this.state.direction || 'zoom' === this.state.effect ? (
                                        <div className="ysc-grid-controls">
                                            { this.state.direction ? (
                                                <TextControl
                                                    type="number"
                                                    label={ __( 'Distance' ) }
                                                    value={ this.state.distance }
                                                    onChange={ ( value ) => this.updateData( { distance: value } ) }
                                                    min={ 10 }
                                                    max={ 200 }
                                                />
                                            ) : '' }
                                            { 'zoom' === this.state.effect ? (
                                                <TextControl
                                                    type="number"
                                                    label={ __( 'Scale' ) }
                                                    value={ this.state.scale }
                                                    onChange={ ( value ) => this.updateData( { scale: value } ) }
                                                    min={ 0 }
                                                    max={ 1 }
                                                    step={ 0.05 }
                                                />
                                            ) : '' }
                                            { ! this.state.direction || 'zoom' !== this.state.effect ? (
                                                <div />
                                            ) : '' }
                                        </div>
                                    ) : '' }

                                    <div className="ysc-grid-controls">
                                        <TextControl
                                            type="number"
                                            label={ __( 'Duration' ) }
                                            value={ this.state.duration }
                                            onChange={ ( value ) => this.updateData( { duration: value } ) }
                                            min={ 100 }
                                            max={ 2000 }
                                        />
                                        <TextControl
                                            type="number"
                                            label={ __( 'Delay' ) }
                                            value={ this.state.delay }
                                            onChange={ ( value ) => this.updateData( { delay: value } ) }
                                            min={ 0 }
                                            max={ 1000 }
                                        />
                                    </div>
                                </Fragment>
                            ) : '' }
                        </PanelBody>
                    </InspectorControls>
                </Fragment>
            );
        }
    }

    return YSCSRWrapper;
}, 'withInspectorControl' );

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
    if ( attributes.yscSR ) {
        extraProps[ 'data-ysc-sr' ] = attributes.yscSR;
    }

    return extraProps;
}

const withDataSR = createHigherOrderComponent( ( BlockListBlock ) => {
    class YSCSRWrapper extends Component {
        constructor() {
            super( ...arguments );

            this.state = {
                allowedSR: allowedSR( this.props ),
                currentSR: '',
            };

            this.runSRTimeout = false;

            this.maybeRunSR = this.maybeRunSR.bind( this );
        }

        componentDidUpdate() {
            this.maybeRunSR();
        }
        componentDidMount() {
            this.maybeRunSR();
        }

        maybeRunSR() {
            const {
                attributes,
            } = this.props;

            if ( ! this.state.allowedSR || this.state.currentSR === attributes.yscSR ) {
                return;
            }

            if ( this.props && this.props.clientId ) {
                this.setState( {
                    currentSR: attributes.yscSR,
                } );

                clearTimeout( this.runSRTimeout );

                this.runSRTimeout = setTimeout( () => {
                    const $element = $( `[id="block-${ this.props.clientId }"]` );
                    const element = $element[ 0 ];

                    if ( element ) {
                        const config = parseSRConfig( attributes.yscSR );

                        config.container = '.edit-post-layout__content';

                        ScrollReveal().clean( element );
                        ScrollReveal().reveal( element, config );
                    }
                }, 150 );
            }
        }

        render() {
            return <BlockListBlock { ...this.props } />;
        }
    }

    return YSCSRWrapper;
}, 'withDataSR' );

// Init filters.
addFilter( 'blocks.registerBlockType', 'ysc/sr/additional-attributes', addAttribute );
addFilter( 'editor.BlockEdit', 'ysc/sr/additional-attributes', withInspectorControl );
addFilter( 'blocks.getSaveContent.extraProps', 'ysc/sr/save-props', addSaveProps );
addFilter( 'editor.BlockListBlock', 'ysc/sr/editor/additional-attributes', withDataSR );
