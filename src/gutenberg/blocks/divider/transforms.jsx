const { createBlock } = wp.blocks;

export default {
  from: [
    {
      type: "block",
      blocks: ["core/separator"],
      transform: function() {
        return createBlock("ysc/divider");
      }
    }
  ],
  to: [
    {
      type: "block",
      blocks: ["core/separator"],
      transform: function() {
        return createBlock("core/separator");
      }
    }
  ]
};
