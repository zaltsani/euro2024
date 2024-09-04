import * as d3 from 'd3';

function VerticalPitch(props) {
   const { svg, id, width, pitch_dimension, background, line_color } = props;
   const dimensions = require('../../data/dimensions.json')
   const dimension = dimensions[pitch_dimension]

   const height = width * dimension.length / dimension.width / dimension.aspect
   const margin = 20;
   const lineColor = line_color ? line_color : "white";
   const lineWidth = 2;

   // Scaling
   var scX = d3.scaleLinear().domain([0, dimension.length ]).range([ margin, height + margin ])
   var scY = d3.scaleLinear().domain([0, dimension.width ]).range([ margin, width + margin])
   var scXLen = d3.scaleLinear().domain([0, dimension.length ]).range([ 0, height ])
   var scYLen = d3.scaleLinear().domain([0, dimension.width ]).range([ 0, width ])
   
   
   svg.attr('width', width + margin * 2)
      .attr('height', height + margin * 2)
    //   .attr('fill', background ? background : '#2C2C2C');
      .attr('fill', 'none')

   // Clear previous drawings
//    svg.selectAll('*').remove();

   // background
   svg.append('rect')
      .attr('y', 0)
      .attr('x', 0)
      .attr('width', width + (margin*2))
      .attr('height', height + (margin*2))
      .attr('fill', 'white')
      // .attr('stroke', 'black')
      // .attr('stroke-width', 2);

    // Pitch
    svg.append('path')
      .attr('d', `M ${margin} ${margin} H ${width+margin}
            V${height+margin} H ${margin} V${margin}`)
      .attr('fill', background ? background : '#2C2C2C')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2);

    // Centre Line
    svg.append('path')
      .attr('d', `M${margin} ${scX(dimension.length/2)} H${scY(dimension.width)}`)
      .attr('stroke', lineColor)
      .attr('stroke-width', 2);

   // goal areas
   svg.append('rect')
      .attr('y', scX(0))
      .attr('x', scY(dimension.invert_y ? dimension.penalty_area_top : dimension.penalty_area_bottom))
      .attr('height', scXLen(dimension.penalty_area_length))
      .attr('width', scYLen(dimension.penalty_area_width))
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth);

   svg.append('rect')
      .attr('y', scX(dimension.length - dimension.penalty_area_length))
      .attr('x', scY(dimension.invert_y ? dimension.penalty_area_top : dimension.penalty_area_bottom))
      .attr('height', scXLen(dimension.penalty_area_length))
      .attr('width', scYLen(dimension.penalty_area_width))
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth);
   
   // Draw six-yard
   svg.append('rect')
      .attr('y', scX(0))
      .attr('x', scY(dimension.invert_y ? dimension.six_yard_top : dimension.six_yard_bottom))
      .attr('height', scXLen(dimension.six_yard_length))
      .attr('width', scYLen(dimension.six_yard_width))
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth);

   svg.append('rect')
      .attr('y', scX(dimension.length - dimension.six_yard_length))
      .attr('x', scY(dimension.invert_y ? dimension.six_yard_top : dimension.six_yard_bottom))
      .attr('height', scXLen(dimension.six_yard_length))
      .attr('width', scYLen(dimension.six_yard_width))
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth);

   // Draw center circle
   svg.append('circle')
      .attr('cx', margin + width / 2)
      .attr('cy', margin + height / 2)
      .attr('r', scYLen(dimension.circle_diameter / 2))
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth)
    //   .attr('fill', 'none');

   // Draw center spot
   svg.append('circle')
      .attr('cx', margin + width / 2)
      .attr('cy', margin + height / 2)
      .attr('r', 2)
      .attr('fill', lineColor);

   // Draw penalty spots
   svg.append('circle')
      .attr('cy', scX(dimension.penalty_left))
      .attr('cx', scY(dimension.width/2))
      .attr('r', 2)
      .attr('fill', lineColor);

   svg.append('circle')
      .attr('cy', scX(dimension.penalty_right))
      .attr('cx', scY(dimension.width/2))
      .attr('r', 2)
      .attr('fill', lineColor);

   // Arc penalty box
   const arc = ((dimension.circle_diameter/2)**2 - (dimension.penalty_area_length-dimension.penalty_left)**2) ** 0.5
   const arcHeight = dimension.circle_diameter/2 - (dimension.penalty_area_length - dimension.penalty_left);
   svg.append('path')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)
      .attr('d', `M ${scY(dimension.center_width)} ${scX(dimension.penalty_area_length)} m ${scXLen(-arc)},0 a ${scX(arc)},${scY(arcHeight)} 0 0,0 ${scXLen(2*arc)} 0 `);
   
   svg.append('path')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)
      .attr('d', `M ${scY(dimension.center_width)} ${scX(dimension.length - dimension.penalty_area_length)} m ${scXLen(-arc)},0 a ${scX(arc)},${scY(arcHeight)} 0 0,1 ${scXLen(2*arc)} 0 `);

   // goal
   svg.append('path')
     .attr('d', `M${scY(dimension.invert_y ? dimension.goal_top : dimension.goal_bottom)} ${scX(0)} v-${scXLen(dimension.goal_length)} h${scYLen(dimension.goal_width)} v${scXLen(dimension.goal_length)}`)
     .attr('stroke', lineColor)
     .attr('stroke-width', 2)
   svg.append('path')
     .attr('d', `M${scY(dimension.invert_y ? dimension.goal_top : dimension.goal_bottom)} ${scX(dimension.length)} v${scXLen(dimension.goal_length)} h${scYLen(dimension.goal_width)} v-${scXLen(dimension.goal_length)}`)
     .attr('stroke', lineColor)
     .attr('stroke-width', 2)
};

export default VerticalPitch