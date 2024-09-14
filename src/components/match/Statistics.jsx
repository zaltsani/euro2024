import React from 'react'
import { Table } from 'react-bootstrap';

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
    const homexG = homeShots?.map((shot) => shot.shot.statsbomb_xg)
    const awayxG = awayShots?.map((shot) => shot.shot.statsbomb_xg)

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
            'title': 'Possession %',
            'homeTeam': Math.round(homePasses?.length / passes?.length * 100 * 100) / 100 ,
            'awayTeam': Math.round(awayPasses?.length / passes?.length * 100 * 100) / 100
        }, {
            'title': 'Number of Passes',
            'homeTeam': homePasses?.length,
            'awayTeam': awayPasses?.length
        }, {
            'title': 'Completed Passes %',
            'homeTeam': Math.round((homePasses?.length - homePasses?.filter((pass) => 'outcome' in pass.pass).length) / homePasses?.length * 100 * 100 ) / 100 ,
            'awayTeam': Math.round((awayPasses?.length - awayPasses?.filter((pass) => 'outcome' in pass.pass).length) / awayPasses?.length * 100 * 100 ) / 100 
        }

    ]


    return (
        <Table id='statistics'>
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
        </Table>
    )
}

export default Statistics