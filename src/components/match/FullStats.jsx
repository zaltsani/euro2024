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
    const successfulPasses = passes.filter(d => !('outcome' in d.pass));
    const unsuccessfulPasses = passes.filter(d => ('outcome' in d.pass));
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
    const shotHomeXGOpenPlay = shotOpenPlay.filter(d => d.team.name === homeTeam).map(d => d.shot.statsbomb_xg);
    const shotAwayXGOpenPlay = shotOpenPlay.filter(d => d.team.name === awayTeam).map(d => d.shot.statsbomb_xg);
    const shotHomeXGSetPiece = shot.filter(d => d.shot.type.name === "Free Kick" || d.shot.type.name === "Corner").filter(d => d.team.name === homeTeam).map(d => d.shot.statsbomb_xg);
    const shotAwayXGSetPiece = shot.filter(d => d.shot.type.name === "Free Kick" || d.shot.type.name === "Corner").filter(d => d.team.name === awayTeam).map(d => d.shot.statsbomb_xg);

    const accuratePasses = (data) => {
        return data.filter(d => !('outcome' in d.pass));
    };
    const beginning = (datum) => {
        const xMetre = datum.location[0] / 120 * 105;
        const yMetre = datum.location[1] / 80 * 68;
        const rangeFromGoal = (xMetre**2 + yMetre**2)**(1/2);
        return rangeFromGoal
    };
    const end = (datum) => {
        const xMetre = datum.pass.end_location[0] / 120 * 105;
        const yMetre = datum.pass.end_location[1] / 80 * 68;
        const rangeFromGoal = (xMetre**2 + yMetre**2)**(1/2);
        return rangeFromGoal
    };
    const progressive = (data) => {
        return end(data) - beginning(data)
    };

    const passAssist = passes.filter(d => "goal_assist" in d.pass)
    const passKey = passes.filter(d => "shot_assist" in d.pass)
    const passCrosses = passes.filter(d => 'cross' in d.pass);
    const passCrossesAccurate = passCrosses.filter(d => !('outcome' in d.pass));
    const passSwitch = passes.filter(d => 'switch' in d.pass);
    const passCutBack = passes.filter(d => 'cut_back' in d.pass);
    const passFirstThird = passes.filter(d => d.location[0] < 1/3*120);
    const passMiddleThird = passes.filter(d => d.location[0] >= 1/3*120 && d.location[0] <= 2/3*120 );
    const passFinalThird = passes.filter(d => d.location[0] > 2/3*120);
    const passInOppositionBox = passes.filter(d => d.location[0] > 102 && d.location[1] > 18 && d.location[1] < 62);
    const passIntoFinalThird = passes.filter(d => d.location[0] < 2/3*120 && d.pass.end_location[0] > 2/3*120);
    const passIntoOppostionBox = passes.filter(d => 
        ((d.location[0] < 102) || (d.location[0] > 102 && d.location[1] < 18) || (d.location[0] > 102 && d.location[1] > 62)) &&
        (d.pass.end_location[0] > 102 && d.pass.end_location[1] > 18 && d.pass.end_location[1] < 62)
    );
    const passProgressive = passes.filter(d =>
        // (d.location[0] < 60 && d.pass.end_location[0] < 60 && progressive(d) > 30) ||
        // (d.location[0] < 60 && d.pass.end_location[0] > 60 && progressive(d) > 15) ||
        // (d.location[0] > 60 && d.pass.end_location[0] > 60 && progressive(d) > 10
        (progressive(d) > 10) && (progressive(d) > 25/100*beginning(d))
    );
    const passCorner = passes.filter(d => 'type' in d.pass && d.pass.type.name === 'Corner');
    const passFreeKick = passes.filter(d => 'type' in d.pass && d.pass.type.name === 'Free Kick');
    const passThrowIn = passes.filter(d => 'type' in d.pass && d.pass.type.name === 'Throw-in');

    const block = events_data.filter(d => d.type.name === "Block");
    const blockShot = block.filter(d => 'block' in d && 'save_block' in d.block);
    const interception = events_data.filter(d => d.type.name === "Interception");
    const interceptionWon = interception.filter(d => d.interception.outcome.name === "Won" || d.interception.outcome.name === "Success" || d.interception.outcome.name === "Success In Play" || d.interception.outcome.name === "Success Out");
    const duel = events_data.filter(d => d.type.name === "Duel");
    const tackle = duel.filter(d => d.duel.type.name === "Tackle");
    const tackleWon = tackle.filter(d => d.duel.outcome.name === "Won" || d.duel.outcome.name === "Success" || d.duel.outcome.name === "Success In Play");
    const clearance = events_data.filter(d => d.type.name === "Clearance");
    const ballRecovery = events_data.filter(d => d.type.name === "Ball Recovery");

    const offsides = events_data.filter(d => d.type.name === "Offside")
    const redCardsFouls = foulsCommitted.filter(d => 'card' in d && (d.card.name))
    const badBehaviour = events_data.filter(d => "bad_behaviour" in d)
    // const yellowCards = badBehaviour.filter(d => d.bad_behaviour.)
    console.log(badBehaviour)


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
        {title: "Expected Goals (xG)", home: Math.round(homexG?.reduce((accumulator, currentValue) => accumulator + currentValue, 0) * 100) / 100, away: Math.round(awayxG?.reduce((accumulator, currentValue) => accumulator + currentValue, 0) * 100) / 100},
        {title: "xG Open Play", home: Math.round(shotHomeXGOpenPlay?.reduce((accumulator, currentValue) => accumulator + currentValue, 0) * 100) / 100, away: Math.round(shotAwayXGOpenPlay?.reduce((accumulator, currentValue) => accumulator + currentValue, 0) * 100) / 100},
        {title: "xG Set Piece", home: Math.round(shotHomeXGSetPiece?.reduce((accumulator, currentValue) => accumulator + currentValue, 0) * 100) / 100, away: Math.round(shotAwayXGSetPiece?.reduce((accumulator, currentValue) => accumulator + currentValue, 0) * 100) / 100},
        {title: "Saved", home: homeStats(shotSaved), away: awayStats(shotSaved)},
        {title: "Hit Post", home: homeStats(shotPost), away: awayStats(shotPost)},
        {title: "Blocked", home: homeStats(shotBlocked), away: awayStats(shotBlocked)},
        {title: "Off Target", home: homeStats(shotOffTarget), away: awayStats(shotOffTarget)},
        {title: "Six Yard Box", home: homeStats(shotSixYardBox), away: awayStats(shotSixYardBox)},
        {title: "Penalty Area", home: homeStats(shotPenaltyArea), away: awayStats(shotPenaltyArea)},
        {title: "Outside the Box", home: homeStats(shotOutsideTheBox), away: awayStats(shotOutsideTheBox)},
        {title: "Open Play", home: homeStats(shotOpenPlay), away: awayStats(shotOpenPlay)},
        {title: "From Free Kick", home: homeStats(shotFreeKick), away: awayStats(shotFreeKick)},
        {title: "From Corner", home: homeStats(shotCorner), away: awayStats(shotCorner)},
        {title: "Penalty", home: homeStats(shotPenalty), away: awayStats(shotPenalty)},
        {title: "Header", home: homeStats(shotHead), away: awayStats(shotHead)},
    ]
    const passStats = [
        {title: "Passes", home: homeStats(passes), away: awayStats(passes)},
        {title: "Assist", home: homeStats(passAssist), away: awayStats(passAssist)},
        {title: "Key Pass", home: homeStats(passKey), away: awayStats(passKey)},
        {title: "Accurate Passes", home: `${homeStats(successfulPasses)} (${Math.round(homeStats(successfulPasses)/homeStats(passes)*100)/1}%)`, away: `${awayStats(successfulPasses)} (${Math.round(awayStats(successfulPasses)/awayStats(passes)*100)}%)`},
        {title: "Unsuccessful Passes", home: `${homeStats(unsuccessfulPasses)} (${Math.round(homeStats(unsuccessfulPasses)/homeStats(passes)*100)/1}%)`, away: `${awayStats(unsuccessfulPasses)} (${Math.round(awayStats(unsuccessfulPasses)/awayStats(passes)*100)}%)`},
        {title: "Crosses", home: `${homeStats(passCrossesAccurate)}/${homeStats(passCrosses)}`, away: `${awayStats(passCrossesAccurate)}/${awayStats(passCrosses)}`},
        {title: "Switch Pass", home: homeStats(passSwitch), away: awayStats(passSwitch)},
        {title: "Cut Back Pass", home: homeStats(passCutBack), away: awayStats(passCutBack)},
        {title: "Pass in First Third", home: homeStats(passFirstThird), away: awayStats(passFirstThird)},
        {title: "Pass in Middle Third", home: homeStats(passMiddleThird), away: awayStats(passMiddleThird)},
        {title: "Pass in Final Third", home: homeStats(passFinalThird), away: awayStats(passFinalThird)},
        {title: "Pass in Opposition Box", home: homeStats(passInOppositionBox), away: awayStats(passInOppositionBox)},
        {title: "Pass into Final Third ", home: `${homeStats(accuratePasses(passIntoFinalThird))}/${homeStats(passIntoFinalThird)}`, away: `${awayStats(accuratePasses(passIntoFinalThird))}/${awayStats(passIntoFinalThird)}`},
        {title: "Pass into Opposition Box ", home: `${homeStats(accuratePasses(passIntoOppostionBox))}/${homeStats(passIntoOppostionBox)}`, away: `${awayStats(accuratePasses(passIntoOppostionBox))}/${awayStats(passIntoOppostionBox)}`},
        {title: "Progressive Passes", home: homeStats(accuratePasses(passProgressive)), away: awayStats(accuratePasses(passProgressive))},
        {title: "Corner", home: `${homeStats(accuratePasses(passCorner))}/${homeStats(passCorner)}`, away: `${awayStats(accuratePasses(passCorner))}/${awayStats(passCorner)}`},
        {title: "Free Kick", home: `${homeStats(accuratePasses(passFreeKick))}/${homeStats(passFreeKick)}`, away: `${awayStats(accuratePasses(passFreeKick))}/${awayStats(passFreeKick)}`},
        {title: "Throw In", home: `${homeStats(accuratePasses(passThrowIn))}/${homeStats(passThrowIn)}`, away: `${awayStats(accuratePasses(passThrowIn))}/${awayStats(passThrowIn)}`},
    ]
    const defenseStats = [
        {title: "Block Shot", home: homeStats(blockShot), away: awayStats(blockShot)},
        {title: "Interception", home: `${homeStats(interceptionWon)}/${homeStats(interception)}`, away: `${awayStats(interceptionWon)}/${awayStats(interception)}`},
        {title: "Tackle", home: `${homeStats(tackleWon)}/${homeStats(tackle)}`, away: `${awayStats(tackleWon)}/${awayStats(tackle)}`},
        {title: "Clearance", home: homeStats(clearance), away: awayStats(clearance)},
        {title: "Ball Recovery", home: homeStats(ballRecovery), away: awayStats(ballRecovery)},
        // {title: "", home: "", away: ""},
    ]
    const miscellaneousStats = [
        {title: "Fouls", home: homeStats(foulsCommitted), away: awayStats(foulsCommitted)},
        {title: "Offside", home: `${homeStats(offsides)}`, away: `${awayStats(offsides)}`},
        {title: "Yellow Card", home: `${homeStats(tackleWon)}/${homeStats(tackle)}`, away: `${awayStats(tackleWon)}/${awayStats(tackle)}`},
        {title: "Red Card", home: homeStats(clearance), away: awayStats(clearance)},
        // {title: "Ball Recovery", home: homeStats(ballRecovery), away: awayStats(ballRecovery)},
    ]

    return (
        <div className='full-stats-container'>

            {/* <div className='stats-container'>
                <div className='stats-container-title'>Top Stats</div>
                {topStats.map(stats => (
                    <div className='stats-row'>
                        <div className={`home-stats ${stats.home > stats.away ? "home-over" : ""}`}>{stats.home}</div>
                        <div className='stats-title'>{stats.title}</div>
                        <div className={`away-stats ${stats.away > stats.home ? "away-over" : ""}`}>{stats.away}</div>
                    </div>
                ))}
            </div> */}

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
                {defenseStats.map(stats => (
                    <div className='stats-row'>
                        <div className={`home-stats ${stats.home > stats.away ? "home-over" : ""}`}>{stats.home}</div>
                        <div className='stats-title'>{stats.title}</div>
                        <div className={`away-stats ${stats.away > stats.home ? "away-over" : ""}`}>{stats.away}</div>
                    </div>
                ))}
            </div>

            <div className='stats-container'>
                <div className='stats-container-title'>Miscellaneous</div>
                {miscellaneousStats.map(stats => (
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