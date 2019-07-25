const {
    createBlock,
} = wp.blocks;

export default {
    from: [
        {
            type: 'block',
            blocks: [ 'ysc/counter-box' ],
            transform: function( attrs, innerBlocks ) {
                return createBlock(
                    'ysc/alert',
                    {
                        iconSize: attrs.numberSize,
                        color: attrs.numberColor,
                        hoverColor: attrs.hoverNumberColor,
                    },
                    innerBlocks,
                );
            },
        },
        {
            type: 'block',
            blocks: [ 'ysc/icon-box' ],
            transform: function( attrs, innerBlocks ) {
                return createBlock(
                    'ysc/alert',
                    {
                        iconSize: attrs.iconSize,
                        color: attrs.iconColor,
                        hoverColor: attrs.hoverIconColor,
                    },
                    innerBlocks,
                );
            },
        },
    ],
};
