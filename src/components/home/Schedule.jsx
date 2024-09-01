import React from 'react'
import { Link } from 'react-router-dom';

function Schedule(props) {
    const { match } = props;

    return (
        <tbody>
            <tr>
                <td>{match.match_date}</td>
                <td>{match.home_team.home_team_name}</td>
                <td className='text-center'><Link to={`/match/${match.match_id}`}>{match.home_score} - {match.away_score}</Link></td>
                <td className='text-end'>{match.away_team.away_team_name}</td>
            </tr>
        </tbody>
    )
}

export default Schedule