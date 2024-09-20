import * as d3 from 'd3';
import { useEffect } from 'react';

function VerticalPitch(props) {
   const { svgRef, width, pitch_dimension, background, line_color } = props;
   const dimensions = require('../../data/dimensions.json')
   const dimension = dimensions[pitch_dimension]

   const height = width * dimension.length/dimension.width*dimension.aspect
   const margin = height/40;
   const innerWidth = width - margin - margin;
   const innerHeight = height - margin - margin;

   const lineColor = line_color ? line_color : "grey";
   const lineWidth = 2;

   const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

   // Scaling
   var scX = d3.scaleLinear().domain([ 0, dimension.length ]).range([ 0, innerHeight ])
   var scY = d3.scaleLinear().domain([ 0, dimension.width ]).range([ 0, innerWidth ])

   const pitch = svg
      .append('g')
         .attr("transform", `translate(${margin}, ${margin})`)
         .attr("class", 'pitch');

   // Pitch
   pitch.append('path')
      .attr('d', `M0 0 H${innerWidth} V${innerHeight} H0 V0`)
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth);

   // Draw Centre Line
   pitch.append('path')
      .attr('d', `M0 ${innerHeight/2} H${innerWidth}`)
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth)

   // Draw goal areas
   pitch.append('path')
      .attr('d',
         `M${scY(dimension.invert_y ? dimension.penalty_area_top : dimension.penalty_area_bottom)} 0
         v${scX(dimension.penalty_area_length)}
         h${scY(dimension.penalty_area_width)}
         v-${scX(dimension.penalty_area_length)}`
      )
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth);

   pitch.append('path')
      .attr('d',
         `M${scY(dimension.invert_y ? dimension.penalty_area_top : dimension.penalty_area_bottom)} ${innerHeight}
         v-${scX(dimension.penalty_area_length)}
         h${scY(dimension.penalty_area_width)}
         v${scX(dimension.penalty_area_length)}`
      )
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth);
   
   // Draw six-yard
   pitch.append('path')
      .attr('d',
         `M${scY(dimension.invert_y ? dimension.six_yard_top : dimension.six_yard_bottom)} 0
         v${scX(dimension.six_yard_length)}
         h${scY(dimension.six_yard_width)}
         v-${scX(dimension.six_yard_length)}`
      )
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth);

   pitch.append('path')
      .attr('d',
         `M${scY(dimension.invert_y ? dimension.six_yard_top : dimension.six_yard_bottom)} ${innerHeight}
         v-${scX(dimension.six_yard_length)}
         h${scY(dimension.six_yard_width)}
         v${scX(dimension.six_yard_length)}`
      )
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth);

   // Draw center circle
   pitch.append('circle')
      .attr('cy', scX(dimension.length/2))
      .attr('cx', scY(dimension.width/2))
      .attr('r', scX(dimension.circle_diameter /2))
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth)
      .attr('fill', 'none');

   // Draw center spot
   pitch.append('circle')
      .attr('cy', scX(dimension.length/2))
      .attr('cx', scY(dimension.width/2))
      .attr('r', lineWidth)
      .attr('fill', lineColor);

   // Draw penalty spots
   pitch.append('circle')
      .attr('cy', scX(dimension.penalty_left))
      .attr('cx', scY(dimension.width/2))
      .attr('r', lineWidth)
      .attr('fill', lineColor);

   pitch.append('circle')
      .attr('cy', scX(dimension.penalty_right))
      .attr('cx', scY(dimension.width/2))
      .attr('r', lineWidth)
      .attr('fill', lineColor);

   // Arc penalty box
   const arcGenerator = d3.arc()
      .outerRadius(scX(dimension.circle_diameter/2)-lineWidth/2)
      .innerRadius(scX(dimension.circle_diameter/2)+lineWidth/2)

   pitch.append('path')
      .attr('transform', `translate(${scY(dimension.width/2)}, ${scX(dimension.penalty_left)})`)
      .attr('d', arcGenerator({
            startAngle:Math.PI + Math.acos((dimension.penalty_area_length-dimension.penalty_left)/(dimension.circle_diameter/2)),
            endAngle:Math.PI - Math.acos((dimension.penalty_area_length-dimension.penalty_left)/(dimension.circle_diameter/2))
         })
      )
      .attr("fill", lineColor)

   pitch.append('path')
      .attr('transform', `translate(${scY(dimension.width/2)}, ${scX(dimension.penalty_right)})`)
      .attr('d', arcGenerator({
            startAngle:-Math.acos((dimension.penalty_area_length-dimension.penalty_left)/(dimension.circle_diameter/2)),
            endAngle:Math.acos((dimension.penalty_area_length-dimension.penalty_left)/(dimension.circle_diameter/2))
         })
      )
      .attr("fill", lineColor)

      // goal
   pitch.append('path')
      .attr('d', `M${scY(dimension.invert_y ? dimension.goal_top : dimension.goal_bottom)} 0 v-${scX(dimension.goal_length)} h${scY(dimension.goal_width)} v${scX(dimension.goal_length)}`)
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth)
   pitch.append('path')
      .attr('d', `M${scY(dimension.invert_y ? dimension.goal_top : dimension.goal_bottom)} ${scX(dimension.length)} v${scX(dimension.goal_length)} h${scY(dimension.goal_width)} v-${scX(dimension.goal_length)}`)
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth)
   
};
export default VerticalPitch