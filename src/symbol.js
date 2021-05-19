const symbolProps = {
  $: {
    alpha: '1',
    name: 'markerSymbol',
    clip_to_extent: '1',
    type: 'marker',
    force_rhr: '0',
  },
  data_defined_properties: [
    {
      Option: [
        {
          $: { type: 'Map' },
          Option: [
            { $: { name: 'name', value: '', type: 'QString' } },
            { $: { name: 'properties' } },
            {
              $: {
                name: 'type',
                value: 'collection',
                type: 'QString',
              },
            },
          ],
        },
      ],
    },
  ],
  layer: [
    {
      $: {
        enabled: '1',
        pass: '0',
        locked: '0',
        class: 'SimpleMarker',
      },
      Option: [
        {
          $: { type: 'Map' },
          Option: [
            { $: { name: 'angle', value: '0', type: 'QString' } },
            {
              $: {
                name: 'color',
                value: '133,182,111,255',
                type: 'QString',
              },
            },
            {
              $: {
                name: 'horizontal_anchor_point',
                value: '1',
                type: 'QString',
              },
            },
            {
              $: {
                name: 'joinstyle',
                value: 'bevel',
                type: 'QString',
              },
            },
            { $: { name: 'name', value: 'circle', type: 'QString' } },
            { $: { name: 'offset', value: '0,0', type: 'QString' } },
            {
              $: {
                name: 'offset_map_unit_scale',
                value: '3x:0,0,0,0,0,0',
                type: 'QString',
              },
            },
            {
              $: { name: 'offset_unit', value: 'MM', type: 'QString' },
            },
            {
              $: {
                name: 'outline_color',
                value: '35,35,35,255',
                type: 'QString',
              },
            },
            {
              $: {
                name: 'outline_style',
                value: 'solid',
                type: 'QString',
              },
            },
            {
              $: {
                name: 'outline_width',
                value: '0',
                type: 'QString',
              },
            },
            {
              $: {
                name: 'outline_width_map_unit_scale',
                value: '3x:0,0,0,0,0,0',
                type: 'QString',
              },
            },
            {
              $: {
                name: 'outline_width_unit',
                value: 'MM',
                type: 'QString',
              },
            },
            {
              $: {
                name: 'scale_method',
                value: 'diameter',
                type: 'QString',
              },
            },
            { $: { name: 'size', value: '2', type: 'QString' } },
            {
              $: {
                name: 'size_map_unit_scale',
                value: '3x:0,0,0,0,0,0',
                type: 'QString',
              },
            },
            {
              $: { name: 'size_unit', value: 'MM', type: 'QString' },
            },
            {
              $: {
                name: 'vertical_anchor_point',
                value: '1',
                type: 'QString',
              },
            },
          ],
        },
      ],
      prop: [
        { $: { v: '0', k: 'angle' } },
        { $: { v: '133,182,111,255', k: 'color' } },
        { $: { v: '1', k: 'horizontal_anchor_point' } },
        { $: { v: 'bevel', k: 'joinstyle' } },
        { $: { v: 'circle', k: 'name' } },
        { $: { v: '0,0', k: 'offset' } },
        { $: { v: '3x:0,0,0,0,0,0', k: 'offset_map_unit_scale' } },
        { $: { v: 'MM', k: 'offset_unit' } },
        { $: { v: '35,35,35,255', k: 'outline_color' } },
        { $: { v: 'solid', k: 'outline_style' } },
        { $: { v: '0', k: 'outline_width' } },
        {
          $: { v: '3x:0,0,0,0,0,0', k: 'outline_width_map_unit_scale' },
        },
        { $: { v: 'MM', k: 'outline_width_unit' } },
        { $: { v: 'diameter', k: 'scale_method' } },
        { $: { v: '2', k: 'size' } },
        { $: { v: '3x:0,0,0,0,0,0', k: 'size_map_unit_scale' } },
        { $: { v: 'MM', k: 'size_unit' } },
        { $: { v: '1', k: 'vertical_anchor_point' } },
      ],
      data_defined_properties: [
        {
          Option: [
            {
              $: { type: 'Map' },
              Option: [
                { $: { name: 'name', value: '', type: 'QString' } },
                { $: { name: 'properties' } },
                {
                  $: {
                    name: 'type',
                    value: 'collection',
                    type: 'QString',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default symbolProps;
