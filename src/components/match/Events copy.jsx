import React, { useEffect, useRef, useState } from 'react'
import Pitch from './Pitch';
import * as d3 from 'd3';
import { Button, ButtonGroup, Col, Form, Row } from 'react-bootstrap';
import '../../styles/match/Events.css';

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
                top: width/40,
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
        var scXG = d3.scaleLinear().domain([ 0, 1 ]).range([ 4, 20 ])
        const color = 'blue';

        // Make Direction of Attack
        const attackingDirection = svg.append("g").attr("class", "direction-of-attack")
        attackingDirection.append("path")
            .attr("d",
                `M${pitchProps.margin.left + innerWidth/10} ${height - pitchProps.margin.bottom*2/3}
                L${pitchProps.margin.left + innerWidth/2 - innerWidth/10} ${height - pitchProps.margin.bottom*2/3}`)
            .attr("stroke", "grey")
            .attr("stroke-width", 2)
        attackingDirection.append("path")
            .attr("d",
                `M${pitchProps.margin.left + innerWidth/2 + innerWidth/10} ${height - pitchProps.margin.bottom*2/3}
                L${pitchProps.margin.left + innerWidth/2 + innerWidth/2 - innerWidth/10} ${height - pitchProps.margin.bottom*2/3}`)
            .attr("stroke", "grey")
            .attr("stroke-width", 2);
        
        attackingDirection.append("path")
            .attr("d", `
                    M${pitchProps.margin.left + innerWidth/2 - innerWidth/10} ${height - pitchProps.margin.bottom*2/3}
                    L${pitchProps.margin.left + innerWidth/2 - innerWidth/10 - 15} ${height - pitchProps.margin.bottom*2/3 + 10}
                    L${pitchProps.margin.left + innerWidth/2 - innerWidth/10 - 15} ${height - pitchProps.margin.bottom*2/3 - 10}
                    L${pitchProps.margin.left + innerWidth/2 - innerWidth/10 } ${height - pitchProps.margin.bottom*2/3}
                `)
            .attr("fill", "grey ")
            .attr("stroke", "grey")
            .attr("stroke-width", 2);
        attackingDirection.append("path")
            .attr("d", `
                    M${pitchProps.margin.left + innerWidth/2 + innerWidth/10} ${height - pitchProps.margin.bottom*2/3}
                    L${pitchProps.margin.left + innerWidth/2 + innerWidth/10 + 15} ${height - pitchProps.margin.bottom*2/3 + 10}
                    L${pitchProps.margin.left + innerWidth/2 + innerWidth/10 + 15} ${height - pitchProps.margin.bottom*2/3 - 10}
                    L${pitchProps.margin.left + innerWidth/2 + innerWidth/10 } ${height - pitchProps.margin.bottom*2/3}
                `)
            .attr("fill", "grey ")
            .attr("stroke", "grey")
            .attr("stroke-width", 2);

        attackingDirection
            .append("text")
                .attr("transform", `translate(${pitchProps.margin.left + innerWidth*1/4}, ${height - pitchProps.margin.bottom*1/3})`)
                .text(`${homeTeamName} Direction of Attack`)
                .attr("fill", "grey")
                .attr("text-anchor", "middle");
        attackingDirection
            .append("text")
                .attr("transform", `translate(${pitchProps.margin.left + innerWidth*3/4}, ${height - pitchProps.margin.bottom*1/3})`)
                .text(`${awayTeamName} Direction of Attack`)
                .attr("fill", "grey")
                .attr("text-anchor", "middle");


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

        const data = eventShow === 'shot' ? shot : eventShow === 'pass' ? pass : eventShow === 'interception' ? interceptions : eventShow === 'clearance' ? clearances : eventShow === 'duel' ? duel : shot;
        const filteredData = data.filter(event => player_ids.includes(event.player.id) && event.team.name === (homeAway === 'home' ? homeTeamName : awayTeamName));
        console.log(homeAway)

        function homeAwayLocationX(x, team) {
            return team === homeTeamName ? x : dimension.length - x
        }
        function homeAwayLocationY(y, team) {
            return team === homeTeamName ? y : dimension.width - y
        }

        const events = d3.select(chalkboardRef.current)
            .append("g")
                .attr("transform", `translate(${pitchProps.margin.left}, ${pitchProps.margin.top})`)
                .attr("class", "events")

        if (eventShow === 'shot') {
            var event = events.selectAll(".event-group")
                .data(filteredData)
                .join("g")
                    .attr("class", "event-group")
                    .attr("transform", function(d) { return `translate(${scX(d['team']['name'] === homeTeamName ? d['location'][0] : dimension.length - d['location'][0])}, ${scY(d['team']['name'] === homeTeamName ? d['location'][1] : dimension.width - d['location'][1])})`})

            event
                .on("mouseover", function(mouseEvent, d) {
                    
                    // event.select("circle").attr("r", 10)
                    tooltipContent.attr("transform", `translate(${d.team.name === homeTeamName ? -20-300 + 20 : 40}, 0)`)
                    tooltipContent.append("text").text(d.type.name).attr("y", -50).style("font-weight", "bold").style("font-size", "20px")
                        .append("tspan").text(`  (${d.shot.outcome.name})`).style("font-weight", "normal").style("font-size", "18px")
                    tooltipContent.append("text").text(`Team: ${d.team.name}`).attr("y", -20);
                    tooltipContent.append("text").text(`Player: ${d.player.name}`).attr("y", 0);
                    tooltipContent.append("text").text(`xG: ${Math.round(d.shot.statsbomb_xg * 100) / 100}`).attr("y", 20);
                    tooltipContent.append("text").text(`Minute: ${d.minute}`).attr("y", 40)
                    tooltipContent.append("text").text(`Play Pattern: ${d.play_pattern.name}`).attr("y", 60)
                    tooltipContent.append("text").text(`Type: ${d.shot.type.name}`).attr("y", 80)
                    tooltipContent.append("text").text(`Technique: ${d.shot.technique.name}`).attr("y", 100)
                    tooltipContent.append("text").text(`Body Part: ${d.shot.body_part.name}`).attr("y", 120)
                    // tooltipContent.append("text").text(`: `).attr("y", 60)

                    tooltipBackground
                        .attr("x", d.team.name === homeTeamName ? -20-300 : 20)
                        .attr("y", -75)
                        .attr("width", 300)
                        .attr("height", 220)
                    tooltipWrapper
                        .attr("transform", `translate(${pitchProps.margin.left + scX(d['team']['name'] === homeTeamName ? d['location'][0] : dimension.length - d['location'][0])}, ${pitchProps.margin.top + scY(d['team']['name'] === homeTeamName ? d['location'][1] : dimension.width - d['location'][1])})`)
                    tooltipWrapper
                        .transition().duration(400)
                        .style("opacity", 1)
                })
                .on("mouseout", function(d) {
                    tooltipWrapper
                        .transition().duration(200)
                        .style("opacity", 0)
                    tooltipBackground
                        .transition().duration(200)
                        .attr("width", 0)
                        .attr("height", 0)
                    tooltipContent
                        .transition().duration(200).selectAll("*").remove()
                })
            event
                .on("click", function(mouseEvent, d) {
                    if (!eventClick) {
                        setEventClick(true);
                        events.selectAll("*").attr("opacity", 0);
                        event.attr("opacity", 1);
                        d3.select(this).selectAll("*").attr("opacity", 1);
                        const eventThreeSixty = threeSixtyData.find(threeSixty => threeSixty.event_uuid === d.id);
                        console.log(eventThreeSixty, d)
                        console.log(`${d.team.name} space`, `${homeTeamName} space`)
                        const eventHomeAway = d.team.name === homeTeamName ? 'home' : 'away';
                        console.log(eventHomeAway)
                        const threeSixty = events.append("g").attr("class", "three-sixty")
                        threeSixty
                            .selectAll("circle")
                            .data(eventThreeSixty.freeze_frame)
                                .join("circle")
                                    .attr("cx", d => scX(eventHomeAway === 'home' ? d.location[0] : dimension.length - d.location[0]))
                                    .attr("cy", d => scY(eventHomeAway === 'home' ? d.location[1] : dimension.width - d.location[1]))
                                    .attr("r", 5)
                                    .attr("stroke", d => d.teammate ? "blue" : "red")
                                    .attr("stroke-width", 2)
                                    .attr("fill", d => d.keeper ? "red" : "none")
                }})
            event
                .append( "line" ).attr( 'stroke', color )
                    .attr( 'x1', 0 )
                    .attr( 'y1', 0 )
                    .attr( 'x2', d => scX(d['team']['name'] === homeTeamName ? d['shot']['end_location'][0] - d['location'][0] : d['location'][0] - d['shot']['end_location'][0]) )
                    .attr( 'y2', d => scY(d['team']['name'] === homeTeamName ? d['shot']['end_location'][1] - d['location'][1] : d['location'][1] - d['shot']['end_location'][1] ) )
            
            event
                .append("circle")
                .attr("class", "event-event")
                .attr("r", d => scXG(d['shot']['statsbomb_xg']))
                .style("fill", d => d['shot']['outcome']['name'] === 'Goal' ? 'grey' : color)


        } else if (eventShow === 'pass') {
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

            events.selectAll( "line" )
                .data( filteredData ).enter()
                .append( "line" ).attr( 'stroke', d => d['team']['name'] === homeTeamName ? color : 'red' ).attr("stroke-width", 1.5)
                .attr( 'x1', d => scX(d['team']['name'] === homeTeamName ? d['location'][0] : dimension.length - d['location'][0]) )
                .attr( 'y1', d => scY(d['team']['name'] === homeTeamName ? d['location'][1] : dimension.width - d['location'][1]) )
                .attr( 'x2', d => scX(homeAwayLocationX(d['pass']['end_location'][0], d['team']['name'] )) )
                .attr( 'y2', d => scY(homeAwayLocationY(d['pass']['end_location'][1], d['team']['name'])) )
                .on("mouseover", function(mouseEvent, d) {

                    let y = -50
                    const marginRow = 25
                    let row = 5

                    tooltipContent.attr("transform", `translate(40, 0)`)
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
                    
                    let backgroundHeight = 40 + 26*row
                    tooltipBackground
                        .attr("x", 20)
                        .attr("y", -75)
                        .attr("width", 300)
                        .attr("height", backgroundHeight)
                    tooltipWrapper
                        .attr("transform", `translate(
                            ${mouseEvent.offsetX < width - pitchProps.margin.left - 300 ? mouseEvent.offsetX : mouseEvent.offsetX - 300 - 40 },
                            ${mouseEvent.offsetY < 75+20 ? 75+20 : mouseEvent.offsetY > height - pitchProps.margin.top - backgroundHeight ? height - pitchProps.margin.top - backgroundHeight + 75 : mouseEvent.offsetY}
                        )`)
                    tooltipWrapper
                        .transition().duration(200)
                        .style("opacity", 1)
                })
                .on("mouseout", function(d) {
                    tooltipWrapper
                        .transition().duration(200)
                    tooltipBackground
                        .transition().duration(200)
                        .attr("width", 0)
                        .attr("height", 0)
                    tooltipContent
                        .transition().duration(200).selectAll("*").remove()
                })
                
            events.selectAll('path')
                .data( filteredData ).enter()
                .append('path').attr( 'fill', d => d['team']['name'] === homeTeamName ? color : 'red' )
                .attr( 'd', d => {
                    const startX = homeAwayLocationX(d['location'][0], d['team']['name'])
                    const startY = homeAwayLocationY(d['location'][1], d['team']['name'])
                    const endX = homeAwayLocationX(d['pass']['end_location'][0], d['team']['name'])
                    const endY = homeAwayLocationY(d['pass']['end_location'][1], d['team']['name'])
                    const baseLeftX = angle(startX, startY, endX, endY)['baseLeftX']
                    const baseLeftY = angle(startX, startY, endX, endY)['baseLeftY']
                    const baseRightX = angle(startX, startY, endX, endY)['baseRightX']
                    const baseRightY = angle(startX, startY, endX, endY)['baseRightY']
                    return `M ${scX(endX)}, ${scY(endY)} L ${scX(baseLeftX)}, ${scY(baseLeftY)} L${scX(baseRightX)}, ${scY(baseRightY)}`
                })
        } else if (eventShow === 'interception' || eventShow === 'clearance' || eventShow === 'duel') {
            events.selectAll( "circle" )
                .data( filteredData )
                .enter()
                .append( "circle" )
                    .attr( 'r', 5 ).attr( 'fill', d => d['team']['name'] === homeTeamName ? color : 'red' )
                    .attr( 'cx', d => scX(homeAwayLocationX(d['location'][0], d['team']['name'])) )
                    .attr( 'cy', d => scY(homeAwayLocationY(d['location'][1], d['team']['name'])) )
                    .on("mouseover", function(mouseEvent, d) {
    
                        let y = -50
                        const marginRow = 25
                        let row = 3
    
                        tooltipContent.attr("transform", `translate(40, 0)`)
                        tooltipContent.append("text").text(d.type.name).attr("y", y).style("font-weight", "bold").style("font-size", "20px")
                        tooltipContent.append("text").text(`Minute: ${d.minute}'`).attr("y", y += marginRow + 4)
                        tooltipContent.append("text").text(`Player: ${d.player.name}`).attr("y", y += marginRow)
                        tooltipContent.append("text").text(`Team: ${d.team.name}`).attr("y", y += marginRow)
                        // tooltipContent.append("text").text(`Player: ${d.player.name}`).attr("y", y += marginRow)

                        let backgroundHeight = 40 + 26*row
                        tooltipBackground
                            .transition().duration(200)
                            .attr("x", 20)
                            .attr("y", -75)
                            .attr("width", 300)
                            .attr("height", backgroundHeight)
                        tooltipWrapper
                            .transition().duration(200)
                            .attr("transform", `translate(
                                ${mouseEvent.offsetX < width - pitchProps.margin.left - 300 ? mouseEvent.offsetX : mouseEvent.offsetX - 300 - 40 },
                                ${mouseEvent.offsetY < 75+20 ? 75+20 : mouseEvent.offsetY > height - pitchProps.margin.top - backgroundHeight ? height - pitchProps.margin.top - backgroundHeight + 75 : mouseEvent.offsetY}
                            )`)
                            .style("opacity", 1)
                    })
                    .on("mouseout", function(d) {
                        tooltipWrapper
                            .transition().duration(200)
                        tooltipBackground
                            .transition().duration(200)
                            .attr("width", 0)
                            .attr("height", 0)
                        tooltipContent
                            .transition().duration(200).selectAll("*").remove()
                    })
        }

        
        ///////////////////////////////////////////////////////////////////////////
		////////////////////////////// Add Tooltip ////////////////////////////////
		///////////////////////////////////////////////////////////////////////////

        var tooltipWrapper = svg.append("g")
		  .attr("class", "tooltip-wrapper")
		  .style("opacity", 0);

        var tooltipBackground = tooltipWrapper.append("rect")
          .attr("class", "tooltip-background")
        //   .attr("height", 150);
        
        var tooltipContent = tooltipWrapper.append("g")
            .attr("class", "tooltip-content")
            // .attr("transform", "translate(40, 0)")

    }, [eventsData, homeTeamName, awayTeamName, chalkboardRef, homePlayersPlay, awayPlayersPlay, eventShow, threeSixtyData, eventClick, homeAway])


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
                <div className='justify-content-center text-center'>
                    <ButtonGroup>
                        <Button variant={`${eventShow === 'shot' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('shot')}>Shot</Button>
                        <Button variant={`${eventShow === 'pass' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('pass')}>Pass</Button>
                        <Button variant={`${eventShow === 'interception' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('interception')}>Interception</Button>
                        <Button variant={`${eventShow === 'clearance' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('clearance')}>Clearance</Button>
                        <Button variant={`${eventShow === 'duel' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('duel')}>Duel</Button>
                    </ButtonGroup>
                </div>
                <div className='d-flex justify-content-center'>
                    <svg ref={chalkboardRef} fill='none' />
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
                    <Button onClick={handleEventClickOut}>Reset</Button>
            }
        </Row>
  )
}

export default Events