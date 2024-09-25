import * as d3 from 'd3';
import { useEffect } from 'react';

function Pitch(props) {
   const { svgRef, width, margin, pitch_dimension, background, line_color } = props;
   const dimensions = require('../../data/dimensions.json')
   const dimension = dimensions[pitch_dimension]

   // const height = width * dimension.width/dimension.length*dimension.aspect;
   const innerWidth = width - margin.left - margin.right;
   const innerHeight = innerWidth * dimension.width/dimension.length*dimension.aspect;
   const height = margin.top + innerHeight + margin.bottom;

   const lineColor = line_color ? line_color : "grey";
   const lineWidth = 2;

   const svg = d3.select(svgRef.current)
      // .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", width)
      .attr("height", height)

   // Scaling
   var scX = d3.scaleLinear().domain([ 0, dimension.length ]).range([ 0, innerWidth ])
   var scY = d3.scaleLinear().domain([ 0, dimension.width ]).range([ 0, innerHeight ])

   const pitch = svg
      .append('g')
         .attr("transform", `translate(${margin.left}, ${margin.top})`)
         .attr("class", 'pitch');

   // background
   // svg.append('path')
   //    .attr('d', `M0 0, H${width} V${height} H0 V0`)
   //    .attr('fill', 'none');

   // Pitch
   pitch.append('path')
      .attr('d', `M0 0 H${innerWidth} V${innerHeight} H0 V0`)
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth);

   // Draw Centre Line
   pitch.append('path')
      .attr('d', `M${innerWidth/2} 0 V${innerHeight}`)
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth)

   // Draw goal areas
   pitch.append('path')
      .attr('d',
         `M0 ${scY(dimension.invert_y ? dimension.penalty_area_top : dimension.penalty_area_bottom)}
         h${scX(dimension.penalty_area_length)}
         v${scY(dimension.penalty_area_width)}
         h-${scX(dimension.penalty_area_length)}`
      )
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth);

   pitch.append('path')
      .attr('d',
         `M${innerWidth} ${scY(dimension.invert_y ? dimension.penalty_area_top : dimension.penalty_area_bottom)}
         h-${scX(dimension.penalty_area_length)}
         v${scY(dimension.penalty_area_width)}
         h${scX(dimension.penalty_area_length)}`
      )
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth);
   
   // Draw six-yard
   pitch.append('path')
      .attr('d',
         `M0 ${scY(dimension.invert_y ? dimension.six_yard_top : dimension.six_yard_bottom)}
         h${scX(dimension.six_yard_length)}
         v${scY(dimension.six_yard_width)}
         h-${scX(dimension.six_yard_length)}`
      )
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth);

   pitch.append('path')
      .attr('d',
         `M${innerWidth} ${scY(dimension.invert_y ? dimension.six_yard_top : dimension.six_yard_bottom)}
         h-${scX(dimension.six_yard_length)}
         v${scY(dimension.six_yard_width)}
         h${scX(dimension.six_yard_length)}`
      )
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth);

   // Draw center circle
   pitch.append('circle')
      .attr('cx', scX(dimension.length/2))
      .attr('cy', scY(dimension.width/2))
      .attr('r', scX(dimension.circle_diameter /2))
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth)
      .attr('fill', 'none');

   // Draw center spot
   pitch.append('circle')
      .attr('cx', scX(dimension.length/2))
      .attr('cy', scY(dimension.width/2))
      .attr('r', lineWidth)
      .attr('fill', lineColor);

   // Draw penalty spots
   pitch.append('circle')
      .attr('cx', scX(dimension.penalty_left))
      .attr('cy', scY(dimension.width/2))
      .attr('r', lineWidth)
      .attr('fill', lineColor);

   pitch.append('circle')
      .attr('cx', scX(dimension.penalty_right))
      .attr('cy', scY(dimension.width/2))
      .attr('r', lineWidth)
      .attr('fill', lineColor);

   // Arc penalty box
   const arcGenerator = d3.arc()
      .outerRadius(scX(dimension.circle_diameter/2)-lineWidth/2)
      .innerRadius(scX(dimension.circle_diameter/2)+lineWidth/2)

   pitch.append('path')
      .attr('transform', `translate(${scX(dimension.penalty_left)}, ${scY(dimension.width/2)})`)
      .attr('d', arcGenerator({
            startAngle:Math.asin((dimension.penalty_area_length-dimension.penalty_left)/(dimension.circle_diameter/2)),
            endAngle:Math.PI - Math.asin((dimension.penalty_area_length-dimension.penalty_left)/(dimension.circle_diameter/2))
         })
      )
      .attr("fill", lineColor)

   pitch.append('path')
      .attr('transform', `translate(${scX(dimension.penalty_right)}, ${scY(dimension.width/2)})`)
      .attr('d', arcGenerator({
            startAngle:Math.PI + Math.asin((dimension.penalty_area_length-dimension.penalty_left)/(dimension.circle_diameter/2)),
            endAngle:2*Math.PI-Math.asin((dimension.penalty_area_length-dimension.penalty_left)/(dimension.circle_diameter/2))
         })
      )
      .attr("fill", lineColor)

      // goal
   pitch.append('path')
      .attr('d', `M0 ${scY(dimension.invert_y ? dimension.goal_top : dimension.goal_bottom)} h-${scX(dimension.goal_length)} v${scY(dimension.goal_width)} h${scX(dimension.goal_length)}`)
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth)
   pitch.append('path')
      .attr('d', `M${scX(dimension.length)} ${scY(dimension.invert_y ? dimension.goal_top : dimension.goal_bottom)} h${scX(dimension.goal_length)} v${scY(dimension.goal_width)} h-${scX(dimension.goal_length)}`)
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth)
   
};
export default Pitch