import * as d3 from 'd3';
import Pitch from '../Pitch'

function Heatmaps(data, pitchProps) {
    const svg = d3.select(pitchProps.svgRef.current);
    svg.selectAll("*").remove();

    const xAccessor = (d) => d.location[0];
    const yAccessor = (d) => d.location[1];

    const dimensions = require('../../../data/dimensions.json');
    const dimension = dimensions["statsbomb"];
    const innerWidth = pitchProps.width - pitchProps.margin.left - pitchProps.margin.right;
    const innerHeight = innerWidth * dimension.width/dimension.length*dimension.aspect;
    const height = pitchProps.margin.top + innerHeight + pitchProps.margin.bottom;

    var scX = d3.scaleLinear().domain([0, dimension.length]).range([ 0, pitchProps.width - pitchProps.margin.left - pitchProps.margin.right ])
    var scY = dimension.invert_y
                ? d3.scaleLinear().domain([0, dimension.width]).range([ 0, innerHeight ])
                : d3.scaleLinear().domain([dimension.width, 0]).range([ 0, innerHeight ])


    const densityData = d3
        .contourDensity()
        .x(d => scX(d.location[0]))
        .y(d => scY(d.location[1]))
        .size([innerWidth, innerHeight])
        .bandwidth(13)(data)

    const color = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(densityData, d => d.value)]);

    svg.append("clipPath")
        .attr("id", "clipHeatmap")
        .append("rect")
            .attr("width", innerWidth)
            .attr("height", innerHeight)

    const heatmaps = svg
        .append("g")
            .attr("transform", `translate(${pitchProps.margin.left}, ${pitchProps.margin.top})`)
            .attr("id", "heatmaps")
    heatmaps
        .selectAll(".heatmapsAction")
        .data(densityData)
            .join("path")
                .attr("d", d3.geoPath())
                .attr("fill", d => color(d.value))
                .attr("clip-path", "url(#clipHeatmap)")

    Pitch(pitchProps)
    
    // Make Direction of Attack
    const attackingDirection = svg.append("g").attr("class", "direction-of-attack").attr("transform", `translate(${pitchProps.margin.left}, ${pitchProps.margin.top})`)
    attackingDirection.append("path")
        .attr("d",
            `M${innerWidth/2 - innerWidth/4} ${innerHeight + pitchProps.margin.bottom*1/3}
            L${innerWidth/2 + innerWidth/4} ${innerHeight + pitchProps.margin.bottom*1/3}`)
        .attr("stroke", "grey")
        .attr("stroke-width", 2)
    
    attackingDirection.append("path")
        .attr("d", `
                M${innerWidth/2 + innerWidth/4} ${innerHeight + pitchProps.margin.bottom*1/3}
                L${innerWidth/2 + innerWidth/4 - 15} ${innerHeight + pitchProps.margin.bottom*1/3 + 10}
                L${innerWidth/2 + innerWidth/4 - 15} ${innerHeight + pitchProps.margin.bottom*1/3 - 10}
                L${innerWidth/2 + innerWidth/4 } ${innerHeight + pitchProps.margin.bottom*1/3}
            `)
        .attr("fill", "grey ")
        .attr("stroke", "grey")
        .attr("stroke-width", 2);

    attackingDirection
        .append("text")
            .attr("transform", `translate(${innerWidth*1/2}, ${innerHeight + pitchProps.margin.bottom*2/3})`)
            .text(`Direction of Attack`)
            .attr("fill", "grey")
            .attr("text-anchor", "middle")
            .attr("font-size", "14px");

    // Color Legend
    const legendWidth = pitchProps.width/20;
    const legendHeight = innerHeight;
    const legendX = 0;
    const legendY = 0;

    const defs = svg.append("defs");

    const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

    const numStops = 10; // Number of gradient stops
    const stops = d3.range(numStops).map(i => ({
        offset: `${(i / (numStops - 1)) * 100}%`,
        color: d3.interpolateBlues(i / (numStops - 1))
    }));

    linearGradient.selectAll("stop")
        .data(stops)
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);
    
    const legend = svg
        .append("g")
            .attr("transform", `translate(${pitchProps.width - 1/3*pitchProps.margin.right}, ${pitchProps.margin.top})`)
    legend.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#linear-gradient)");

    // Create scale and axis for legend
    // const legendScale = d3.scaleLinear()
    //     .domain(color.domain())
    //     .range([legendHeight, 0]);

    // const legendAxis = d3.axisLeft(legendScale)
    //     .ticks(numStops)
    //     .tickFormat(d3.format(".2f"));

    // legend.append("g")
    //     .attr("transform", `translate(0, ${legendY + legendHeight})`)
    //     .call(legendAxis);

}

export default Heatmaps