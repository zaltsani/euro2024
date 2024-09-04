import * as d3 from 'd3';

function Pitch(props) {
   const { svg, id, width, pitch_dimension, background, line_color } = props;
   const dimensions = require('../pitch_data/dimensions.json')
   const dimension = dimensions[pitch_dimension]

   const height = width * dimension.width/dimension.length*dimension.aspect
   const margin = 20;
   const lineColor = line_color ? line_color : "grey";
   const lineWidth = 2;

   // Scaling
   var scX = d3.scaleLinear().domain([ 0, dimension.length ]).range([ margin, width + margin ])
   var scY = d3.scaleLinear().domain([ 0, dimension.width ]).range([ margin, height + margin])
   var scXLen = d3.scaleLinear().domain([ 0, dimension.length ]).range([ 0, width ])
   var scYLen = d3.scaleLinear().domain([ 0, dimension.width ]).range([ 0, height ])

   svg.attr('width', width + margin*2)
      .attr('height', height + margin*2)
      .attr('fill', background ? background : '#2C2C2C')
      .attr('id', id)
      .attr('fill', 'none');

   // Clear previous drawings
   svg.selectAll('*').remove();

   // background
   svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width + (margin*2))
      .attr('height', height + (margin*2))
      .attr('fill', background)

   // // Pitch
   // svg.append('rect')
   //    .attr('x', scX(0))
   //    .attr('y', scY(0))
   //    .attr('width', scX(dimension.length))
   //    .attr('height', scY(dimension.width))
   //    .attr('stroke', lineColor)
   //    .attr('stroke-width', 4);

   // Pitch
   svg.append('path')
   .attr('d', `M ${margin} ${margin} H ${width+margin}
         V${height+margin} H ${margin} V${margin}`)
   .attr('fill', background ? background : '#2C2C2C')
   .attr('stroke', lineColor)
   .attr('stroke-width', 2);

   // Draw Centre Line
   svg.append('line')
      .attr('x1', scX(dimension.length/2))
      .attr('y1', scY(0))
      .attr('x2', scX(dimension.length/2))
      .attr('y2', scY(dimension.width))
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)

   // Draw goal areas
   svg.append('rect')
      .attr('x', scX(0))
      .attr('y', scY(dimension.invert_y ? dimension.penalty_area_top : dimension.penalty_area_bottom))
      .attr('width', scXLen(dimension.penalty_area_length))
      .attr('height', scYLen(dimension.penalty_area_width))
      .attr('stroke', lineColor)
      .attr('stroke-width', 2);

   svg.append('rect')
      .attr('x', scX(dimension.length-dimension.penalty_area_length))
      .attr('y', scY(dimension.invert_y ? dimension.penalty_area_top : dimension.penalty_area_bottom))
      .attr('width', scXLen(dimension.penalty_area_length))
      .attr('height', scYLen(dimension.penalty_area_width))
      .attr('stroke', lineColor)
      .attr('stroke-width', 2);
   
   // Draw six-yard
   svg.append('rect')
      .attr('x', scX(0))
      .attr('y', scY(dimension.invert_y ? dimension.six_yard_top : dimension.six_yard_bottom))
      .attr('width', scXLen(dimension.six_yard_length))
      .attr('height', scYLen(dimension.six_yard_width))
      .attr('stroke', lineColor)
      .attr('stroke-width', 2);

   svg.append('rect')
      .attr('x', scX(dimension.length-dimension.six_yard_length))
      .attr('y', scY(dimension.invert_y ? dimension.six_yard_top : dimension.six_yard_bottom))
      .attr('width', scXLen(dimension.six_yard_length))
      .attr('height', scYLen(dimension.six_yard_width))
      .attr('stroke', lineColor)
      .attr('stroke-width', 2);

   // Draw center circle
   svg.append('circle')
      .attr('cx', scX(dimension.length/2))
      .attr('cy', scY(dimension.width/2))
      .attr('r', scYLen(dimension.circle_diameter /2))
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)
      .attr('fill', 'none');

   // Draw center spot
   svg.append('circle')
      .attr('cx', scX(dimension.length/2))
      .attr('cy', scY(dimension.width/2))
      .attr('r', 2)
      .attr('fill', lineColor);

   // Draw penalty spots
   svg.append('circle')
      .attr('cx', scX(dimension.penalty_left))
      .attr('cy', scY(dimension.width/2))
      .attr('r', 2)
      .attr('fill', lineColor);

   svg.append('circle')
      .attr('cx', scX(dimension.penalty_right))
      .attr('cy', scY(dimension.width/2))
      .attr('r', 2)
      .attr('fill', lineColor);

   // Arc penalty box
   const arc = ((dimension.circle_diameter/2)**2 - (dimension.penalty_area_length-dimension.penalty_left)**2) ** 0.5;
   const arcHeight = dimension.circle_diameter/2 - (dimension.penalty_area_length - dimension.penalty_left);
   svg.append('path')
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)
      .attr('d', `M ${scX(dimension.penalty_area_length)} ${scY(dimension.center_width)} m 0,${scYLen(-arc)} a ${scX(arcHeight)},${scY(arc)} 0 0,1 0 ${scYLen(2*arc)}`);

   svg.append('path')
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)
      .attr('d', `M ${scX(dimension.length - dimension.penalty_area_length)} ${scY(dimension.center_width)} m 0,${scYLen(-arc)} a ${scX(arcHeight)},${scY(arc)} 0 0,0 0 ${scYLen(2*arc)}`);
   
   // goal
   svg.append('path')
     .attr('d', `M ${scX(0)} ${scY(dimension.invert_y ? dimension.goal_top : dimension.goal_bottom)} h-${scXLen(dimension.goal_length)} v${scYLen(dimension.goal_width)} h${scXLen(dimension.goal_length)}`)
     .attr('stroke', lineColor)
     .attr('stroke-width', 2)
   svg.append('path')
     .attr('d', `M ${scX(dimension.length)} ${scY(dimension.invert_y ? dimension.goal_top : dimension.goal_bottom)} h${scXLen(dimension.goal_length)} v${scYLen(dimension.goal_width)} h-${scXLen(dimension.goal_length)}`)
     .attr('stroke', lineColor)
     .attr('stroke-width', 2)

};
export default Pitch