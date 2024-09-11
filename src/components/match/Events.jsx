import React, { useEffect, useRef, useState } from 'react'
import Pitch from './Pitch';
import * as d3 from 'd3';
import { Button, ButtonGroup, Col, Form, Row } from 'react-bootstrap';

function Events(props) {
    const { matchData, lineupsData, eventsData } = props;
    const chalkboardRef = useRef();

    const homeTeamName = matchData.home_team.home_team_name;
    const awayTeamName = matchData.away_team.away_team_name;

    const [homeSelectAllCheck, setHomeSelectAllCheck] = useState(true);
    const [awaySelectAllCheck, setAwaySelectAllCheck] = useState(true);
    const [homePlayersPlay, setHomePlayersPlay] = useState([]);
    const [awayPlayersPlay, setAwayPlayersPlay] = useState([]);
    const [eventShow, setEventShow] = useState('shot')

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
        const width = 800
        const pitchProps = {
            svgRef: chalkboardRef,
            width: width,
            margin: width/40,
            pitch_dimension: 'statsbomb',
            background: 'white',
            line_color: 'grey'
        };
        
        Pitch(pitchProps)

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

        const events = d3.select(chalkboardRef.current)
            .append("g")
                .attr("transform", `translate(${pitchProps.margin}, ${pitchProps.margin})`)
                .attr("class", "events")

        const shot = eventsData.filter(event => event.type.name === 'Shot');
        const pass = eventsData.filter(event => event.type.name === 'Pass');
        const interceptions = eventsData.filter(event => event.type.name === 'Interception');
        const clearances = eventsData.filter(event => event.type.name === 'Clearance');
        const duel = eventsData.filter(event => event.type.name === 'Duel');

        const data = eventShow === 'shot' ? shot : eventShow === 'pass' ? pass : eventShow === 'interception' ? interceptions : eventShow === 'clearance' ? clearances : eventShow === 'duel' ? duel : shot;
        const filteredData = data.filter(event => player_ids.includes(event.player.id));

        const dimensions = require('../../data/dimensions.json')
        const dimension = dimensions["statsbomb"]
        var scX = d3.scaleLinear().domain([0, dimension.length]).range([ 0, width - 2*pitchProps["margin"] ])
        var scY = dimension.invert_y
                    ? d3.scaleLinear().domain([0, dimension.width]).range([ 0, width * dimension.width/dimension.length*dimension.aspect - 2*pitchProps["margin"] ])
                    : d3.scaleLinear().domain([dimension.width, 0]).range([ 0, width * dimension.width/dimension.length*dimension.aspect - 2*pitchProps["margin"] ])
        var scXG = d3.scaleLinear().domain([ 0, 1 ]).range([ 4, 20 ])

        const color = 'blue';

        events.selectAll("*").remove()

        // var eventWrapper = svg.append("g").attr("class", "event-wrapper")
        // var event = eventWrapper.selectAll(".event-group")
        //     .data(filteredData)

        function homeAwayLocationX(x, team) {
            return team === homeTeamName ? x : dimension.length - x
        }
        function homeAwayLocationY(y, team) {
            return team === homeTeamName ? y : dimension.width - y
        }

        if (eventShow === 'shot') {
            events.selectAll( "circle" )
                .data( filteredData )
                .enter()
                .append( "circle" )
                    .attr( 'r', d => scXG(d['shot']['statsbomb_xg']) ).attr( 'fill', d => d['shot']['outcome']['name'] === 'Goal' ? 'red' : color )
                    .attr( 'cx', d =>  scX(d['team']['name'] === homeTeamName ? d['location'][0] : dimension.length - d['location'][0]) )
                    .attr( 'cy', d => scY(d['team']['name'] === homeTeamName ? d['location'][1] : dimension.width - d['location'][1]))
                    .attr("class", "shot")
                .on("mouseover", function(d) {
                    // const data = d.srcElement.__data__
                    console.log(d)
                    
                        tooltipBackground
                            .transition().duration(100)
                            .attr("x", scX(data['team']['name'] === homeTeamName ? data['location'][0] : dimension.length - data['location'][0]))
                            .attr("y", scY(data['team']['name'] === homeTeamName ? data['location'][1] : dimension.width - data['location'][1]))
                            .attr("width", 100)
                            .attr("fill", "white")
                            .attr("stroke", "grey")
                            .attr("stroke-widt", 2)
                        tooltipWrapper
                            .transition().duration(1000)
                            .attr("transform", `translate(300, 200`)
                            .style("opacity", 1)
                    
                })
                // .on("mouseout", function(d) {
                //     tooltipWrapper
                //     .transition().duration(400)
                //     .style("opacity", 0);
                // })

            // events.selectAll(".shot")
            //     .data().enter().append("g")
            //     .attr("transform", d => `translate(${scX(d['team']['name'] === homeTeamName ? d['location'][0] : dimension.length - d['location'][0])}, 200)`)
            //     .on("mouseover", function(d) {
            //         console.log(d)
            //     })
            
            events.selectAll( "line" )
                .data( filteredData ).enter()
                .append( "line" ).attr( 'stroke', color )
                    .attr( 'x1', d => scX(d['team']['name'] === homeTeamName ? d['location'][0] : dimension.length - d['location'][0]) )
                    .attr( 'y1', d => scY(d['team']['name'] === homeTeamName ? d['location'][1] : dimension.width - d['location'][1]) )
                    .attr( 'x2', d => scX(d['team']['name'] === homeTeamName ? d['shot']['end_location'][0] : dimension.length - d['shot']['end_location'][0] ) )
                    .attr( 'y2', d => scY(d['team']['name'] === homeTeamName ? d['shot']['end_location'][1] : dimension.width - d['shot']['end_location'][1] ) )
        
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
                .append( "line" ).attr( 'stroke', d => d['team']['name'] === homeTeamName ? color : 'red' )
                .attr( 'x1', d => scX(d['team']['name'] === homeTeamName ? d['location'][0] : dimension.length - d['location'][0]) )
                .attr( 'y1', d => scY(d['team']['name'] === homeTeamName ? d['location'][1] : dimension.width - d['location'][1]) )
                .attr( 'x2', d => scX(homeAwayLocationX(d['pass']['end_location'][0], d['team']['name'] )) )
                .attr( 'y2', d => scY(homeAwayLocationY(d['pass']['end_location'][1], d['team']['name'])) )
                
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
        }

        

        
        ///////////////////////////////////////////////////////////////////////////
		////////////////////////////// Add Tooltip ////////////////////////////////
		///////////////////////////////////////////////////////////////////////////

        var tooltipWrapper = svg.append("g")
		  .attr("class", "tooltip-wrapper")
		  .attr("transform", `translate(${pitchProps.margin}, ${pitchProps.margin})`)
		  .style("opacity", 0);

        var tooltipBackground = tooltipWrapper.append("rect")
          .attr("class", "tooltip-background")
        //   .attr("x", 0)
        //   .attr("y", -28)
          .attr("width", 0)
          .attr("height", 100);
    }, [eventsData, homeTeamName, chalkboardRef, homePlayersPlay, awayPlayersPlay, eventShow])


    return (
        <Row className='d-flex justify-content-center align-items-center flex-wrap'>

            <Col className='text-end align-items-start'>
                <div className='m-1'>
                    <Form>
                        <Form.Check className='fw-bold'>
                            Select All
                            <Form.Check.Input
                                type='radio'
                                checked={homeSelectAllCheck}
                                className='ms-3'
                                onClick={() => hadleHomeSelectAllCheckBox()}
                            />
                        </Form.Check>
                    </Form>
                </div>
                    {homePlayersPlay.map((player) => (
                        <div key={player.player_id} className='m-1'>
                            <Form>
                                <Form.Check type='radio'>
                                    {player.player_name}
                                    <Form.Check.Input
                                        type='radio'
                                        checked={player["isChecked"]}
                                        onClick={() => handleHomeCheckBox(player.player_id)}
                                        className='ms-3'
                                    />
                                </Form.Check>
                            </Form>
                        </div>
                    ))}
            </Col>

            <Col>
                <svg ref={chalkboardRef} fill='none' />
            </Col>

            <Col className='text-start align-items-start'>
                <div className='m-1'>
                    <Form>
                        <Form.Check className='fw-bold' type='radio'>
                            <Form.Check.Input
                                type='radio'
                                checked={awaySelectAllCheck}
                                className='me-3'
                                onClick={() => hadleAwaySelectAllCheckBox()}
                            />
                            Select All
                        </Form.Check>
                    </Form>
                </div>
                {awayPlayersPlay.map((player) => (
                    <div key={player.player_id} className='m-1'>
                        <Form>
                            <Form.Check type='radio'>
                                <Form.Check.Input
                                    type='radio'
                                    checked={player["isChecked"]}
                                    onClick={() => handleAwayCheckBox(player.player_id)}
                                    className='me-3'
                                />
                                {player.player_name}
                            </Form.Check>
                        </Form>
                    </div>
                ))}
            </Col>

            <div className='justify-content-center text-center fs-5 fw-bold'>
                <ButtonGroup>
                    <Button variant={`${eventShow === 'shot' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('shot')}>Shot</Button>
                    <Button variant={`${eventShow === 'pass' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('pass')}>Pass</Button>
                    <Button variant={`${eventShow === 'interception' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('interception')}>Interception</Button>
                    <Button variant={`${eventShow === 'clearance' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('clearance')}>Clearance</Button>
                    <Button variant={`${eventShow === 'duel' ? 'dark' : 'outline-dark'}`} onClick={() => setEventShow('duel')}>Duel</Button>
                </ButtonGroup>
            </div>

        </Row>
  )
}

export default Events