const { createBlock } = wp.blocks;

export default {
  from: [
    {
      type: "block",
      blocks: ["core/columns"],
      transform: function(attrs, InnerBlocks) {
        return createBlock(
          "ysc/grid",
          {
            columns: attrs.columns
          },
          InnerBlocks.map(col => {
            return createBlock("ysc/grid-column", {}, col.innerBlocks);
          })
        );
      }
    }
  ]
};
