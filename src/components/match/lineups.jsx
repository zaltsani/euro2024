import React, { useEffect, useRef, useState } from 'react'
import { Button, ButtonGroup, Col, Row } from 'react-bootstrap'
import * as d3 from 'd3';
import VerticalPitch from './VerticalPitch';

function Lineups(props) {
    const { matchData, lineupsData } = props 
    const [homeAway, setHomeAway] = useState('home');
    const [homeStartingXI, setHomeStartingXI] = useState([]);
    const [awayStartingXI, setAwayStartingXI] = useState([]);
    const [homePlayersPlay, setHomePlayersPlay] = useState([]);
    const [awayPlayersPlay, setAwayPlayersPlay] = useState([]);
    const data = homeAway === 'home' ? homeStartingXI : awayStartingXI;

    const lineupsViz = useRef();

    useEffect(() => {
        if (lineupsData && matchData) {
            const homeLineups = lineupsData[0]['lineup'];
            const awayLineups = lineupsData[1]["lineup"];
            const homePlayersPlay = homeLineups.filter(d => d.positions.length !== 0);
            const awayPlayersPlay = awayLineups.filter(d => d.positions.length !== 0);
            const homeStarting = homePlayersPlay.filter(d => d.positions[0].start_reason === "Starting XI");
            const awayStarting = awayPlayersPlay.filter(d => d.positions[0].start_reason === "Starting XI");

            setHomeStartingXI(homeStarting);
            setAwayStartingXI(awayStarting);
            setHomePlayersPlay(homePlayersPlay);
            setAwayPlayersPlay(awayPlayersPlay);
        }
      }, [lineupsData, matchData, setHomeStartingXI, setHomePlayersPlay, setAwayStartingXI, setAwayPlayersPlay]);

    useEffect(() => {
        const lineupsId = 'lineups';
        const width = 500;
        const lineupsPitchDimension = 'statsbomb'
        const lineupsSvg = d3.select(lineupsViz.current).attr('width', width);
        lineupsSvg.selectAll('*').remove()
        lineupsSvg.attr('id', lineupsId)
        const pitchProps = {
            svg: lineupsSvg,
            id: lineupsId,
            width: width,
            pitch_dimension: lineupsPitchDimension,
            background: 'white',
            line_color: 'grey'
        }
        VerticalPitch(pitchProps)

        const dimensions = require('../../data/dimensions.json')
        const dimension = dimensions["statsbomb"]
        const id = pitchProps.id
        const height = width * dimension.length / dimension.width / dimension.aspect
        const margin = 20;

        var scXPerc = d3.scaleLinear().domain([ 6, 1 ]).range([ margin + 1/10*height, height - 1/10*height ])
        var scYPerc = d3.scaleLinear().domain([ 1, 5 ]).range([ margin + 1/10*width, margin + width - 1/10*width])
        
        const svg = d3.select(`#${id}`);
        const pos = svg.append('g')
        
        if (data.length !== 0) {
        
            const position = require('../../data/positions_id.json')
            for (let player of data) {
                    var playerPos = position.find(pos => pos.position_id === player["positions"][0]["position_id"]);
                    player['x'] = playerPos['x'];
                    player['y'] = playerPos['y'];
            }
                    
            pos.selectAll( "circle" )
                .data( data )
                .enter()
                .append( "circle" )
                .attr( "r", 2.3/100*height ).attr( "fill", "white" ).attr( "stroke", 'grey' ).attr( "stroke-width", 4 )
                .attr( "cx", d => scYPerc( d["y"]) )
                .attr( "cy", d => scXPerc( d["x"]) )

            svg.selectAll( "text" )
                .data( data )
                .enter()
                .append( "text" )
                .attr( "x", d => scYPerc( d["y"] ))
                .attr( "y", d => scXPerc( d["x"] ) + 1/100*height)
                .attr( "font-size", 10 )
                .attr( "fill", "red")
                .attr( "text-align", "center")
                .attr( "class", "player-number" )
                .text( d => d["jersey_number"] )

            var playerName = svg.append('g');
            playerName.selectAll( "text" )
                .data( data )
                .enter()
                .append( "text" )
                .attr( "x", d => scYPerc( d["y"] ))
                .attr( "y", d => scXPerc( d["x"] ) + 1/20*height)
                .attr( "font-size", 10 )
                .attr( "fill", "red")
                .attr( "text-align", "center")
                .attr( "class", "player-name" )
                .text( d => d["player_nickname"] !== null ? d["player_nickname"].split(' ').length === 1 ? d["player_nickname"] : d["player_nickname"].split(' ')[0][0] + '. ' + d["player_nickname"].split(' ')[1] : d["player_name"].split(' ')[0][0] + '. ' + d["player_name"].split(' ')[1] )
        }
    })

    return (
        <Row>
            <Col className='d-flex flex-column justify-content-center'>
                <div className='d-flex justify-content-center mb-4'>
                    <span className='text-center fw-bold fs-2'>Lineups</span>
                        <ButtonGroup className='align-items-center ms-5'>
                            <Button variant={`${homeAway === 'home' ? 'danger' : 'outline-danger'}`} onClick={() => setHomeAway('home')}>
                                {matchData.home_team.home_team_name}
                            </Button>
                            <Button variant={`${homeAway === 'away' ? 'danger' : 'outline-danger'}`} onClick={() => setHomeAway('away')}>
                                {matchData.away_team.away_team_name}
                            </Button>
                        </ButtonGroup>
                </div>
                <div className='d-flex justify-content-center'>
                    <svg ref={lineupsViz} />
                </div>
            </Col>
        </Row>

    )
}

export default Lineups