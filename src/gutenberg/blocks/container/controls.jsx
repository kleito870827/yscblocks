/**
 * WordPress dependencies
 */
const { __ } = wp.i18n;
const { Fragment } = wp.element;
const { BlockControls, AlignmentToolbar } = wp.editor;

const Controls = props => {
  const { attributes, setAttributes } = props;
  const { containers } = attributes;
  const containersControls = [
    {
      icon: "image-flip-horizontal",
      title: __("Container Fluid", "yscb"),
      align: "full"
    },
    {
      icon: "align-center",
      title: __("Container", "yscb"),
      align: "wide"
    }
  ];
  return (
    <Fragment>
      <BlockControls>
        <AlignmentToolbar
          value={containers}
          onChange={newLayout =>
            setAttributes({
              containers: newLayout
            })
          }
          alignmentControls={containersControls}
        />
      </BlockControls>
    </Fragment>
  );
};

export default Controls;
