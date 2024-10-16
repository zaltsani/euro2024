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
    ]
    const passesStatsColumns = [
        { label: "Player Name", accessor: "player_name", sortable: false },
        { label: "Passes", accessor: "passes_details", sortable: true },
        { label: "Assist", accessor: "assist", sortable: true },
        { label: "Chance Created", accessor: "chances_created", sortable: true },
        { label: "Passes into Final Third", accessor: "passes_into_final_third", sortable: true },
        { label: "Passes into The Box", accessor: "passes_into_the_box", sortable: true },
        { label: "Crosses", accessor: "crosses", sortable: true },
        { label: "Cut Back", accessor: "cut_back", sortable: true },
        { label: "Switch Pass", accessor: "switch_pass", sortable: true },
    ]
    const defenseStatsColumns = [
        { label: "Player Name", accessor: "player_name", sortable: false },
        { label: "Tackle", accessor: "tackle", sortable: true },
        { label: "Interception", accessor: "interception", sortable: true },
        { label: "Duel", accessor: "duel", sortable: true },
        { label: "Ball Recovery", accessor: "ball_recovery", sortable: true },
        { label: "Blocks", accessor: "blocks", sortable: true },
        { label: "Clearance", accessor: "clearances", sortable: true },
    ]
    const columns = statsType === 'general' ? generalStatsColumns
        : statsType === 'attack' ? attackStatsColumns
        : statsType === 'passes' ? passesStatsColumns
        : statsType === 'defense' ? defenseStatsColumns
        : generalStatsColumns;

    const calculatePlayerStats = (players, events_data) => {
        return players.map(player => {
            const playerId = player.player_id;
            const shots = events_data.filter(event => event.type.name === 'Shot' && event.player.id === playerId)
            const goal = shots.filter(event => event.shot.outcome.name === 'Goal' && event.period !== 5)
            const xG = shots.map(shot => shot.shot.statsbomb_xg)
            const shotsOnTarget = shots.filter(shot => shot.shot.outcome.name === 'Goal' || shot.shot.outcome.name === 'Saved' || shot.shot.outcome.name === 'Blocked' || shot.shot.outcome.name === 'Saved To Post');
            const passes = events_data.filter(event => event.type.name === 'Pass' && event.player.id === playerId);
            const unsuccessful_passes = passes.filter(pass => pass.pass.outcome)
            const assist = passes.filter(pass => pass.pass["goal_assist"]);
            const chacesCreated = passes.filter(pass => pass.pass.shot_assist);
            const passesIntoFinalThird = passes.filter(pass => pass.pass.end_location[0] > 2/3*120 && pass.location[0] < 2/3*120);
            const passesIntoTheBox = passes.filter(pass => pass.pass.end_location[0] > 102 && pass.pass.end_location[1] > 18 && pass.pass.end_location[1] < 62);
            const unsuccessfulPassesIntoBox = passesIntoTheBox.filter(pass => pass.pass.outcome)
            const crosses = passes.filter(pass => pass.pass.cross);
            const unsuccessful_crosses = crosses.filter(d => d.pass.outcome);
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
                    "passes_details": `${passes.length - unsuccessful_passes.length}/${passes.length}(${Math.round((passes.length-unsuccessful_passes.length)/(passes.length)*100)}%)`,
                    "passes_into_final_third": passesIntoFinalThird.length,
                    "passes_into_the_box": passesIntoTheBox.length,
                    "successful_passes_into_the_box": passesIntoTheBox.length - unsuccessfulPassesIntoBox.length,
                    "crosses": `${crosses.length-unsuccessful_crosses.length}/${crosses.length}`,
                    "cut_back": cutBack.length,
                    "switch_pass": switchPass.length,
                    "dribble": `${successfulDribble.length}/${dribble.length}`,
                    "successful_dribble": successfulDribble.length,
                    "duel": duel.length,
                    "tackle": `${successfulTackle.length}/${tackle.length}`,
                    "tackle_won": successfulTackle.length,
                    "interception": interceptions.length,
                    "ball_recovery": `${ballRecoveries.length - failureRecoveries.length}/${ballRecoveries.length}`,
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
            <div className='mb-4 mt-3 d-flex'>
                <ButtonGroup>
                    <Button variant={`${statsType === 'general' ? 'danger' : 'outline-danger'}`} onClick={() => setStatsType('general')}>General</Button>
                    <Button variant={`${statsType === 'attack' ? 'danger' : 'outline-danger'}`} onClick={() => setStatsType('attack')}>Attack</Button>
                    <Button variant={`${statsType === 'passes' ? 'danger' : 'outline-danger'}`} onClick={() => setStatsType('passes')}>Passes</Button>
                    <Button variant={`${statsType === 'defense' ? 'danger' : 'outline-danger'}`} onClick={() => setStatsType('defense')}>Defense</Button>
                    <Button variant={`${statsType === 'goalkeeping' ? 'danger' : 'outline-danger'}`} onClick={() => setStatsType('goalkeeping')}>Goalkeeping</Button>
                </ButtonGroup>
            </div>
            
            <div>
                <Table>
                    <thead>
                        <tr>
                            {columns.map(({ label, accessor, sortable }) => {
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
                                        className={`${cl} ${accessor === "player_name" ? "" : "text-align-center"} align-middle`}
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
                                        {columns.map(({ accessor }) => {
                                            const tData = accessor === "player_name" ? player.player_name
                                                : player.stats[accessor] ? player.stats[accessor] : 0;
                                            return (
                                                <td
                                                    key={accessor}
                                                    className={accessor === "player_name" ? "" : "text-align-center"}
                                                >
                                                    {tData}
                                                </td>
                                            )
                                    })}
                                </tr>
                                );
                            })}
                    </tbody>
                </Table>
            </div>
        </div>
    )
}

export default PlayerStats