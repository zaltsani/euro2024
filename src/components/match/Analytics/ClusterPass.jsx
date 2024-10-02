import { kmeans } from 'ml-kmeans';
import * as d3 from 'd3';
import Pitch from '../Pitch'

function ClusterPass(data, pitchProps) {
    const svg = d3.select(pitchProps.svgRef.current);
    svg.selectAll("*").remove();
    Pitch(pitchProps)

    const X = data.map(d => [d.location[0], d.location[1], d.pass.end_location[0], d.pass.end_location[1]])
    const ans = kmeans(X, 15, { initialization: 'kmeans++', seed: 42 }).clusters
    const pass = data.map((d, index) => {
        d['cluster'] = ans[index]
        return d
    });

    const countMap = ans.reduce((acc, num) => {
        acc[num] = (acc[num] || 0) + 1;
        return acc;
    }, {});
    console.log(kmeans(X, 10))

    const sortedNumbers = Object.keys(countMap)
        .sort((a, b) => countMap[b] - countMap[a])
        .map(Number);
    console.log([1, 1, 1])
    
    const dimensions = require('../../../data/dimensions.json')
    const dimension = dimensions["statsbomb"]
    const innerWidth = pitchProps.width - pitchProps.margin.left - pitchProps.margin.right;
    const innerHeight = innerWidth * dimension.width/dimension.length*dimension.aspect;
    const height = pitchProps.margin.top + innerHeight + pitchProps.margin.bottom;

    var scX = d3.scaleLinear().domain([0, dimension.length]).range([ 0, innerWidth ])
    var scY = dimension.invert_y
                ? d3.scaleLinear().domain([0, dimension.width]).range([ 0, innerHeight ])
                : d3.scaleLinear().domain([dimension.width, 0]).range([ 0, innerHeight ])

    const colorScale = d3.scaleSequential()
        .domain([0, d3.max(ans)+1])
        .interpolator(d3.interpolateViridis);
    
    const events = svg
        .append("g")
            .attr("transform", `translate(${pitchProps.margin.left}, ${pitchProps.margin.top})`)
    const event = events
        .selectAll(".event")
        .data(pass)
        .join("g")
            // .attr("fill", d => colorScale(d.cluster+1))
            // .attr("stroke", d => colorScale(d.cluster+1))
            // .attr("opacity", d => d.cluster === 0 || d.cluster === 1 ? 1 : 0)
            .attr("fill", d => d.cluster === sortedNumbers[0] ? 'blue' : d.cluster === sortedNumbers[1] ? 'red' : d.cluster === sortedNumbers[2] ? 'yellow' : 'none')
            .attr("stroke", d => d.cluster === sortedNumbers[0] ? 'blue' : d.cluster === sortedNumbers[1] ? 'red' : d.cluster === sortedNumbers[2] ? 'yellow' : 'none')
    event
        .append("line")
            .attr("stroke-width", 1.5)
            .attr( 'x1', d => scX(d['location'][0]) )
            .attr( 'y1', d => scY(d['location'][1]) )
            .attr( 'x2', d => scX(d['pass']['end_location'][0]) )
            .attr( 'y2', d => scY(d['pass']['end_location'][1]) )
    
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
    event
        .append('path')
        .attr( 'd', d => {
            const startX = d['location'][0]
            const startY = d['location'][1]
            const endX = d['pass']['end_location'][0]
            const endY = d['pass']['end_location'][1]
            const baseLeftX = angle(startX, startY, endX, endY)['baseLeftX']
            const baseLeftY = angle(startX, startY, endX, endY)['baseLeftY']
            const baseRightX = angle(startX, startY, endX, endY)['baseRightX']
            const baseRightY = angle(startX, startY, endX, endY)['baseRightY']
            return `M ${scX(endX)}, ${scY(endY)} L ${scX(baseLeftX)}, ${scY(baseLeftY)} L${scX(baseRightX)}, ${scY(baseRightY)} L ${scX(endX)}, ${scY(endY)}`
        })
    
}

export default ClusterPass