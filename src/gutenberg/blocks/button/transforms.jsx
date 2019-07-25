const { createBlock } = wp.blocks;

export default {
  from: [
    {
      type: "block",
      blocks: ["core/button"],
      transform: function(attrs) {
        return createBlock(
          "ysc/button",
          {
            align: attrs.align,
            count: 1
          },
          [
            createBlock("ysc/button-single", {
              url: attrs.url,
              text: attrs.text
            })
          ]
        );
      }
    }
  ]
};
