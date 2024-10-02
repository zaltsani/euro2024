import React from 'react'
import * as d3 from 'd3';
import Pitch from '../Pitch';

function PossessionChain(pitchProps, svgRef, eventsData) {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    pitchProps["svgRef"] = svgRef;
    Pitch(pitchProps);

    const dimensions = require('../../../data/dimensions.json');
    const dimension = dimensions["statsbomb"];
    const innerWidth = pitchProps.width - pitchProps.margin.left - pitchProps.margin.right;
    const innerHeight = innerWidth * dimension.width/dimension.length*dimension.aspect;
    const height = pitchProps.margin.top + innerHeight + pitchProps.margin.bottom;

    var scX = d3.scaleLinear().domain([0, dimension.length]).range([ 0, pitchProps.width - pitchProps.margin.left - pitchProps.margin.right ])
    var scY = dimension.invert_y
                ? d3.scaleLinear().domain([0, dimension.width]).range([ 0, innerHeight ])
                : d3.scaleLinear().domain([dimension.width, 0]).range([ 0, innerHeight ])

    const data = eventsData.filter(d => d.type.name === "Pass" || d.type.name === "Carry");

    var arrowLength = 1;
    function angle(x1, y1, x2, y2) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        var angle = Math.atan2(dy, dx)
        var baseLeftX = x2 - arrowLength * Math.cos(angle - Math.PI / 6)
        var baseLeftY = y2 - arrowLength * Math.sin(angle - Math.PI / 6)
        var baseRightX = x2 - arrowLength * Math.cos(angle + Math.PI / 6)
        var baseRightY = y2 - arrowLength * Math.sin(angle + Math.PI / 6)
        
        return ({
            'baseLeftX': baseLeftX,
            'baseLeftY': baseLeftY,
            'baseRightX': baseRightX,
            'baseRightY': baseRightY
        })
    }
    const possession = svg
        .append("g")
            .attr("class", "possession-chain-events")
            .attr("transform", `translate(${pitchProps.margin.left}, ${pitchProps.margin.top})`)
    const event = possession
        .selectAll(".event")
        .data(data)
            .join("g")
                .attr("stroke", d => d.type.name === "Pass" ? "blue" : "red")
                .attr("fill", d => d.type.name === "Pass" ? "blue" : "red")
    event
        .append("line")
            .attr("stroke-width", 1.5)
            .attr( 'x1', d => scX(d['location'][0]) )
            .attr( 'y1', d => scY(d['location'][1]) )
            .attr( 'x2', d => scX(d.type.name === "Pass" ? d['pass']['end_location'][0] : d['carry']['end_location'][0]) )
            .attr( 'y2', d => scY(d.type.name === "Pass" ? d['pass']['end_location'][1] : d['carry']['end_location'][1]) )
    event
        .append("path")
        .attr( 'd', d => {
            const type = d.type.name === "Pass" ? "pass" : "carry";
            const startX = d['location'][0]
            const startY = d['location'][1]
            const endX = d[type]['end_location'][0]
            const endY = d[type]['end_location'][1]
            const baseLeftX = angle(startX, startY, endX, endY)['baseLeftX']
            const baseLeftY = angle(startX, startY, endX, endY)['baseLeftY']
            const baseRightX = angle(startX, startY, endX, endY)['baseRightX']
            const baseRightY = angle(startX, startY, endX, endY)['baseRightY']
            return `M ${scX(endX)}, ${scY(endY)}
                L ${scX(baseLeftX)}, ${scY(baseLeftY)}
                L ${scX(baseRightX)}, ${scY(baseRightY)}
                L ${scX(endX)}, ${scY(endY)}`
        })

    // Legend
    const legend = svg
        .append("g")
            .attr("transform", `translate(${pitchProps.margin.left}, 0)`)
            .attr("class", "legend")
        // .selectAll(".legend-item")
    legend
        .append("text")
            .text(data[0]["possession_team"]["name"])
            .attr("fill", "black")
            .attr("dominant-baseline", "middle")
            .attr("font-size", "18px")
            .attr("font-weight", "bold")
            .attr("y", pitchProps.margin.top/2)
    legend
        .append("line")
            .attr("stroke", "blue")
            .attr("stroke-width", 1.5)
            .attr( 'x1', 0 )
            .attr( 'y1', height - pitchProps.margin.bottom/2 )
            .attr( 'x2', 100 )
            .attr( 'y2', height - pitchProps.margin.bottom/2 )
    legend
        .append("path")
            .attr( 'd', d => {
                const startX = 0
                const startY = height - pitchProps.margin.bottom/2
                const endX = 100
                const endY = height - pitchProps.margin.bottom/2
                const baseLeftX = angle(startX, startY, endX, endY)['baseLeftX']
                const baseLeftY = angle(startX, startY, endX, endY)['baseLeftY']
                const baseRightX = angle(startX, startY, endX, endY)['baseRightX']
                const baseRightY = angle(startX, startY, endX, endY)['baseRightY']
                return `M ${100}, ${height - pitchProps.margin.bottom/2}
                    l ${-10}, ${-5}
                    l ${0}, ${10}
                    l ${10}, ${-5}`
            })
            .attr("fill", "blue")
            .attr("stroke", "blue")
    
    possession
        .append("text")
            .text("start")
            .attr("x", scX(data[0]["location"][0]))
            .attr("y", scY(data[0]["location"][1]))
            .attr("fill", "black")
            .attr("dominant-baseline", "hanging")
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
    possession
        .append("text")
            .text("end")
            .attr("x", scX(data[data.length-1].type.name === "Pass" ? data[data.length-1]["pass"]["end_location"][0] : data[data.length-1]["carry"]["end_location"][0]))
            .attr("y", scY(data[data.length-1].type.name === "Pass" ? data[data.length-1]["pass"]["end_location"][1] : data[data.length-1]["carry"]["end_location"][1]))
            .attr("fill", "black")
            .attr("dominant-baseline", "hanging")
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
};

export default PossessionChain