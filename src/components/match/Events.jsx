import React, { useEffect, useRef, useState } from 'react'
import Pitch from './Pitch';
import * as d3 from 'd3';
import { Col, Form, Row } from 'react-bootstrap';

function Events(props) {
    const { matchData, lineupsData, eventsData } = props;

    const homeTeamName = matchData.home_team.home_team_name;
    const awayTeamName = matchData.away_team.away_team_name;

    const [homeSelectAllCheck, setHomeSelectAllCheck] = useState(true);
    const [awaySelectAllCheck, setAwaySelectAllCheck] = useState(true);
    const [homePlayersPlay, setHomePlayersPlay] = useState([]);
    const [awayPlayersPlay, setAwayPlayersPlay] = useState([]);

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

    // Make Pitch
    const id = 'chalkboard';
    const width = 800
    const pitchProps = {
        id: id,
        width: width,
        margin: width/40,
        pitch_dimension: 'statsbomb',
        background: 'white',
        line_color: 'grey'
    };
    useEffect(() => {
        Pitch(pitchProps);
    });

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
    }, [lineupsData, setHomePlayersPlay, setAwayPlayersPlay])


    //*********** Data */
    const [data, setData] = useState([]);
    useEffect(() => {
        const shot = eventsData.filter(event => event.type.name === 'Shot');
        setData(shot);
    }, [eventsData]);


    // SVG Manipulation for Events using D3
    const svg = d3.select(`#pitch-${id}`)

    //************** Scaling ********/
    const dimensions = require('../../data/dimensions.json')
    const dimension = dimensions["statsbomb"]
    var scX = d3.scaleLinear().domain([0, dimension.length]).range([ 0, width - 2*pitchProps["margin"] ])
    var scY = dimension.invert_y
                ? d3.scaleLinear().domain([0, dimension.width]).range([ 0, width * dimension.width/dimension.length*dimension.aspect - 2*pitchProps["margin"] ])
                : d3.scaleLinear().domain([dimension.width, 0]).range([ 0, width * dimension.width/dimension.length*dimension.aspect - 2*pitchProps["margin"] ])
    var scXG = d3.scaleLinear().domain([ 0, 1 ]).range([ 4, 20 ])

    //******************************/
    //* Add Events
    //*****************************/
    const color = 'blue'
    svg.selectAll( "circle" )
        .data( data )
        .enter()
        .append( "circle" )
        .attr( 'r', d => scXG(d['shot']['statsbomb_xg']) ).attr( 'fill', d => d['shot']['outcome']['name'] === 'Goal' ? 'red' : color )
        .attr( 'cx', d =>  scX(d['team']['name'] === homeTeamName ? d['location'][0] : dimension.length - d['location'][0]) )
        .attr( 'cy', d => scY(d['team']['name'] === homeTeamName ? d['location'][1] : dimension.width - d['location'][1]))
    svg.selectAll( "line" )
        .data( data ).enter()
        .append( "line" ).attr( 'stroke', color )
        .attr( 'x1', d => scX(d['team']['name'] === homeTeamName ? d['location'][0] : dimension.length - d['location'][0]) )
        .attr( 'y1', d => scY(d['team']['name'] === homeTeamName ? d['location'][1] : dimension.width - d['location'][1]) )
        .attr( 'x2', d => scX(d['team']['name'] === homeTeamName ? d['shot']['end_location'][0] : dimension.length - d['shot']['end_location'][0] ) )
        .attr( 'y2', d => scY(d['team']['name'] === homeTeamName ? d['shot']['end_location'][1] : dimension.width - d['shot']['end_location'][1] ) )





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
                <svg id={id} className="m-1 d-flex align-items-center" />
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

        </Row>
  )
}

export default Events