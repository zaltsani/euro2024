import React from 'react'
import { Row } from 'react-bootstrap';
import '../../styles/match/head.css';

function Head(props) {
    const { matchData, eventsData } = props;
    const homeTeam = matchData.home_team.home_team_name;
    const awayTeam = matchData.away_team.away_team_name;

    const mainEvent = eventsData?.filter(event =>
        (event.type.name === 'Shot' && event.shot.outcome.name === 'Goal' && event.period !== 5)
        || ('bad_behaviour' in event && 'card' in event.bad_behaviour && event.bad_behaviour.card.id === 5)
        || ('foul_committed' in event && 'card' in event.foul_committed && event.foul_committed.card.id === 5)
        || (event.type.name === 'Own Goal Against')
    )

    const countryCode = require("../../data/country_code.json")
    const findKeyByValue = (obj, value) => {
        const entry = Object.entries(obj).find(([key, val]) => val === value);
        return entry ? entry[0] : undefined;
    };
    const homeCountryCode = findKeyByValue(countryCode, homeTeam);
    const awayCountryCode = findKeyByValue(countryCode, awayTeam)

    // console.log(homeCountryCode)
    

    return (
        <Row className='justify-content-center text-center m-0'>
            <div className='inner '>
                <p>
                    {matchData.season.season_name} {matchData.competition.competition_name}
                </p>
                <div className='fs-2 fw-bold title my-container'>
                    <span className='home-team'>{homeTeam}</span>
                    <img className='bordered-image home-flag' src={`https://flagcdn.com/${homeCountryCode}.svg`} height={50} alt={homeTeam} />
                    <span className='score'>{matchData.home_score} - {matchData.away_score}</span>
                    <img className='bordered-image away-flag' src={`https://flagcdn.com/${awayCountryCode}.svg`} height={50} alt={awayTeam} />
                    <span className='away-team'>{awayTeam}</span>
                </div>

                <div className='mt-5'>
                    {mainEvent.map((event) => (
                            <p className='event'>
                                <span className={`${event.team.name === homeTeam ? 'home' : 'away'}-event`}>{event.player.name}{event.type.name === 'Own Goal Against' ? ' (OG)' : ''}</span>
                                {event.type.name === 'Shot' || event.type.name === 'Own Goal Against' ? (
                                    <img className={`${event.team.name === homeTeam ? 'home' : 'away'}-event-type ${event.type.name === 'Own Goal Against' ? 'own-goal' : ''}`} src={'https://ssl.gstatic.com/onebox/sports/game_feed/goal_icon.svg'} height={20} />
                                ) : (
                                    <img className={`${event.team.name === homeTeam ? 'home' : 'away'}-event-type`} src={'https://ssl.gstatic.com/onebox/sports/soccer_timeline/red-card-right.svg'} height={20} />
                                )}
                                <span className='type'></span>
                                <span className='minute'>{event.minute}'</span>
                            </p>
                    ))}
                </div>
            </div>
        </Row>
    )
}

export default Head