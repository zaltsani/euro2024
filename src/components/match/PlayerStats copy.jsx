import React, { useEffect, useState } from 'react'
import { Button, ButtonGroup, Table } from 'react-bootstrap';
import '../../styles/match/PlayerStats.css';

function PlayerStats(props) {
    const { events_data, match_data, lineups_data } = props;

    const homeTeam = match_data?.home_team.home_team_name;
    const awayTeam = match_data?.away_team.away_team_name;
    const homeLineups = lineups_data[0]["lineup"];
    const awayLineups = lineups_data[1]["lineup"];
    const homePlayers = homeLineups.filter(d => d.positions.length !== 0);
    const awayPlayers = awayLineups.filter(d => d.positions.length !== 0);
    const playersPlay = homePlayers.concat(awayPlayers);
    
    const [homeAway, setHomeAway] = useState('home')
    const [statsType, setStatsType] = useState('general');

    // const [homePlayersStats, setHomePlayersStats] = useState(homePlayers);
    // const [awayPlayersStats, setAwayPlayersStats] = useState(awayPlayers);
    // const [playerStats, setPlayerStats] = useState(playersPlay)
    // const [isLoad, setIsLoad] = useState(false);
    // const [listPlayersStats, setListPlayersStats] = useState(playersPlay);
    // const listPlayersStats = homeAway === 'home' ? homePlayersStats : awayPlayersStats;
    // const listPlayersStats = playerStats;

    const generalStatsColumns = [
        { label: "Player Name", accessor: "player_name", sortable: false },
        { label: "Goal", accessor: "goal", sortable: true },
        { label: "Assist", accessor: "assist", sortable: true },
        { label: "Shot", accessor: "shot", sortable: true },
        { label: "xG", accessor: "xg", sortable: true },
        { label: "Passes", accessor: "passes", sortable: true }
    ]
    const attackStatsColumns = [
        { label: "Player Name", accessor: "player_name", sortable: false },
        { label: "Goal", accessor: "goal", sortable: true },
        { label: "xG", accessor: "xg", sortable: true },
        { label: "Total Shot", accessor: "shot", sortable: true },
        { label: "Shot On Target", accessor: "shot_on_target", sortable: true },
        { label: "Dribbles", accessor: "dribble", sortable: true },
        { label: "Successful Dribble", accessor: "successful_dribble", sortable: true },
    ]
    const columns = statsType === 'general' ? generalStatsColumns
        : statsType === 'attack' ? attackStatsColumns
        : generalStatsColumns;
    console.log(columns)

    const calculatePlayerStats = (players, events_data) => {
        return players.map(player => {
            const playerId = player.player_id;
            const shots = events_data.filter(event => event.type.name === 'Shot' && event.player.id === playerId)
            const goal = shots.filter(event => event.shot.outcome.name === 'Goal' && event.period !== 5)
            const xG = shots.map(shot => shot.shot.statsbomb_xg)
            const shotsOnTarget = shots.filter(shot => shot.shot.outcome.name === 'Goal' && shot.shot.outcome.name === 'Saved' && shot.shot.outcome.name === 'Blocked' && shot.shot.outcome.name === 'Saved To Post');
            const passes = events_data.filter(event => event.type.name === 'Pass' && event.player.id === playerId);
            const unsuccessful_passes = passes.filter(pass => pass.pass.outcome)
            const assist = passes.filter(pass => pass.pass["goal_assist"]);
            const chacesCreated = passes.filter(pass => pass.pass.shot_assist);
            const passesIntoFinalThird = passes.filter(pass => pass.pass.end_location[0] > 2/3*120 && pass.location[0] < 2/3*120);
            const passesIntoTheBox = passes.filter(pass => pass.pass.end_location[0] > 102 && pass.pass.end_location[1] > 18 && pass.pass.end_location[1] < 62);
            const unsuccessfulPassesIntoBox = passesIntoTheBox.filter(pass => pass.pass.outcome)
            const crosses = passes.filter(pass => pass.pass.cross);
            const cutBack = passes.filter(pass => pass.pass.cut_back);
            const switchPass = passes.filter(pass => pass.pass.switch);
            const dribble = events_data.filter(event => event.type.name === 'Dribble' && event.player.id === playerId);
            const successfulDribble = dribble.filter(d => d.dribble.outcome.name === 'Complete')
            const duel = events_data.filter(d => d.type.name === 'Duel' && d.player.id === playerId);
            const tackle = duel.filter(d => d.duel.type.id === 11);
            const successfulTackle = tackle.filter(d => d.duel.outcome.name === 'Won');
            const interceptions = events_data.filter(event => event.type.name === 'Interception' && event.player.id === playerId);
            const ballRecoveries = events_data.filter(event => event.type.name === 'Ball Recovery' && event.player.id === playerId);
            const failureRecoveries = ballRecoveries.filter(d => 'ball_recovery' in d && 'recovery_failure' in d['ball_recovery'])
            const blocks = events_data.filter(event => event.type.name === 'Block' && event.player.id === playerId);
            const clearances = events_data.filter(event => event.type.name === 'Clearance' && event.player.id === playerId);


            return { ...player,
                stats: {
                    "goal": goal.length,
                    "shot": shots.length,
                    "xg": Math.round(xG.reduce((accumulator, currentValue) => accumulator + currentValue, 0) * 100) / 100,
                    "shot_on_target": shotsOnTarget.length,
                    "passes": passes.length,
                    "assist": assist.length,
                    "chances_created": chacesCreated.length,
                    "successful_passes": passes.length - unsuccessful_passes.length,
                    "passes_into_final_third": passesIntoFinalThird.length,
                    "passes_into_the_box": passesIntoTheBox.length,
                    "successful_passes_into_the_box": passesIntoTheBox.length - unsuccessfulPassesIntoBox.length,
                    "crosses": crosses.length,
                    "cut_back": cutBack.length,
                    "switch_pass": switchPass.length,
                    "dribble": dribble.length,
                    "successful_dribble": successfulDribble.length,
                    "duel": duel.length,
                    "tackle": tackle.length,
                    "tackle_won": successfulTackle.length,
                    "interception": interceptions.length,
                    "ball_recovery": ballRecoveries.length,
                    "successful_recovery": ballRecoveries.length - failureRecoveries.length,
                    "blocks": blocks.length,
                    "clearances": clearances.length,
                }
            }
        })
    }

    const [listPlayersStats, setListPlayersStats] = useState(calculatePlayerStats(playersPlay, events_data));

    const [sortField, setSortField] = useState("");
    const [order, setOrder] = useState("asc");

    const handleSorting = (sortField, sortOrder) => {
        // console.log(sortField, sortOrder);
        if (sortField) {
            const sorted = [...listPlayersStats].sort((a, b) => {
                return (
                    a.stats[sortField].toString().localeCompare(b.stats[sortField].toString(), "en", {
                        numeric: true,
                    }) * (sortOrder === "asc" ? -1 : 1)
                );
            });
            setListPlayersStats(sorted);
        }
    }

    const handleSortingChange = (accessor) => {
        // console.log(accessor);
        const sortOrder = accessor === sortField && order === 'asc' ? "desc" : "asc";
        setSortField(accessor);
        setOrder(sortOrder);
        handleSorting(accessor, sortOrder);
    };


    return (
        <div id='player-stats-container'>
            <div className='m-3 mt-3 d-flex justify-content-center'>
            </div>
            <div>
                <ButtonGroup>
                    <Button variant={`${statsType === 'general' ? 'danger' : 'outline-danger'}`} onClick={() => setStatsType('general')}>General</Button>
                    <Button variant={`${statsType === 'attack' ? 'danger' : 'outline-danger'}`} onClick={() => setStatsType('attack')}>Attack</Button>
                    <Button variant={`${statsType === 'passes' ? 'danger' : 'outline-danger'}`} onClick={() => setStatsType('passes')}>Passes</Button>
                    <Button variant={`${statsType === 'defense' ? 'danger' : 'outline-danger'}`} onClick={() => setStatsType('defense')}>Defense</Button>
                    <Button variant={`${statsType === 'goalkeeping' ? 'danger' : 'outline-danger'}`} onClick={() => setStatsType('goalkeeping')}>Goalkeeping</Button>
                </ButtonGroup>
            </div>
            
            <div>
                {statsType === 'general' ? (
                    <Table>
                        <thead>
                            <tr>
                                {generalStatsColumns.map(({ label, accessor, sortable }) => {
                                    const cl = sortable
                                        ? sortField === accessor && order === "asc"
                                            ? "up"
                                        : sortField === accessor && order === "desc"
                                            ? "down"
                                        : "default"
                                    : "";
                                    return (
                                        <th
                                            key={accessor}
                                            onClick={sortable ? () => handleSortingChange(accessor) : null}
                                            className={cl}
                                        >
                                            {label}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                                {listPlayersStats?.map((player) => {
                                    return (
                                        <tr key={player.player_id}>
                                            {generalStatsColumns.map(({ accessor }) => {
                                                const tData = accessor === "player_name" ? player.player_name : player.stats[accessor] ? player.stats[accessor] : 0;
                                                return (
                                                    <td key={accessor}>
                                                        {tData}
                                                    </td>
                                                )
                                        })}
                                    </tr>
                                    );
                                })}
                        </tbody>
                    </Table>
                ) : statsType === 'attack' ? (
                    <Table>
                        <thead>
                            <tr>
                                <th>Player Name</th>
                                <th>Goal</th>
                                <th>xG</th>
                                <th>Total Shot</th>
                                <th>Shot On Target</th>
                                <th>Successful Dribbles</th>
                            </tr>
                        </thead>
                        <tbody>
                                {listPlayersStats?.map(player => (
                                    <tr>
                                        <td>{player.player_name}</td>
                                        <td>{player.stats.goal}</td>
                                        <td>{player.stats.xg}</td>
                                        <td>{player.stats.shot}</td>
                                        <td>{player.stats.shot_on_target}</td>
                                        <td>{player.stats.successful_dribble}/{player.stats.dribble} ({player.stats.successful_dribble ? Math.round(player.stats.successful_dribble*100/player.stats.dribble) : 0}%)</td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                ) : statsType === 'passes' ? (
                    <Table>
                        <thead>
                            <tr>
                                <th>Player Name</th>
                                <th>Touches</th>
                                <th>Passes</th>
                                <th>Assist</th>
                                <th>Chances Created</th>
                                <th>Passes into Final Third</th>
                                <th>Passes into the Box</th>
                                <th>Crosses</th>
                                <th>Cut Back</th>
                                <th>Long Balls</th>
                                <th>Switch Pass</th>
                            </tr>
                        </thead>
                        <tbody>
                                {listPlayersStats?.map(player => (
                                    <tr>
                                        <td>{player.player_name}</td>
                                        <td>Working on It</td>
                                        <td>{player.stats.successful_passes}/{player.stats.passes}({Math.round(player.stats.successful_passes/player.stats.passes*100)}%)</td>
                                        <td>{player.stats.assist}</td>
                                        <td>{player.stats.chances_created}</td>
                                        <td>{player.stats.passes_into_final_third}</td>
                                        <td>{player.stats.successful_passes_into_the_box}/{player.stats.passes_into_the_box}</td>
                                        <td>{player.stats.crosses}</td>
                                        <td>{player.stats.cut_back}</td>
                                        <td>Wait</td>
                                        <td>{player.stats.switch_pass}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                ) : statsType === 'defense' ? (
                    <Table>
                        <thead>
                            <tr>
                                <th>Player Name</th>
                                <th>Tackle</th>
                                <th>Interception</th>
                                <th>Ball Recovery</th>
                                <th>Blocks</th>
                                <th>Clearances</th>
                            </tr>
                        </thead>
                        <tbody>
                                {listPlayersStats?.map(player => (
                                    <tr>
                                        <td>{player.player_name}</td>
                                        <td>{ player.stats.tackle ? `${player.stats.tackle_won}/${player.stats.tackle} (${Math.round(player.stats.tackle_won*100/player.stats.tackle)}%)` : player.stats.tackle}</td>
                                        <td>{player.stats.interception}</td>
                                        <td>{player.stats.ball_recovery ? `${player.stats.successful_recovery}/${player.stats.ball_recovery} (${Math.round(player.stats.successful_recovery*100/player.stats.ball_recovery)}%)` : player.stats.ball_recovery }</td>
                                        <td>{player.stats.blocks}</td>
                                        <td>{player.stats.clearances}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                ) : statsType === 'goalkeeping' ? (
                    <tr>
                        <td>Attack</td>
                    </tr>
                ) : (<p>Fail</p>)
                }
            </div>
        </div>
    )
}

export default PlayerStats