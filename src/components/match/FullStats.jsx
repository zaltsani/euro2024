import React from 'react';

function FullStats(props) {
    const { events_data, match_data, lineups_data } = props;
    const homeTeam = match_data?.home_team.home_team_name;
    const awayTeam = match_data?.away_team.away_team_name;

    const homeStats = (data) => {
        return data.filter(d => d.team.name === homeTeam).length;
    };
    const awayStats = (data) => {
        return data.filter(d => d.team.name === awayTeam).length;
    };

    // Statistics
    const shot = events_data.filter(d => d.type.name === 'Shot');
    const passes = events_data.filter(d => d.type.name === 'Pass');
    const successfulPasses = passes.filter(d => !('outcome' in d.pass))
    const homexG = shot.filter(d => d.team.name === homeTeam).map(d => d.shot.statsbomb_xg);
    const awayxG = shot.filter(d => d.team.name === awayTeam).map(d => d.shot.statsbomb_xg);
    const shotOnTarget = shot.filter(shot => shot.shot.outcome.name === 'Goal' || shot.shot.outcome.name === 'Saved' || shot.shot.outcome.name === 'Saved To Post');
    const foulsCommitted = events_data.filter(d => d.type.name === 'Foul Committed')
    const corners = passes.filter(d => 'type' in d.pass && d.pass.type.name === "Corner")

    const shotSixYardBox = shot.filter(d => d.location[0] > 114 && d.location[1] > 30 && d.location[1] < 50);
    const shotPenaltyArea = shot.filter(d => d.location[0] > 102 && d.location[1] > 18 && d.location[1] < 62);
    const shotOutsideTheBox = shot.filter(d => !(d.location[0] > 102 && d.location[1] > 18 && d.location[1] < 62));
    const shotSaved = shot.filter(d => d.shot.outcome.name === 'Saved' || d.shot.outcome.name === 'Saved To Post');
    const shotPost = shot.filter(d => d.shot.outcome.name === 'Post');
    const shotBlocked = shot.filter(d => d.shot.outcome.name === 'Blocked');
    const shotOffTarget = shot.filter(d => d.shot.outcome.name === 'Off T' || d.shot.outcome.name === 'Wayward' || d.shot.outcome.name === 'Saved Off T')
    const shotGoal = shot.filter(d => d.shot.outcome.name === 'Goal');
    const shotOpenPlay = shot.filter(d => d.shot.type.name === 'Open Play');
    const shotFreeKick = shot.filter(d => d.shot.type.name === 'Free Kick');
    const shotCorner = shot.filter(d => d.shot.type.name === 'Corner');
    const shotPenalty = shot.filter(d => d.shot.type.name === 'Penalty');
    const shotHead = shot.filter(d => d.shot.body_part.name === 'Head');

    const topStats = [
        {title: "Possession", home: `${Math.round(homeStats(passes)/passes.length*1000)/10}%`, away: `${Math.round(awayStats(passes)/passes.length*1000)/10}%`},
        {title: "Expected Goals (xG)", home: Math.round(homexG?.reduce((accumulator, currentValue) => accumulator + currentValue, 0) * 100) / 100, away: Math.round(awayxG?.reduce((accumulator, currentValue) => accumulator + currentValue, 0) * 100) / 100},
        {title: "Shot", home: homeStats(shot), away: awayStats(shot)},
        {title: "Shot on Target", home: homeStats(shotOnTarget), away: awayStats(shotOnTarget)},
        {title: "Passes", home: homeStats(passes), away: awayStats(passes)},
        {title: "Accurate Passes", home: `${homeStats(successfulPasses)} (${Math.round(homeStats(successfulPasses)/homeStats(passes)*100)/1}%)`, away: `${awayStats(successfulPasses)} (${Math.round(awayStats(successfulPasses)/awayStats(passes)*100)}%)`},
        {title: "Fouls", home: homeStats(foulsCommitted), away: awayStats(foulsCommitted)},
        {title: "Corners", home: homeStats(corners), away: awayStats(corners)},
    ]
    const shotStats = [
        {title: "Shot", home: homeStats(shot), away: awayStats(shot)},
        {title: "Goal", home: homeStats(shotGoal), away: awayStats(shotGoal)},
        {title: "Saved", home: homeStats(shotSaved), away: awayStats(shotSaved)},
        {title: "Hit Post", home: homeStats(shotPost), away: awayStats(shotPost)},
        {title: "Blocked", home: homeStats(shotBlocked), away: awayStats(shotBlocked)},
        {title: "Off Target", home: homeStats(shotOffTarget), away: awayStats(shotOffTarget)},
        {title: "Six Yard Box", home: homeStats(shotSixYardBox), away: awayStats(shotSixYardBox)},
        {title: "Penalty Area", home: homeStats(shotPenaltyArea), away: awayStats(shotPenaltyArea)},
        {title: "Outside the Box", home: homeStats(shotOutsideTheBox), away: awayStats(shotOutsideTheBox)},
        {title: "Open Play", home: homeStats(shotOpenPlay), away: awayStats(shotOpenPlay)},
        {title: "Free Kick", home: homeStats(shotFreeKick), away: awayStats(shotFreeKick)},
        {title: "Corner", home: homeStats(shotCorner), away: awayStats(shotCorner)},
        {title: "Penalty", home: homeStats(shotPenalty), away: awayStats(shotPenalty)},
        {title: "Header", home: homeStats(shotHead), away: awayStats(shotHead)},
    ]
    const passStats = [
        {title: "Passes", home: "", away: ""},
        {title: "", home: "", away: ""},
        {title: "", home: "", away: ""},
        {title: "", home: "", away: ""},
        {title: "", home: "", away: ""},
        {title: "", home: "", away: ""},
    ]
    const defenseStats = [
        {title: "Passes", home: "", away: ""},
        {title: "", home: "", away: ""},
        {title: "", home: "", away: ""},
        {title: "", home: "", away: ""},
        {title: "", home: "", away: ""},
        {title: "", home: "", away: ""},
    ]

    return (
        <div className='full-stats-container'>

            <div className='stats-container'>
                <div className='stats-container-title'>Top Stats</div>
                {topStats.map(stats => (
                    <div className='stats-row'>
                        <div className={`home-stats ${stats.home > stats.away ? "home-over" : ""}`}>{stats.home}</div>
                        <div className='stats-title'>{stats.title}</div>
                        <div className={`away-stats ${stats.away > stats.home ? "away-over" : ""}`}>{stats.away}</div>
                    </div>
                ))}
            </div>

            <div className='stats-container'>
                <div className='stats-container-title'>Shot</div>
                {shotStats.map(stats => (
                    <div className='stats-row'>
                        <div className={`home-stats ${stats.home > stats.away ? "home-over" : ""}`}>{stats.home}</div>
                        <div className='stats-title'>{stats.title}</div>
                        <div className={`away-stats ${stats.away > stats.home ? "away-over" : ""}`}>{stats.away}</div>
                    </div>
                ))}
            </div>

            <div className='stats-container'>
                <div className='stats-container-title'>Passes</div>
                {passStats.map(stats => (
                    <div className='stats-row'>
                        <div className={`home-stats ${stats.home > stats.away ? "home-over" : ""}`}>{stats.home}</div>
                        <div className='stats-title'>{stats.title}</div>
                        <div className={`away-stats ${stats.away > stats.home ? "away-over" : ""}`}>{stats.away}</div>
                    </div>
                ))}
            </div>

            <div className='stats-container'>
                <div className='stats-container-title'>Defense</div>
                {topStats.map(stats => (
                    <div className='stats-row'>
                        <div className={`home-stats ${stats.home > stats.away ? "home-over" : ""}`}>{stats.home}</div>
                        <div className='stats-title'>{stats.title}</div>
                        <div className={`away-stats ${stats.away > stats.home ? "away-over" : ""}`}>{stats.away}</div>
                    </div>
                ))}
            </div>
        </div>
  )
}

export default FullStats