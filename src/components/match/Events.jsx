import React, { useEffect, useRef, useState } from 'react'
import Pitch from './Pitch';
import * as d3 from 'd3';
import { Button, ButtonGroup, Col, Form, Row } from 'react-bootstrap';
import '../../styles/match/Events.css';
import { Slider, Stack,  } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

function Events(props) {
    const { matchData, lineupsData, eventsData, threeSixtyData } = props;
    const chalkboardRef = useRef();

    const homeTeamName = matchData.home_team.home_team_name;
    const awayTeamName = matchData.away_team.away_team_name;
    
    const [homeAway, setHomeAway] = useState('home')
    const [homeSelectAllCheck, setHomeSelectAllCheck] = useState(true);
    const [awaySelectAllCheck, setAwaySelectAllCheck] = useState(true);
    const [homePlayersPlay, setHomePlayersPlay] = useState([]);
    const [awayPlayersPlay, setAwayPlayersPlay] = useState([]);
    const [eventShow, setEventShow] = useState('shot');
    const [eventClick, setEventClick] = useState(false);
    const listPlayersPlay = homeAway === 'home' ? homePlayersPlay : awayPlayersPlay;
    const maxMinute = d3.max(eventsData, d => d.minute);
    const [value, setValue] = useState([0, maxMinute]);

    const handleValueChange = (event, newValue) => {
        setValue(newValue);
    };

    function valueText(value) {
        return `${value}°C`;
    }

    const handleEventClickOut = () => {
        setEventClick(false);
        d3.select(chalkboardRef.current).select(".events").selectAll("*").attr("opacity", 1)
        d3.select(chalkboardRef.current).select(".three-sixty").remove();
    }

    const handleHomeCheckBox = (id) => {
        setHomePlayersPlay((homePlayersPlay) => homePlayersPlay.map((player) => 
            player.player_id === id
            ? { ...player, isChecked: !player.isChecked }
            : player
        ))
    };

    const handleAwayCheckBox = (id) => {
        setAwayPlayersPlay((awayPlayersPlay) => awayPlayersPlay.map((player) => 
            player.player_id === id
            ? { ...player, isChecked: !player.isChecked }
            : player
        ))
    };

    const hadleHomeSelectAllCheckBox = () => {
        setHomePlayersPlay((homePlayersPlay) => homePlayersPlay.map((player) =>
            ({ ...player, isChecked: homeSelectAllCheck ? false : true }),
        setHomeSelectAllCheck( homeSelectAllCheck ? false : true )
        ));
    };
    
    const hadleAwaySelectAllCheckBox = () => {
        setAwayPlayersPlay((awayPlayersPlay) => awayPlayersPlay.map((player) =>
            ({ ...player, isChecked: awaySelectAllCheck ? false : true }),
        setAwaySelectAllCheck( awaySelectAllCheck ? false : true )
        ));
    };

    useEffect(() => {
        const homeLineups = lineupsData[0]["lineup"];
        const awayLineups = lineupsData[1]["lineup"];
        const homePlayersPlay = homeLineups.filter(d => d.positions.length !== 0)
            .map(player => ({
                ...player,
                isChecked:true
            }))
            .sort((a, b) => a["positions"][0]["position_id"] - b["positions"][0]["position_id"]);
        const awayPlayersPlay = awayLineups.filter(d => d.positions.length !== 0)
            .map(player => ({
                ...player,
                isChecked:true
            }))
            .sort((a, b) => a["positions"][0]["position_id"] - b["positions"][0]["position_id"]);
        setHomePlayersPlay(homePlayersPlay)
        setAwayPlayersPlay(awayPlayersPlay)
    }, [lineupsData])
    
    useEffect(() => {
        const svg = d3.select(chalkboardRef.current)
        svg.selectAll("*").remove()
        // Make Pitch
        const id = 'chalkboard';
        const width = 900
        const pitchProps = {
            svgRef: chalkboardRef,
            width: width,
            margin: {
                top: width/20,
                left: width/40,
                right: width/40,
                bottom: width/10
            },
            pitch_dimension: 'statsbomb',
            background: 'white',
            line_color: 'grey'
        };        
        Pitch(pitchProps)

        const dimensions = require('../../data/dimensions.json')
        const dimension = dimensions["statsbomb"]
        const innerWidth = width - pitchProps.margin.left - pitchProps.margin.right;
        const innerHeight = innerWidth * dimension.width/dimension.length*dimension.aspect;
        const height = pitchProps.margin.top + innerHeight + pitchProps.margin.bottom;

        var scX = d3.scaleLinear().domain([0, dimension.length]).range([ 0, width - pitchProps.margin.left - pitchProps.margin.right ])
        var scY = dimension.invert_y
                    ? d3.scaleLinear().domain([0, dimension.width]).range([ 0, innerHeight ])
                    : d3.scaleLinear().domain([dimension.width, 0]).range([ 0, innerHeight ])
        var scXG = d3.scaleLog().domain([ 1, 10 ]).range([ 5, 12 ])
        const color = 'blue';

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
                .attr("font-size", "20px");


        // Data for Event Filter Player
        const player_ids = [];
        for (const player in homePlayersPlay) {
            if (homePlayersPlay[player]["isChecked"]) {
                player_ids.push(homePlayersPlay[player]['player_id'])
            }
        }
        for (const player in awayPlayersPlay) {
            if (awayPlayersPlay[player]["isChecked"]) {
                player_ids.push(awayPlayersPlay[player]['player_id'])
            }
        }

        const shot = eventsData.filter(event => event.type.name === 'Shot');
        const pass = eventsData.filter(event => event.type.name === 'Pass');
        const interceptions = eventsData.filter(event => event.type.name === 'Interception');
        const clearances = eventsData.filter(event => event.type.name === 'Clearance');
        const duel = eventsData.filter(event => event.type.name === 'Duel');
        const dribble = eventsData.filter(event => event.type.name === 'Dribble');
        const defensiveAction = eventsData.filter(event => (event.type.name === 'Interception') || (event.type.name === 'Clearance') || (event.type.name === 'Duel') || (event.type.name === 'Ball Recovery') || (event.type.name === 'Block') || (event.type.name === 'Foul Committed') || (event.type.name === '50/50'));
        const carry = eventsData.filter(event => event.type.name === 'Carry');

        const data = eventShow === 'shot' ? shot
            : eventShow === 'pass' ? pass
            : eventShow === 'interception' ? interceptions
            : eventShow === 'clearance' ? clearances 
            : eventShow === 'duel' ? duel 
            : eventShow === 'dribble' ? dribble 
            : eventShow === 'carry' ? carry
            : shot;
        const filteredData = data.filter(event => player_ids.includes(event.player.id) && event.team.name === (homeAway === 'home' ? homeTeamName : awayTeamName) && event.minute >= value[0] && event.minute <= value[1]);
        
        const events = d3.select(chalkboardRef.current)
            .append("g")
                .attr("transform", `translate(${pitchProps.margin.left}, ${pitchProps.margin.top})`)
                .attr("class", "events")

        if (eventShow === 'shot') {
            const shotFormatsInfo = [
                {id: 'Goal', label: "Goal", color: "#e63946", count: filteredData.filter(d => d.shot.outcome.name === 'Goal').length},
                {id: 'Saved', label: "Saved", color: "#ffbe0b", count: filteredData.filter(d => d.shot.outcome.name === 'Saved').length},
                {id: 'Post', label: "Hit Post", color: "black", count: filteredData.filter(d => d.shot.outcome.name === 'Post').length},
                {id: 'Blocked', label: "Blocked", color: "#457b9d", count: filteredData.filter(d => d.shot.outcome.name === 'Blocked').length},
                {id: 'Off T', label: "Off Target", color: "#f1faee", count: filteredData.filter(d => (d.shot.outcome.name !== 'Goal') && (d.shot.outcome.name !== 'Saved') && (d.shot.outcome.name !== 'Post') && (d.shot.outcome.name !== 'Blocked')).length}
            ]

            var event = events.selectAll(".event-group")
                .data(filteredData)
                .join("g")
                    .attr("class", "event-group")
                    .attr("transform", function(d) { return `translate(${scX(d['location'][0])}, ${scY(d['location'][1])})`})

            event
                .on("mouseover", function(mouseEvent, d) {
                    var tooltipBackground = tooltipWrapper.append("rect")
                        .attr("class", "tooltip-background")
                    var tooltipContent = tooltipWrapper.append("g")
                        .attr("class", "tooltip-content")
                    tooltip
                        .transition().duration(400)
                        .style("opacity", 1)

                    var marginRow = 25;
                    var row = 8;
                    let backgroundHeight = 40 + 26*row;
                    let y = -backgroundHeight/2 + 30;

                    // event.select("circle").attr("r", 10)
                    tooltipContent.attr("transform", `translate(20, 0)`)
                    tooltipContent.append("text").text(d.type.name).attr("y", y).style("font-weight", "bold").style("font-size", "20px")
                        .append("tspan").text(`  (${d.shot.outcome.name})`).style("font-weight", "normal").style("font-size", "18px")
                    tooltipContent.append("text").text(`Team: ${d.team.name}`).attr("y", y += marginRow);
                    tooltipContent.append("text").text(`Player: ${d.player.name}`).attr("y", y += marginRow);
                    tooltipContent.append("text").text(`xG: ${Math.round(d.shot.statsbomb_xg * 100) / 100}`).attr("y", y += marginRow);
                    tooltipContent.append("text").text(`Minute: ${d.minute}`).attr("y", y += marginRow)
                    tooltipContent.append("text").text(`Play Pattern: ${d.play_pattern.name}`).attr("y", y += marginRow)
                    tooltipContent.append("text").text(`Type: ${d.shot.type.name}`).attr("y", y += marginRow)
                    tooltipContent.append("text").text(`Technique: ${d.shot.technique.name}`).attr("y", y += marginRow)
                    tooltipContent.append("text").text(`Body Part: ${d.shot.body_part.name}`).attr("y", y += marginRow)
                    // tooltipContent.append("text").text(`: `).attr("y", 60)
                    console.log(mouseEvent.offsetX)
                    tooltipBackground
                        .attr("x", 0)
                        .attr("y", -backgroundHeight/2)
                        .attr("width", 300)
                        .attr("height", backgroundHeight)
                    tooltipWrapper
                        .attr("transform", `translate(
                            ${scX(80) - 300 + pitchProps.margin.left},
                            ${scX(40) + pitchProps.margin.top}
                        )`)
                })
                .on("mouseout", function(d) {
                    tooltip
                        .transition().duration(500).style("opacity", 0)
                    tooltipWrapper
                        .transition().duration(500).selectAll("*").remove()
                })
                
            event
                .on("click", function(mouseEvent, d) {
                    if (!eventClick) {
                        setEventClick(true);
                        events.selectAll("*").attr("opacity", 0);
                        event.attr("opacity", 1);
                        d3.select(this).selectAll("*").attr("opacity", 1);
                        const eventThreeSixty = threeSixtyData.find(threeSixty => threeSixty.event_uuid === d.id);
                        // console.log(eventThreeSixty)
                        const threeSixty = svg.append("g").attr("class", "three-sixty")
                        threeSixty
                            .selectAll("circle")
                            .data(eventThreeSixty.freeze_frame)
                                .join("circle")
                                    .attr("cx", d => scX(d.location[0]))
                                    .attr("cy", d => scY(d.location[1]))
                                    .attr("r", 5)
                                    .attr("stroke", d => d.teammate ? "blue" : "red")
                                    .attr("stroke-width", 2)
                                    .attr("fill", d => d.keeper ? "red" : "none")
                }})
            event
                .append( "line" )
                    .attr( 'x1', 0 )
                    .attr( 'y1', 0 )
                    .attr( 'x2', d => scX(d['shot']['end_location'][0] - d['location'][0]) )
                    .attr( 'y2', d => scY(d['shot']['end_location'][1] - d['location'][1]) )
                    .attr( 'stroke', d => 
                        d['shot']['outcome']['name'] === 'Goal' ? shotFormatsInfo.find(d => d.id === 'Goal').color
                        : d.shot.outcome.name === 'Saved' ? shotFormatsInfo.find(d => d.id === 'Saved').color
                        : d.shot.outcome.name === 'Post' ? shotFormatsInfo.find(d => d.id === 'Post').color
                        : d.shot.outcome.name === 'Blocked' ? "blue"
                        : "blue"
                    )
            event
                .append("circle")
                .attr("class", "event-event")
                .attr("r", d => scXG(d['shot']['statsbomb_xg'] > 0.1 ? d['shot']['statsbomb_xg']*10 : 1))
                .attr("stroke", "blue")
                .attr("stroke-width", 1.5)
                .attr("fill", d => 
                    d['shot']['outcome']['name'] === 'Goal' ? shotFormatsInfo.find(d => d.id === 'Goal').color
                    : d.shot.outcome.name === 'Saved' ? shotFormatsInfo.find(d => d.id === 'Saved').color
                    : d.shot.outcome.name === 'Post' ? shotFormatsInfo.find(d => d.id === 'Post').color
                    : d.shot.outcome.name === 'Blocked' ? shotFormatsInfo.find(d => d.id === 'Blocked').color
                    : shotFormatsInfo.find(d => d.id === 'Off T').color
                );
            // Legend
            const shotLegend = svg
                .append("g")
                    .attr("transform", `translate(${pitchProps.margin.left}, 0)`)
                    .attr("class", "legend")
                .selectAll(".legend-item")
                .data(shotFormatsInfo)
                .join("g")
                    .attr("class", "legend-item")
            var legendTextWidth = []
            shotLegend
                .append("text")
                    .text(d => `${d.label}: ${d.count}`)
                    .each(function(d, i) {
                        legendTextWidth.push(this.getComputedTextLength());
                        this.remove();
                    })

            const legendPosition = []
            legendTextWidth.forEach((textWidth, index) => {
                if (index === 0) {
                    return legendPosition.push(0)
                } else if (index === 1) {
                    return legendPosition.push(legendTextWidth[index-1] + 60)
                } else {
                    const sliceTextWidth = legendTextWidth.slice(0, index);
                    const sumSlice = sliceTextWidth.reduce((a, b) => a + b, 0);
                    return legendPosition.push(sumSlice + 60*index)
                }
            })
            shotLegend.attr("transform", (d, i) => `translate(${legendPosition[i]})`)
            shotLegend
                .append("text")
                    .text(d => `${d.label}: ${d.count}`)
                    .attr("x", 20)
                    .attr("y", pitchProps.margin.top/2)
                    .attr("fill", "black")
                    .attr("dominant-baseline", "middle")
                    .attr("font-size", "18px")
                    .attr("font-weight", "bold")
            // shotLegend
            //     .append("circle")
            //         .attr("cx", 0)
            //         .attr("cy", pitchProps.margin.top/2-2)
            //         .attr("r", 8)
            //         .attr("fill", d => d.color)
            //         .attr("stroke", "blue")
            //         .attr("stroke-width", 2)
            shotLegend
                .append("rect")
                    .attr("x", 0)
                    .attr("y", pitchProps.margin.top/2 - 15/2 - 3)
                    .attr("rx", 3)
                    .attr("width", 15)
                    .attr("height", 15)
                    .attr("r", 8)
                    .attr("fill", d => d.color)
                    .attr("stroke", "blue")
                    .attr("stroke-width", 0.5)

        } else if (eventShow === 'pass') {
            const passFormatsInfo = [
                {id: 'goal_assist', label: "Assist", color: "#219ebc", count: filteredData.filter(d => 'goal_assist' in d.pass).length},
                {id: 'shot_assist', label: "Chance Created", color: "#dda15e", count: filteredData.filter(d => 'shot_assist' in d.pass && !('goal_assist' in d.pass)).length},
                {id: 'successful', label: "Successful", color: "blue", count: filteredData.filter(d => !('outcome' in d.pass) && !('goal_assist' in d.pass) && !('shot_assist' in d.pass)).length},
                {id: 'unsuccessful', label: "Unsuccessful", color: "red", count: filteredData.filter(d => 'outcome' in d.pass).length},
            ]

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

            var passEvent = events.selectAll(".event-group-passes")
                .data(filteredData)
                .join("g")
                    .attr("class", "event-group")
                    .attr("stroke", d =>
                        ('goal_assist' in d["pass"]) ? passFormatsInfo.find(d => d.id === 'goal_assist').color
                        : ('shot_assist' in d["pass"]) ? passFormatsInfo.find(d => d.id === 'shot_assist').color
                        : !('outcome' in d["pass"]) ? passFormatsInfo.find(d => d.id === 'successful').color
                        : passFormatsInfo.find(d => d.id === 'unsuccessful').color
                    )
                    .attr("fill", d => 
                        ('goal_assist' in d["pass"]) ? passFormatsInfo.find(d => d.id === 'goal_assist').color
                        : ('shot_assist' in d["pass"]) ? passFormatsInfo.find(d => d.id === 'shot_assist').color
                        : !('outcome' in d["pass"]) ? passFormatsInfo.find(d => d.id === 'successful').color
                        : passFormatsInfo.find(d => d.id === 'unsuccessful').color
                    )

            passEvent
                .append( "line" )
                    .attr("stroke-width", 1.5)
                    .attr( 'x1', d => scX(d['location'][0]) )
                    .attr( 'y1', d => scY(d['location'][1]) )
                    .attr( 'x2', d => scX(d['pass']['end_location'][0]) )
                    .attr( 'y2', d => scY(d['pass']['end_location'][1]) )

            passEvent
                .on("mouseover", function(mouseEvent, d) {
                    var tooltipBackground = tooltipWrapper.append("rect")
                        .attr("class", "tooltip-background")
                    var tooltipContent = tooltipWrapper.append("g")
                        .attr("class", "tooltip-content")
                    tooltip
                        .transition().duration(200)
                        .style("opacity", 1)
                    
                    let y = 0
                    const marginRow = 25
                    let row = 6

                    let backgroundHeight = 40 + 26*row
                    var backgroundWidth = 300;
                    var paddingBackground = 10

                    tooltipContent.attr("transform", `translate(${paddingBackground + 20}, -${backgroundHeight/2 - 30})`)
                    tooltipContent.append("text").text(d.type.name).attr("y", y).style("font-weight", "bold").style("font-size", "20px")
                        .append("tspan").text(` (${'outcome' in d.pass ? d.pass.outcome.name : "Complete"})`).style("font-weight", "normal").style("font-size", "18px")
                    tooltipContent.append("text").text(`Minute: ${d.minute}'`).attr("y", y += marginRow + 4)
                    tooltipContent.append("text").text(`Player: ${d.player.name}`).attr("y", y += marginRow)
                    if ('recipient' in d.pass) {
                        tooltipContent.append("text").text(`Pass Recipient: ${d.pass.recipient.name}`).attr("y", y += marginRow)
                        row += 1
                    }
                    tooltipContent.append("text").text(`Pass Length: ${Math.round(d.pass.length * 0.9144)}m`).attr("y", y += marginRow)
                    tooltipContent.append("text").text(`Pass Height: ${d.pass.height.name}`).attr("y", y += marginRow)
                    tooltipContent.append("text").text(`Pass Play Pattern: ${d.play_pattern.name}`).attr("y", y += marginRow)
                    
                    tooltipBackground
                        .attr("x", paddingBackground)
                        .attr("y", -backgroundHeight/2)
                        .attr("width", backgroundWidth)
                        .attr("height", backgroundHeight)

                    const farXLoc = d.location[0] > d.pass.end_location[0] ? d.location[0] : d.pass.end_location[0];
                    const nearXLoc = d.location[0] > d.pass.end_location[0] ? d.pass.end_location[0] : d.location[0];
                    const farYLoc = d.location[1] > d.pass.end_location[1] ? d.location[1] : d.pass.end_location[1];
                    const nearYLoc = d.location[1] > d.pass.end_location[1] ? d.pass.end_location[1] : d.location[1];
                    const centerEvent = [nearXLoc + (farXLoc - nearXLoc)/2, nearYLoc + (farYLoc - nearYLoc)/2]
                    console.log(scY(centerEvent[1]))
                    tooltipWrapper
                        .attr("transform", `translate(
                            ${scX(farXLoc) < innerWidth  - backgroundWidth ? scX(farXLoc) : scX(nearXLoc) - backgroundWidth - 2*paddingBackground },
                            ${(scY(centerEvent[1]) < innerHeight - backgroundHeight/2) && (scY(centerEvent[1])) > backgroundHeight/2 
                                ? scY(centerEvent[1])
                                : scY(centerEvent[1]) < backgroundHeight/2 ? backgroundHeight/2
                                : innerHeight - backgroundHeight/2}
                        )`)
                })
            passEvent
                .on("mouseout", function(d) {
                    tooltip
                        .transition().duration(500).style("opacity", 0)
                    tooltipWrapper
                        .transition().duration(500).selectAll("*").remove()
                })
            passEvent
                .on("click", function(mouseEvent, d) {
                    if (!eventClick) {
                        setEventClick(true);
                        events.selectAll("*").attr("opacity", 0);
                        d3.select(this).attr("opacity", 1);
                        d3.select(this).selectAll("*").attr("opacity", 1);
                        d3.select(chalkboardRef.current).select(".tooltip-wrapper").selectAll("*").attr("opacity", 0)
                        const eventThreeSixty = threeSixtyData.find(threeSixty => threeSixty.event_uuid === d.id);
                        const threeSixty = svg.append("g").attr("class", "three-sixty")
                        console.log(d)
                        threeSixty
                            .selectAll("circle")
                            .data(eventThreeSixty.freeze_frame)
                                .join("circle")
                                    .attr("cx", d => scX(d.location[0]))
                                    .attr("cy", d => scY(d.location[1]))
                                    .attr("r", 5)
                                    .attr("stroke", d => d.teammate ? "blue" : "red")
                                    .attr("stroke-width", 2)
                                    .attr("fill", d => d.keeper ? "red" : "none")
                    }
                })
            passEvent
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
                    return `M ${scX(endX)}, ${scY(endY)} L ${scX(baseLeftX)}, ${scY(baseLeftY)} L${scX(baseRightX)}, ${scY(baseRightY)}`
                })

            // Legend
            const passLegend = svg
                .append("g")
                    .attr("transform", `translate(${pitchProps.margin.left}, 0)`)
                    .attr("class", "legend")
                .selectAll(".legend-item")
                .data(passFormatsInfo)
                .join("g")
                    .attr("class", "legend-item")
            var passLegendTextWidth = []
            passLegend
                .append("text")
                    .text(d => `${d.label}: ${d.count}`)
                    .each(function(d, i) {
                        passLegendTextWidth.push(this.getComputedTextLength());
                        this.remove();
                    })

            const legendPosition = []
            passLegendTextWidth.forEach((textWidth, index) => {
                if (index === 0) {
                    return legendPosition.push(0)
                } else if (index === 1) {
                    return legendPosition.push(passLegendTextWidth[index-1] + 60)
                } else {
                    const sliceTextWidth = passLegendTextWidth.slice(0, index);
                    const sumSlice = sliceTextWidth.reduce((a, b) => a + b, 0);
                    return legendPosition.push(sumSlice + 60*index)
                }
            })
            passLegend.attr("transform", (d, i) => `translate(${legendPosition[i]})`)
            passLegend
                .append("text")
                    .text(d => `${d.label}: ${d.count}`)
                    .attr("x", 20)
                    .attr("y", pitchProps.margin.top/2)
                    .attr("fill", "black")
                    .attr("dominant-baseline", "middle")
                    .attr("font-size", "18px")
                    .attr("font-weight", "bold")
            passLegend
                .append("rect")
                    .attr("x", 0)
                    .attr("y", pitchProps.margin.top/2 - 15/2 - 3)
                    .attr("rx", 3)
                    .attr("width", 15)
                    .attr("height", 15)
                    .attr("r", 8)
                    .attr("fill", d => d.color)
                    // .attr("stroke", "blue")
                    .attr("stroke-width", 0.5)

        } else if (eventShow === 'interception' || eventShow === 'clearance' || eventShow === 'duel') {
            events.selectAll( "circle" )
                .data( filteredData )
                .enter()
                .append( "circle" )
                    .attr( 'r', 5 ).attr( 'fill', d => d['team']['name'] === homeTeamName ? color : 'red' )
                    .attr( 'cx', d => scX(d['location'][0]) )
                    .attr( 'cy', d => scY(d['location'][1]) )
                    .on("mouseover", function(mouseEvent, d) {
                        var tooltipBackground = tooltipWrapper.append("rect")
                            .attr("class", "tooltip-background")
                        var tooltipContent = tooltipWrapper.append("g")
                            .attr("class", "tooltip-content")
                        tooltip
                            .transition().duration(300)
                            .style("opacity", 1)
    
                        let y = 25
                        const marginRow = 25
                        let row = 3
                        var backgroundHeight = 40 + 26*row
                        var backgroundMargin = 20
                        var backgroundWidth = 250
    
                        tooltipContent.attr("transform", `translate(${backgroundMargin + 20}, -${backgroundHeight/2})`)
                        tooltipContent.append("text").text(d.type.name).attr("y", y).style("font-weight", "bold").style("font-size", "20px")
                        tooltipContent.append("text").text(`Minute: ${d.minute}'`).attr("y", y += marginRow + 4)
                        tooltipContent.append("text").text(`Player: ${d.player.name}`).attr("y", y += marginRow)
                        tooltipContent.append("text").text(`Team: ${d.team.name}`).attr("y", y += marginRow)

                        tooltipBackground
                            .attr("x", backgroundMargin)
                            .attr("y", -backgroundHeight/2)
                            .attr("width", backgroundWidth)
                            .attr("height", backgroundHeight)
                        tooltipWrapper
                            .attr("transform", `translate(
                                ${scX(d.location[0]) < innerWidth - backgroundWidth ? scX(d.location[0]) : scX(d.location[0]) - backgroundWidth - 2*backgroundMargin },
                                ${(scY(d.location[1]) < innerHeight - backgroundHeight/2) && (scY(d.location[1]) > backgroundHeight/2)
                                ? scY(d.location[1])
                                : scY(d.location[1] < backgroundHeight/2) ? backgroundHeight/2
                                : innerHeight - backgroundHeight/2}
                            )`)
                            .style("opacity", 1)
                    })
                    .on("mouseout", function(d) {
                        tooltip
                            .transition().duration(200).style("opacity", 0)
                        tooltipWrapper
                            .transition().duration(500).selectAll("*").remove()
                    })
        } else if (eventShow === 'dribble') {
            const dribbleFormatsInfo = [
                {id: 'complete', label: "Successful", color: "blue", count: filteredData.filter(d => d.dribble.outcome.name === 'Complete').length},
                {id: 'incomplete', label: "Unsuccessful", color: "red", count: filteredData.filter(d => d.dribble.outcome.name === 'Incomplete').length},
            ]
            const event = events.selectAll(".event-group")
                .data(filteredData)
                .join("g")
                    .attr("class", "event-group")
            event.append("circle")
                .attr("cx", d => scX(d.location[0]))
                .attr("cy", d => scY(d.location[1]))
                .attr("r", 8)
                .attr("fill", d => d.dribble.outcome.name === 'Complete' ? "blue" : "red");
            event
                .on("mouseover", function(mouseEvent, d) {
                    var tooltipBackground = tooltipWrapper.append("rect")
                        .attr("class", "tooltip-background")
                    var tooltipContent = tooltipWrapper.append("g")
                        .attr("class", "tooltip-content")
                    tooltip
                        .transition().duration(300)
                        .style("opacity", 1)

                    let y = 25
                    const marginRow = 25
                    let row = 3
                    var backgroundHeight = 40 + 26*row
                    var backgroundMargin = 20
                    var backgroundWidth = 250

                    tooltipContent.attr("transform", `translate(${backgroundMargin + 20}, -${backgroundHeight/2})`)
                    tooltipContent.append("text").text(d.type.name).attr("y", y).style("font-weight", "bold").style("font-size", "20px")
                    tooltipContent.append("text").text(`Minute: ${d.minute}'`).attr("y", y += marginRow + 4)
                    tooltipContent.append("text").text(`Player: ${d.player.name}`).attr("y", y += marginRow)
                    tooltipContent.append("text").text(`Team: ${d.team.name}`).attr("y", y += marginRow)

                    tooltipBackground
                        .attr("x", backgroundMargin)
                        .attr("y", -backgroundHeight/2)
                        .attr("width", backgroundWidth)
                        .attr("height", backgroundHeight)
                    tooltipWrapper
                        .attr("transform", `translate(
                            ${scX(d.location[0]) < innerWidth - backgroundWidth ? scX(d.location[0]) : scX(d.location[0]) - backgroundWidth - 2*backgroundMargin },
                            ${(scY(d.location[1]) < innerHeight - backgroundHeight/2) && (scY(d.location[1]) > backgroundHeight/2)
                            ? scY(d.location[1])
                            : scY(d.location[1] < backgroundHeight/2) ? backgroundHeight/2
                            : innerHeight - backgroundHeight/2}
                        )`)
                        .style("opacity", 1)
                })
                .on("mouseout", function(d) {
                    tooltip
                        .transition().duration(200).style("opacity", 0)
                    tooltipWrapper
                        .transition().duration(500).selectAll("*").remove()
                })
                
            event
                .on("click", function(mouseEvent, d) {
                    if (!eventClick) {
                        setEventClick(true);
                        events.selectAll("*").attr("opacity", 0);
                        event.attr("opacity", 1);
                        d3.select(this).selectAll("*").attr("opacity", 1);
                        const eventThreeSixty = threeSixtyData.find(threeSixty => threeSixty.event_uuid === d.id);
                        // console.log(eventThreeSixty)
                        const threeSixty = svg.append("g").attr("class", "three-sixty")
                        threeSixty
                            .selectAll("circle")
                            .data(eventThreeSixty.freeze_frame)
                                .join("circle")
                                    .attr("cx", d => scX(d.location[0]))
                                    .attr("cy", d => scY(d.location[1]))
                                    .attr("r", 5)
                                    .attr("stroke", d => d.teammate ? "blue" : "red")
                                    .attr("stroke-width", 2)
                                    .attr("fill", d => d.keeper ? "red" : "none")
                }})

            // Legend
            const Legend = svg
                .append("g")
                    .attr("transform", `translate(${pitchProps.margin.left}, 0)`)
                    .attr("class", "legend")
                .selectAll(".legend-item")
                .data(dribbleFormatsInfo)
                .join("g")
                    .attr("class", "legend-item")
            var dribbleLegendTextWidth = []
            Legend
                .append("text")
                    .text(d => `${d.label}: ${d.count}`)
                    .each(function(d, i) {
                        dribbleLegendTextWidth.push(this.getComputedTextLength());
                        this.remove();
                    })

            const legendPosition = []
            dribbleLegendTextWidth.forEach((textWidth, index) => {
                if (index === 0) {
                    return legendPosition.push(0)
                } else if (index === 1) {
                    return legendPosition.push(dribbleLegendTextWidth[index-1] + 60)
                } else {
                    const sliceTextWidth = dribbleLegendTextWidth.slice(0, index);
                    const sumSlice = sliceTextWidth.reduce((a, b) => a + b, 0);
                    return legendPosition.push(sumSlice + 60*index)
                }
            })
            Legend.attr("transform", (d, i) => `translate(${legendPosition[i]})`)
            Legend
                .append("text")
                    .text(d => `${d.label}: ${d.count}`)
                    .attr("x", 20)
                    .attr("y", pitchProps.margin.top/2)
                    .attr("fill", "black")
                    .attr("dominant-baseline", "middle")
                    .attr("font-size", "18px")
                    .attr("font-weight", "bold")
            Legend
                .append("rect")
                    .attr("x", 0)
                    .attr("y", pitchProps.margin.top/2 - 15/2 - 3)
                    .attr("rx", 3)
                    .attr("width", 15)
                    .attr("height", 15)
                    .attr("r", 8)
                    .attr("fill", d => d.color)
                    // .attr("stroke", "blue")
                    .attr("stroke-width", 0.5)
        } else if (eventShow === 'carry') {
            // const dribbleFormatsInfo = [
            //     {id: 'complete', label: "Successful", color: "blue", count: filteredData.filter(d => d.dribble.outcome.name === 'Complete').length},
            //     {id: 'incomplete', label: "Unsuccessful", color: "red", count: filteredData.filter(d => d.dribble.outcome.name === 'Incomplete').length},
            // ]
            const event = events.selectAll(".event-group")
                .data(filteredData)
                .join("g")
                    .attr("class", "event-group")
                    .attr("stroke", "blue")
                    .attr("fill", "blue")
                    // .attr("opacity", d => {
                    //     const startMetreX = d.location[0] * 105/120
                    //     const startMetreY = d.location[1] * 68/80
                    //     const endMetreX = d.carry.end_location[0] * 105/120
                    //     const endMetreY = d.carry.end_location[1] * 68/80
                    //     const length = ((startMetreX - endMetreX) ** 2 + (startMetreY - endMetreY) ** 2) ** 0.5
                    //     return length > 5 ? 1 : 0
                    // })
            
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
                .append( "line" )
                    .attr("stroke-width", 1.5)
                    .attr( 'x1', d => scX(d['location'][0]) )
                    .attr( 'y1', d => scY(d['location'][1]) )
                    .attr( 'x2', d => scX(d['carry']['end_location'][0]))
                    .attr( 'y2', d => scY(d['carry']['end_location'][1]));
            
            event
                .append('path')
                .attr( 'd', d => {
                    const startX = d['location'][0]
                    const startY = d['location'][1]
                    const endX = d['carry']['end_location'][0]
                    const endY = d['carry']['end_location'][1]
                    const baseLeftX = angle(startX, startY, endX, endY)['baseLeftX']
                    const baseLeftY = angle(startX, startY, endX, endY)['baseLeftY']
                    const baseRightX = angle(startX, startY, endX, endY)['baseRightX']
                    const baseRightY = angle(startX, startY, endX, endY)['baseRightY']
                    return `M ${scX(endX)}, ${scY(endY)}
                            L ${scX(baseLeftX)}, ${scY(baseLeftY)}
                            L ${scX(baseRightX)}, ${scY(baseRightY)}
                            L ${scX(endX)}, ${scY(endY)}`
                })

            event
                .on("mouseover", function(mouseEvent, d) {
                    var tooltipBackground = tooltipWrapper.append("rect")
                        .attr("class", "tooltip-background")
                    var tooltipContent = tooltipWrapper.append("g")
                        .attr("class", "tooltip-content")
                    tooltip
                        .transition().duration(200)
                        .style("opacity", 1)
                    
                    let y = 0
                    const marginRow = 25
                    let row = 4

                    let backgroundHeight = 40 + 26*row
                    var backgroundWidth = 300;
                    var paddingBackground = 10

                    const startMetreX = d.location[0] * 105/120
                    const startMetreY = d.location[1] * 68/80
                    const endMetreX = d.carry.end_location[0] * 105/120
                    const endMetreY = d.carry.end_location[1] * 68/80
                    const length = ((startMetreX - endMetreX) ** 2 + (startMetreY - endMetreY) ** 2) ** 0.5

                    tooltipContent.attr("transform", `translate(${paddingBackground + 20}, -${backgroundHeight/2 - 30})`)
                    tooltipContent.append("text").text(d.type.name).attr("y", y).style("font-weight", "bold").style("font-size", "20px")
                    tooltipContent.append("text").text(`Length: ${Math.round(length)} m`).attr("y", y += marginRow + 2)
                    tooltipContent.append("text").text(`Minute: ${d.minute}'`).attr("y", y += marginRow)
                    tooltipContent.append("text").text(`Player: ${d.player.name}`).attr("y", y += marginRow)
                    tooltipContent.append("text").text(`Team: ${d.team.name}`).attr("y", y += marginRow)
                    
                    tooltipBackground
                        .attr("x", paddingBackground)
                        .attr("y", -backgroundHeight/2)
                        .attr("width", backgroundWidth)
                        .attr("height", backgroundHeight)

                    const farXLoc = d.location[0] > d.carry.end_location[0] ? d.location[0] : d.carry.end_location[0];
                    const nearXLoc = d.location[0] > d.carry.end_location[0] ? d.carry.end_location[0] : d.location[0];
                    const farYLoc = d.location[1] > d.carry.end_location[1] ? d.location[1] : d.carry.end_location[1];
                    const nearYLoc = d.location[1] > d.carry.end_location[1] ? d.carry.end_location[1] : d.location[1];
                    const centerEvent = [nearXLoc + (farXLoc - nearXLoc)/2, nearYLoc + (farYLoc - nearYLoc)/2]
                    console.log(scY(centerEvent[1]))
                    tooltipWrapper
                        .attr("transform", `translate(
                            ${scX(farXLoc) < innerWidth  - backgroundWidth ? scX(farXLoc) : scX(nearXLoc) - backgroundWidth - 2*paddingBackground },
                            ${(scY(centerEvent[1]) < innerHeight - backgroundHeight/2) && (scY(centerEvent[1])) > backgroundHeight/2 
                                ? scY(centerEvent[1])
                                : scY(centerEvent[1]) < backgroundHeight/2 ? backgroundHeight/2
                                : innerHeight - backgroundHeight/2}
                        )`)
                })
            event
                .on("mouseout", function(d) {
                    tooltip
                        .transition().duration(500).style("opacity", 0)
                    tooltipWrapper
                        .transition().duration(500).selectAll("*").remove()
                })

            // Legend
            // const Legend = svg
            //     .append("g")
            //         .attr("transform", `translate(${pitchProps.margin.left}, 0)`)
            //         .attr("class", "legend")
            //     .selectAll(".legend-item")
            //     .data(dribbleFormatsInfo)
            //     .join("g")
            //         .attr("class", "legend-item")
            // var carryLegendTextWidth = []
            // Legend
            //     .append("text")
            //         .text(d => `${d.label}: ${d.count}`)
            //         .each(function(d, i) {
            //             carryLegendTextWidth.push(this.getComputedTextLength());
            //             this.remove();
            //         })

            // const legendPosition = []
            // carryLegendTextWidth.forEach((textWidth, index) => {
            //     if (index === 0) {
            //         return legendPosition.push(0)
            //     } else if (index === 1) {
            //         return legendPosition.push(carryLegendTextWidth[index-1] + 60)
            //     } else {
            //         const sliceTextWidth = carryLegendTextWidth.slice(0, index);
            //         const sumSlice = sliceTextWidth.reduce((a, b) => a + b, 0);
            //         return legendPosition.push(sumSlice + 60*index)
            //     }
            // })
            // Legend.attr("transform", (d, i) => `translate(${legendPosition[i]})`)
            // Legend
            //     .append("text")
            //         .text(d => `${d.label}: ${d.count}`)
            //         .attr("x", 20)
            //         .attr("y", pitchProps.margin.top/2)
            //         .attr("fill", "black")
            //         .attr("dominant-baseline", "middle")
            //         .attr("font-size", "18px")
            //         .attr("font-weight", "bold")
            // Legend
            //     .append("rect")
            //         .attr("x", 0)
            //         .attr("y", pitchProps.margin.top/2 - 15/2 - 3)
            //         .attr("rx", 3)
            //         .attr("width", 15)
            //         .attr("height", 15)
            //         .attr("r", 8)
            //         .attr("fill", d => d.color)
            //         // .attr("stroke", "blue")
            //         .attr("stroke-width", 0.5)
        }

        
        ///////////////////////////////////////////////////////////////////////////
		////////////////////////////// Add Tooltip ////////////////////////////////
		///////////////////////////////////////////////////////////////////////////

        var tooltip = svg
            .append("g")
                .attr("class", "tooltip")    
                .attr("transform", `translate(${pitchProps.margin.left}, ${pitchProps.margin.top})`)
                .style("opacity", 1);

        var tooltipWrapper = tooltip.append("g")
            .attr("class", "tooltip-wrapper")
        //   .attr("transform", `translate(${pitchProps.margin.left}, ${pitchProps.margin.top})`)
		//   .style("opacity", 0);

        // var tooltipBackground = tooltipWrapper.append("rect")
        //     .attr("class", "tooltip-background")
        //   .attr("height", 150);
        
        // var tooltipContent = tooltipWrapper.append("g")
        //     .attr("class", "tooltip-content")
            // .attr("transform", "translate(40, 0)")

    }, [eventsData, homeTeamName, awayTeamName, chalkboardRef, homePlayersPlay, awayPlayersPlay, eventShow, threeSixtyData, homeAway, value])


    return (
        <Row className='d-flex justify-content-center'>
            <div className='title d-flex justify-content-center mb-4'>
                <span>Events Chalkboard</span>
                    <ButtonGroup className='align-items-center ms-5'>
                        <Button variant={`${homeAway === 'home' ? 'danger' : 'outline-danger'}`} onClick={() => setHomeAway('home')}>{homeTeamName}</Button>
                        <Button variant={`${homeAway === 'away' ? 'danger' : 'outline-danger'}`} onClick={() => setHomeAway('away')}>{awayTeamName}</Button>
                    </ButtonGroup>
            </div>

            <Col sm={8}>
                <div className='justify-content-center text-center mb-3'>
                    <ButtonGroup>
                        <Button variant={`${eventShow === 'shot' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('shot')}>Shot</Button>
                        <Button variant={`${eventShow === 'pass' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('pass')}>Pass</Button>
                        <Button variant={`${eventShow === 'dribble' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('dribble')}>Dribble</Button>
                        <Button variant={`${eventShow === 'carry' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('carry')}>Carry Ball</Button>
                        <Button variant={`${eventShow === 'interception' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('interception')}>Interception</Button>
                        <Button variant={`${eventShow === 'clearance' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('clearance')}>Clearance</Button>
                        <Button variant={`${eventShow === 'duel' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('duel')}>Duel</Button>
                    </ButtonGroup>
                </div>
                <div className='d-flex justify-content-center'>
                    <svg ref={chalkboardRef} fill='none' />
                </div>
                <div className='ms-5 me-5'>
                    <Slider
                        aria-label='Always visible'
                        getAriaValueText={valueText}
                        value={value}
                        valueLabelDisplay='auto'
                        onChange={handleValueChange}
                        min={0}
                        max={maxMinute}
                        marks={[
                            {value: 0, label: "0'"},
                            {value: 45, label: "45'"},
                            {value: 90, label: "90'"},
                            {value: maxMinute, label: `${maxMinute}'`}
                        ]}
                        color='danger'
                    />
                </div>

                <div className='info-container m-2 ms-5'>
                    <div className='info'>
                        <InfoIcon className='m-2' />
                        <span className='me-3'>Hover on event to see detail event</span>
                    </div>
                </div>
                <div className='info-container m-2 ms-5'>
                    <div className='info'>
                        <InfoIcon className='m-2' />
                        <span className='me-3'>Click on event to see three-sixty event (for shot, pass, and dribble)</span>
                    </div>
                </div>
            </Col>

            <Col  sm={3} className='text-start align-items-start player-checkbox'>
                <div className='m-1'>
                    <Form>
                        <Form.Check className='fw-bold checkbox-events' type='checkbox'>
                            <Form.Check.Input
                                type='checkbox'
                                checked={homeAway === 'home' ? homeSelectAllCheck : awaySelectAllCheck}
                                className='me-3'
                                onClick={() => homeAway === 'home' ? hadleHomeSelectAllCheckBox() : hadleAwaySelectAllCheckBox()}
                            />
                            Select All
                        </Form.Check>
                    </Form>
                </div>
                {listPlayersPlay.map((player) => (
                    <div key={player.player_id} className='m-1'>
                        <Form>
                            <Form.Check type='checkbox' className='checkbox-events'>
                                <Form.Check.Input
                                    type='checkbox'
                                    checked={player["isChecked"]}
                                    onClick={() => homeAway === 'home' ? handleHomeCheckBox(player.player_id) : handleAwayCheckBox(player.player_id)}
                                    className='me-3'
                                />
                                {player.player_name}
                            </Form.Check>
                        </Form>
                    </div>
                ))}
            </Col>
            {eventClick && 
                <Button class onClick={handleEventClickOut}>Reset</Button>
            }
        </Row>
  )
}

export default Events