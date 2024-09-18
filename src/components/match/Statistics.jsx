import React, { useEffect, useRef } from 'react'
import { Table } from 'react-bootstrap';
import * as d3 from 'd3';
import '../../styles/match/summary.css';

function Statistics(props) {
    const { events_data, match_data } = props;
    const homeTeam = match_data?.home_team.home_team_name;
    const awayTeam = match_data?.away_team.away_team_name;
    const shots = events_data?.filter(event => event.type.name === 'Shot');
    const homeShots = shots?.filter(shot => shot.team.name === homeTeam)
    const awayShots = shots?.filter(shot => shot.team.name === awayTeam)
    const shotsOnTarget = shots?.filter(shot => shot.shot.outcome.name === 'Saved' || shot.shot.outcome.name === 'Goal');
    const passes = events_data?.filter(event => event.type.name === 'Pass');
    const homePasses = passes?.filter(pass => pass.team.name === homeTeam);
    const awayPasses = passes?.filter(pass => pass.team.name === awayTeam);
    const homexG = homeShots?.map((shot) => shot.shot.statsbomb_xg);
    const awayxG = awayShots?.map((shot) => shot.shot.statsbomb_xg);
    const fouls = events_data?.filter(event => event.type.name === 'Foul Committed');
    const yellowCards = events_data?.filter(event => ('bad_behaviour' in event && 'card' in event.bad_behaviour && event.bad_behaviour.card.name === 'Yellow Card') || (('foul_committed' in event) && ('card' in event.foul_committed) && (event.foul_committed.card.name === 'Yellow Card')));
    const redCards = events_data?.filter(event => ('bad_behaviour' in event && 'card' in event.bad_behaviour && event.bad_behaviour.card.name === 'Red Card') || (('foul_committed' in event) && ('card' in event.foul_committed) && (event.foul_committed.card.name === 'Red Card')));
    const offsides = events_data?.filter(event => event.type.name === "Offside" || ('pass' in event && 'outcome' in event.pass && event.pass.outcome.name === "Pass Offside"))
    const cornerKicks = events_data?.filter(event => 'pass' in event && 'type' in event.pass && event.pass.type.name === 'Corner')
    console.log(offsides)
    
    const statistics = [
        {
            'title': 'xG',
            'homeTeam': Math.round(homexG?.reduce((accumulator, currentValue) => accumulator + currentValue, 0) * 100) / 100,
            'awayTeam': Math.round(awayxG?.reduce((accumulator, currentValue) => accumulator + currentValue, 0) * 100) /100
        }, 
        {
            'title': 'Shot',
            'homeTeam': homeShots?.length,
            'awayTeam': awayShots?.length
        }, {
            'title': 'Shot On Target',
            'homeTeam': shotsOnTarget?.filter(shot => shot.team.name === homeTeam).length,
            'awayTeam': shotsOnTarget?.filter(shot => shot.team.name === awayTeam).length
        }, {
            'title': 'Number of Passes',
            'homeTeam': homePasses?.length,
            'awayTeam': awayPasses?.length
        }, {
            'title': 'Completed Passes %',
            'homeTeam': Math.round((homePasses?.length - homePasses?.filter((pass) => 'outcome' in pass.pass).length) / homePasses?.length * 100 * 100 ) / 100 ,
            'awayTeam': Math.round((awayPasses?.length - awayPasses?.filter((pass) => 'outcome' in pass.pass).length) / awayPasses?.length * 100 * 100 ) / 100 
        }, {
            'title': 'Fouls',
            'homeTeam': fouls?.filter(foul => foul.team.name === homeTeam).length,
            'awayTeam': fouls?.filter(foul => foul.team.name === awayTeam).length
        }, {
            'title': 'Offsides',
            'homeTeam': offsides?.filter(d => d.team.name === homeTeam).length,
            'awayTeam': offsides?.filter(d => d.team.name === awayTeam).length
        }, {
            'title': 'Corner Kicks',
            'homeTeam': cornerKicks?.filter(d => d.team.name === homeTeam).length,
            'awayTeam': cornerKicks?.filter(d => d.team.name === awayTeam).length
        }, {
            'title': 'Yellow Cards',
            'homeTeam': yellowCards?.filter(d => d.team.name === homeTeam).length,
            'awayTeam': yellowCards?.filter(d => d.team.name === awayTeam).length
        }, {
            'title': 'Red Cards',
            'homeTeam': redCards?.filter(d => d.team.name === homeTeam).length,
            'awayTeam': redCards?.filter(d => d.team.name === awayTeam).length
        }
    ]

    const width = 300;
    const height = 450;
    const margin = {top: 10, right: 10, bottom: 50, left: 10};
    const innerWidth = width - margin.right - margin.left;
    const innerHeight = height - margin.top - margin.bottom;

    // Possession
    const data = [
        {possession: Math.round(homePasses?.length / passes?.length * 100 * 100) / 100, color: "#0300CC"},
        {possession: Math.round(awayPasses?.length / passes?.length * 100 * 100) / 100, color: "#D10000"}
    ]
    const statsRef = useRef();
    useEffect(() => {
        const statsVizContainer = d3.select(statsRef.current);
        statsVizContainer.selectAll("*").remove()
        const pieGenerator = d3.pie()
            .value(d => d.possession);
        const annotatedData = pieGenerator(data)
        const arcGenerator = d3.arc()
            .startAngle(d => d.startAngle)
            .endAngle(d => d.endAngle)
            .innerRadius(30)
            .outerRadius(50)
            .padAngle(0.02)
            .cornerRadius(3);
        const possessionContainer = statsVizContainer
            .append("g")
                .attr("transform", `translate(${innerWidth/2}, 60)`)
        const arcs = possessionContainer.selectAll("path")
            .data(annotatedData)
            .join("g")
        arcs
            .append("path")
                .attr("d", arcGenerator)
                .attr("fill", d => d.data.color)
        arcs
            .append("text")
                .text(d => {
                d["percentage"] = (d.endAngle - d.startAngle) / (2 * Math.PI);
                return d3.format(".0%")(d.percentage);
                })
                .attr("x", d => {
                d["centroid"] = arcGenerator
                    .startAngle(d.startAngle)
                    .endAngle(d.endAngle)
                    .centroid();
                return d.centroid[0];
                })
                .attr("y", d => d.centroid[1])
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("fill", "black")
                .attr("stroke", "black")
                .attr("stroke-width", "1")
                .style("font-size", "18px");

        statsVizContainer
            .append("text")
                .attr("transform", `translate(${innerWidth/2}, 60)`)
                .attr("class", "stats-detail")
                .text("Possession")
    })

    const countryCode = require("../../data/country_code.json")
    const findKeyByValue = (obj, value) => {
        const entry = Object.entries(obj).find(([key, val]) => val === value);
        return entry ? entry[0] : undefined;
    };
    const homeCountryCode = findKeyByValue(countryCode, homeTeam);
    const awayCountryCode = findKeyByValue(countryCode, awayTeam);

    return (
        <div className='statistics'>
        {/* <Table id='statistics'>
            <thead>
                <tr>
                    <th>{homeTeam}</th>
                    <th>Statistics</th>
                    <th>{awayTeam}</th>
                </tr>
            </thead>
            <tbody>
                {statistics.map((stats) => (
                    <tr>
                        <td>{stats.homeTeam}</td>
                        <td>{stats.title}</td>
                        <td>{stats.awayTeam}</td>
                    </tr>
                ))}
            </tbody>
        </Table> */}

        <p className='text-center fw-bold fs-2'>Statistics</p>
        <svg viewBox={`0 0 ${width} ${height}`}>
            <image
                href={`https://flagcdn.com/${homeCountryCode}.svg`}
                width={55}
                transform={`translate(${margin.left}, ${margin.top + 60/2 + 10})`}
                className='country-flag'
            />
            <image
                href={`https://flagcdn.com/${awayCountryCode}.svg`}
                width={55}
                transform={`translate(${innerWidth-55}, ${margin.top + 60/2 + 10})`}
                className='country-flag'
            />
            <g
                transform={`translate(${margin.left}, ${margin.top})`}
                ref={statsRef}
            >
            </g>
            
            {statistics.map((stats, index) => (
                <g transform={`translate(${margin.left}, ${margin.top + 140 + 30*index})`}>
                    <rect
                        x={0}
                        y={0}
                        width={stats.homeTeam / (stats.homeTeam + stats.awayTeam) * innerWidth - .1}
                        height={13}
                        fill='#0300CC'
                        rx={5}
                    />
                    <rect
                        x={stats.homeTeam / (stats.homeTeam + stats.awayTeam) * innerWidth + .1}
                        y={0}
                        width={innerWidth - stats.homeTeam / (stats.homeTeam + stats.awayTeam) * innerWidth}
                        height={13}
                        fill='#D10000'
                        rx={5}
                    />
                    <text x={5} y={-6} className='stats-detail'>{stats.homeTeam}</text>
                    <text x={innerWidth/2} y={-6} className='stats-detail'>{stats.title}</text>
                    <text x={innerWidth-5} y={-6} className='stats-detail'>{stats.awayTeam}</text>
                </g> 
            ))}
        </svg>

        
        </div>
    )
}

export default Statistics