import React, { useEffect, useState } from 'react'
import FetchData from '../hooks/FetchData';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Head from '../components/match/head';
import Lineups from '../components/match/lineups';
import { Row } from 'react-bootstrap';
import Events from '../components/match/Events';
import PlayerStats from '../components/match/PlayerStats';

function Match() {
    const { matchId } = useParams();
    const matchesUrl = "https://raw.githubusercontent.com/statsbomb/open-data/master/data/matches/55/282.json";
    const eventsUrl = `https://raw.githubusercontent.com/statsbomb/open-data/master/data/events/${matchId}.json`;
    const lineupsUrl = `https://raw.githubusercontent.com/statsbomb/open-data/master/data/lineups/${matchId}.json`;

    const { data: matchesData, loading: loadingMatchesData, error: errorMatchesData } = FetchData(matchesUrl);
    const { data: eventsData, loading: loadingEventsData, error: errorEventsData } = FetchData(eventsUrl);
    const { data: lineupsData, loading: loadingLineupsData, error: errorLineupsData } = FetchData(lineupsUrl);

    const [matchData, setMatchData] = useState();
    const [homeTeam, setHomeTeam] = useState();
    const [awayTeam, setAwayTeam] = useState();
    const [content, setContent] = useState('summary');
    
    useEffect(() => {
        const matchIdNumber = Number(matchId);
        setMatchData(matchesData.find(match => match.match_id === matchIdNumber))
        if (matchData) {
            setHomeTeam(matchData?.home_team.home_team_name)
            setAwayTeam(matchData?.away_team.away_team_name)
        }
    }, [matchesData, matchId, matchData])


    if (loadingMatchesData || loadingEventsData || loadingLineupsData) {
        return <div>Loading...</div>;
    }

    if (errorMatchesData || errorEventsData || errorLineupsData) {
        return <div>Error: {errorMatchesData?.message || errorEventsData?.message || errorLineupsData?.message}</div>;
    }
    
    
    return (
        <Layout>
            <Head matchData={matchData} eventsData={eventsData} />
            <Row className='justify-content-center text-center fs-5 fw-bold'>
                <button className={`button button-nav ${content === 'summary' ? 'button-active' : ''}`} onClick={() => setContent('summary')}>Summary</button>
                <button className={`button button-nav ${content === 'event' ? 'button-active' : ''}`} onClick={() => setContent('event')}>Event</button>
                <button className={`button button-nav ${content === 'playerStats' ? 'button-active' : ''}`} onClick={() => setContent('playerStats')}>Player Stats</button>
                <hr />
            </Row>

            {content === 'summary' ? (
                <Lineups matchData={matchData} lineupsData={lineupsData} />
            ) : content === 'event' ? (
                <Events />
            ) : content === 'playerStats' ? (
                <PlayerStats />
            ) : (
                <p>Choose Content</p>
            )}
        </Layout>
    )
}

export default Match