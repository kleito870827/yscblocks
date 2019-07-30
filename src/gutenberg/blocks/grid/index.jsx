// Import CSS
import './editor.scss';

// External Dependencies.
import classnames from 'classnames/dedupe';

// Internal Dependencies.
// import './awb-fallback';
import getIcon from '../../utils/get-icon';
import ApplyFilters from '../../components/apply-filters';

// import { TemplatesModal } from '../../plugins/templates';

import transforms from './transforms';

const {
    applyFilters,
} = wp.hooks;
const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;
const {
    BaseControl,
    Button,
    ButtonGroup,
    PanelBody,
    RangeControl,
    Placeholder,
    Toolbar,
    Tooltip,
} = wp.components;

const {
    InspectorControls,
    InnerBlocks,
    BlockControls,
} = wp.editor;

class GridBlock extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            selectedLayout: false,
            isTemplatesModalOpen: false,
        };

        this.getColumnsTemplate = this.getColumnsTemplate.bind( this );
        this.onLayoutSelect = this.onLayoutSelect.bind( this );
        this.getColumnsFromLayout = this.getColumnsFromLayout.bind( this );
        this.getLayoutsSelector = this.getLayoutsSelector.bind( this );
    }

    componentDidUpdate() {
        const {
            attributes,
            setAttributes,
        } = this.props;

        let {
            columns,
        } = attributes;

        // update columns number
        if ( this.state.selectedLayout ) {
            const columnsData = this.getColumnsFromLayout( this.state.selectedLayout );
            columns = columnsData.length;

            setAttributes( {
                columns,
            } );

            this.setState( {
                selectedLayout: false,
            } );
        }
    }

    /**
     * Returns the layouts configuration for a given number of columns.
     *
     * @return {Object[]} Columns layout configuration.
     */
    getColumnsTemplate() {
        const {
            attributes,
        } = this.props;

        let {
            columns,
        } = attributes;

        const result = [];

        // Appender added in Gutenberg 5.7.0, so we need to add fallback to columns.
        const appenderExist = typeof InnerBlocks.ButtonBlockAppender !== 'undefined';

        // create columns from selected layout.
        if ( columns < 1 && this.state.selectedLayout ) {
            const columnsData = this.getColumnsFromLayout( this.state.selectedLayout );
            columns = columnsData.length;

            columnsData.forEach( ( colAttrs ) => {
                result.push( [
                    'ysc/grid-column',
                    colAttrs,
                    appenderExist ? [] : [ [ 'core/paragraph', { content: 'Column ' + ( colAttrs.size === 'auto' ? 'Auto' : colAttrs.size ) } ] ],
                ] );
            } );

        // create columns template from columns count.
        } else {
            for ( let k = 1; k <= columns; k++ ) {
                result.push( [ 'ysc/grid-column' ] );
            }
        }

        return result;
    }

    /**
     * Get columns sizes array from layout string
     *
     * @param {string} layout - layout data. Example: `3-6-3`
     *
     * @return {array}.
     */
    getColumnsFromLayout( layout ) {
        const result = [];
        const columnsData = layout.split( '-' );

        columnsData.forEach( ( col ) => {
            const colAttrs = {
                size: col === 'a' ? 'auto' : col,
            };

            // responsive.
            if ( columnsData.length === 2 ) {
                colAttrs.md_size = '12';
            }
            if ( columnsData.length === 3 ) {
                colAttrs.lg_size = '12';
            }
            if ( columnsData.length === 4 ) {
                colAttrs.md_size = '12';
                colAttrs.lg_size = '6';
            }
            if ( columnsData.length === 5 ) {
                colAttrs.sm_size = '12';
                colAttrs.md_size = '5';
                colAttrs.lg_size = '4';
            }
            if ( columnsData.length === 6 ) {
                colAttrs.sm_size = '6';
                colAttrs.md_size = '4';
                colAttrs.lg_size = '3';
            }

            result.push( colAttrs );
        } );

        return result;
    }

    /**
     * Layouts selector when no columns selected.
     *
     * @return {jsx}.
     */
    getLayoutsSelector() {
        let layouts = [
            '12',
            '6-6',
            '4-4-4',
            '3-3-3-3',

            '5-7',
            '7-5',
            '3-3-6',
            '3-6-3',

            '6-3-3',
            '2-8-2',
            'a-a-a-a-a',
            '2-2-2-2-2-2',
        ];
        layouts = applyFilters( 'ysc.editor.grid.layouts', layouts, this.props );

        return (
            <Placeholder
                icon={ getIcon( 'block-grid' ) }
                label={ __( 'Grid' ) }
                instructions={ __( 'Select one layout to get started.' ) }
                className="ysc-select-layout"
            >
                <div className="ysc-grid-layout-preview">
                    { layouts.map( ( layout ) => {
                        const columnsData = this.getColumnsFromLayout( layout );

                        return (
                            <button
                                key={ `layout-${ layout }` }
                                className="ysc-grid-layout-preview-btn"
                                onClick={ () => this.onLayoutSelect( layout ) }
                            >
                                { columnsData.map( ( colAttrs, i ) => {
                                    return (
                                        <div
                                            key={ `layout-${ layout }-col-${ i }` }
                                            className={ classnames( 'ysc-col', `ysc-col-${ colAttrs.size }` ) }
                                        />
                                    );
                                } ) }
                            </button>
                        );
                    } ) }
                </div>
                <Button
                    isPrimary
                    onClick={ () => {
                        this.setState( { isTemplatesModalOpen: true } );
                    } }
                >
                    { __( 'Select Template' ) }
                </Button>
                {/* { this.state.isTemplatesModalOpen ? (
                    <TemplatesModal
                        replaceBlockId={ this.props.clientId }
                        onRequestClose={ () => this.setState( { isTemplatesModalOpen: false } ) }
                    />
                ) : '' } */}
            </Placeholder>
        );
    }

    /**
     * Select predefined layout.
     *
     * @param {String} layout layout string.
     */
    onLayoutSelect( layout ) {
        this.setState( {
            selectedLayout: layout,
        } );
    }

    render() {
        const {
            attributes,
            setAttributes,
            isSelected,
        } = this.props;

        let { className = '' } = this.props;

        const {
            columns,
            gap,
            verticalAlign,
            horizontalAlign,
        } = attributes;

        className = classnames(
            className,
            'ysc-grid',
            `ysc-grid-gap-${ gap }`,
            verticalAlign ? `ysc-grid-align-items-${ verticalAlign }` : false,
            horizontalAlign ? `ysc-grid-justify-content-${ horizontalAlign }` : false
        );

        className = applyFilters( 'ysc.editor.className', className, this.props );

        return (
            <Fragment>
                { columns > 0 ? (
                    <BlockControls>
                        <Toolbar controls={ [
                            {
                                icon: getIcon( 'icon-vertical-top' ),
                                title: __( 'Content Vertical Start' ),
                                onClick: () => setAttributes( { verticalAlign: '' } ),
                                isActive: verticalAlign === '',
                            },
                            {
                                icon: getIcon( 'icon-vertical-center' ),
                                title: __( 'Content Vertical Center' ),
                                onClick: () => setAttributes( { verticalAlign: 'center' } ),
                                isActive: verticalAlign === 'center',
                            },
                            {
                                icon: getIcon( 'icon-vertical-bottom' ),
                                title: __( 'Content Vertical End' ),
                                onClick: () => setAttributes( { verticalAlign: 'end' } ),
                                isActive: verticalAlign === 'end',
                            },
                        ] }
                        />
                    </BlockControls>
                ) : '' }
                <InspectorControls>
                    <ApplyFilters name="ysc.editor.controls" attribute="columns" props={ this.props }>
                        <PanelBody>
                            <RangeControl
                                label={ __( 'Columns' ) }
                                value={ columns }
                                onChange={ ( value ) => setAttributes( { columns: value } ) }
                                min={ 1 }
                                max={ 12 }
                            />
                        </PanelBody>
                    </ApplyFilters>
                </InspectorControls>
                { columns > 0 ? (
                    <InspectorControls>
                        <PanelBody>
                            <BaseControl
                                label={ __( 'Vertical alignment' ) }
                            >
                                <Toolbar controls={ [
                                    {
                                        icon: getIcon( 'icon-vertical-top' ),
                                        title: __( 'Start' ),
                                        onClick: () => setAttributes( { verticalAlign: '' } ),
                                        isActive: verticalAlign === '',
                                    },
                                    {
                                        icon: getIcon( 'icon-vertical-center' ),
                                        title: __( 'Center' ),
                                        onClick: () => setAttributes( { verticalAlign: 'center' } ),
                                        isActive: verticalAlign === 'center',
                                    },
                                    {
                                        icon: getIcon( 'icon-vertical-bottom' ),
                                        title: __( 'End' ),
                                        onClick: () => setAttributes( { verticalAlign: 'end' } ),
                                        isActive: verticalAlign === 'end',
                                    },
                                ] }
                                />
                            </BaseControl>
                            <BaseControl
                                label={ __( 'Horizontal alignment' ) }
                            >
                                <Toolbar controls={ [
                                    {
                                        icon: getIcon( 'icon-horizontal-start' ),
                                        title: __( 'Start' ),
                                        onClick: () => setAttributes( { horizontalAlign: '' } ),
                                        isActive: horizontalAlign === '',
                                    },
                                    {
                                        icon: getIcon( 'icon-horizontal-center' ),
                                        title: __( 'Center' ),
                                        onClick: () => setAttributes( { horizontalAlign: 'center' } ),
                                        isActive: horizontalAlign === 'center',
                                    },
                                    {
                                        icon: getIcon( 'icon-horizontal-end' ),
                                        title: __( 'End' ),
                                        onClick: () => setAttributes( { horizontalAlign: 'end' } ),
                                        isActive: horizontalAlign === 'end',
                                    },
                                    {
                                        icon: getIcon( 'icon-horizontal-around' ),
                                        title: __( 'Around' ),
                                        onClick: () => setAttributes( { horizontalAlign: 'around' } ),
                                        isActive: horizontalAlign === 'around',
                                    },
                                    {
                                        icon: getIcon( 'icon-horizontal-between' ),
                                        title: __( 'Between' ),
                                        onClick: () => setAttributes( { horizontalAlign: 'between' } ),
                                        isActive: horizontalAlign === 'between',
                                    },
                                ] }
                                />
                            </BaseControl>
                        </PanelBody>
                        <PanelBody>
                            <BaseControl label={ __( 'Gap' ) }>
                                <ButtonGroup>
                                    {
                                        [
                                            {
                                                label: __( 'none' ),
                                                value: 'no',
                                            },
                                            {
                                                label: __( 'sm' ),
                                                value: 'sm',
                                            },
                                            {
                                                label: __( 'md' ),
                                                value: 'md',
                                            },
                                            {
                                                label: __( 'lg' ),
                                                value: 'lg',
                                            },
                                        ].map( ( val ) => {
                                            const selected = gap === val.value;

                                            return (
                                                <Button
                                                    isLarge
                                                    isPrimary={ selected }
                                                    aria-pressed={ selected }
                                                    onClick={ () => setAttributes( { gap: val.value } ) }
                                                    key={ `gap_${ val.label }` }
                                                >
                                                    { val.label }
                                                </Button>
                                            );
                                        } )
                                    }
                                </ButtonGroup>
                            </BaseControl>
                        </PanelBody>
                    </InspectorControls>
                ) : '' }                
                <div className={ className }>
                    { columns > 0 || this.state.selectedLayout ? (
                        <Fragment>                           
                            { ! isSelected ? (
                                <div className="ysc-grid-button-select">
                                    <Tooltip text={ __( 'Select Grid' ) }>
                                        { getIcon( 'block-grid' ) }
                                    </Tooltip>
                                </div>
                            ) : '' }
                            <InnerBlocks
                                template={ this.getColumnsTemplate() }
                                templateLock="all"
                                allowedBlocks={ [ 'ysc/grid-column' ] }
                            />
                        </Fragment>
                    ) : this.getLayoutsSelector() }
                </div>
            </Fragment>
        );
    }
}

export const name = 'ysc/grid';

export const settings = {
    title: __( 'Grid' ),
    description: __( 'Responsive grid block to build layouts of all shapes and sizes thanks to a twelve column system. Visual columns size and order change.' ),
    icon: getIcon( 'block-grid', true ),
    category: 'ysc',
    keywords: [
        __( 'row' ),
        __( 'columns' ),
        __( 'section' ),
    ],
    ysc: {       
        supports: {
            styles: true,
            spacings: true,
            display: true,
            scrollReveal: true,
        },
    },
    supports: {
        html: false,
        className: false,
        anchor: true,
    },
    attributes: {
        columns: {
            type: 'number',
            default: 0,
        },
        gap: {
            type: 'string',
            default: 'md',
        },
        verticalAlign: {
            type: 'string',
        },
        horizontalAlign: {
            type: 'string',
        },

        // Should be used in Deprecated block
        columnsSettings: {
            type: 'object',
            default: {},
        },
    },

    edit: GridBlock,

    save: function( props ) {
        const {
            verticalAlign,
            horizontalAlign,
            gap,
        } = props.attributes;

        let className = classnames(
            'ysc-grid',
            `ysc-grid-gap-${ gap }`,
            verticalAlign ? `ysc-grid-align-items-${ verticalAlign }` : false,
            horizontalAlign ? `ysc-grid-justify-content-${ horizontalAlign }` : false
        );        

        className = applyFilters( 'ysc.blocks.className', className, {
            ...{
                name,
            },
            ...props,
        } );

        return (
            <div className={ className }>                
                <InnerBlocks.Content />
            </div>
        );
    },

    transforms,
};
