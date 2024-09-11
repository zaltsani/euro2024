// import React from 'react';
// import * as d3 from 'd3';

// const AddEvents = ({svg, data, width, pitchProps, homeTeamName, scX, scY, scXG, dimension}) => {
//     // const svg = d3.select("#chalkboard");
//     const color = "blue";

//     // Scaling
//     // const dimensions = require('../../data/dimensions.json')
//     // const dimension = dimensions["statsbomb"]
//     // var scX = d3.scaleLinear().domain([0, dimension.length]).range([ 0, width - 2*pitchProps["margin"] ])
//     // var scY = dimension.invert_y
//     //             ? d3.scaleLinear().domain([0, dimension.width]).range([ 0, width * dimension.width/dimension.length*dimension.aspect - 2*pitchProps["margin"] ])
//     //             : d3.scaleLinear().domain([dimension.width, 0]).range([ 0, width * dimension.width/dimension.length*dimension.aspect - 2*pitchProps["margin"] ])
//     // var scXG = d3.scaleLinear().domain([ 0, 1 ]).range([ 4, 20 ])

//     svg.selectAll( "circle" )
//             .data( data )
//             .enter()
//             .append( "circle" )
//             .attr( 'r', d => scXG(d['shot']['statsbomb_xg']) ).attr( 'fill', d => d['shot']['outcome']['name'] === 'Goal' ? 'red' : color )
//             .attr( 'cx', d =>  scX(d['team']['name'] === homeTeamName ? d['location'][0] : dimension.length - d['location'][0]) )
//             .attr( 'cy', d => scY(d['team']['name'] === homeTeamName ? d['location'][1] : dimension.width - d['location'][1]))
//     svg.selectAll( "line" )
//             .data( data ).enter()
//             .append( "line" ).attr( 'stroke', color )
//             .attr( 'x1', d => scX(d['team']['name'] === homeTeamName ? d['location'][0] : dimension.length - d['location'][0]) )
//             .attr( 'y1', d => scY(d['team']['name'] === homeTeamName ? d['location'][1] : dimension.width - d['location'][1]) )
//             .attr( 'x2', d => scX(d['team']['name'] === homeTeamName ? d['shot']['end_location'][0] : dimension.length - d['shot']['end_location'][0] ) )
//             .attr( 'y2', d => scY(d['team']['name'] === homeTeamName ? d['shot']['end_location'][1] : dimension.width - d['shot']['end_location'][1] ) )
// }

// export default AddEvents