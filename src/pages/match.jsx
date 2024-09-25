import React, { useEffect, useState } from 'react'
import FetchData from '../hooks/FetchData';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Head from '../components/match/head';
import Lineups from '../components/match/lineups';
import { Col, Row } from 'react-bootstrap';
import Events from '../components/match/Events';
import PlayerStats from '../components/match/PlayerStats';
import Statistics from '../components/match/Statistics';
import Analytics from '../components/match/Analytics';



function Match() {
    const { matchId } = useParams();
    const matchesUrl = "https://raw.githubusercontent.com/statsbomb/open-data/master/data/matches/55/282.json";
    const eventsUrl = `https://raw.githubusercontent.com/statsbomb/open-data/master/data/events/${matchId}.json`;
    const lineupsUrl = `https://raw.githubusercontent.com/statsbomb/open-data/master/data/lineups/${matchId}.json`;
    const threeSixtyUrl = `https://raw.githubusercontent.com/statsbomb/open-data/refs/heads/master/data/three-sixty/${matchId}.json`


    const { data: matchesData, loading: loadingMatchesData, error: errorMatchesData } = FetchData(matchesUrl);
    const { data: eventsData, loading: loadingEventsData, error: errorEventsData } = FetchData(eventsUrl);
    const { data: lineupsData, loading: loadingLineupsData, error: errorLineupsData } = FetchData(lineupsUrl);
    const { data: threeSixtyData, loading: loadingThreeSixtyData, error: errorThreeSixtyData } = FetchData(threeSixtyUrl)

    // const matchesData = require("../data/282.json");
    // const eventsData = require("../data/events-3942819.json");
    // const lineupsData = require("../data/lineups-3942819.json");
    // const threeSixtyData = require("../data/three-sixty-3942819.json")
    
    // const matchData = matchesData.find(match => match.match_id === Number(matchId))
    // const homeTeam = matchData.home_team.home_team_name;
    // const awayTeam = matchData.away_team.away_team_name;

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


    if (loadingMatchesData || loadingEventsData || loadingLineupsData || loadingThreeSixtyData) {
        return <div>Loading...</div>;
    }

    if (errorMatchesData || errorEventsData || errorLineupsData) {
        return <div>Error: {errorMatchesData?.message || errorEventsData?.message || errorLineupsData?.message || errorThreeSixtyData?.message}</div>;
    }
    
    
    return (
        <Layout>
            <Head matchData={matchData} eventsData={eventsData} />
            <Row className='justify-content-center text-center fs-5 fw-bold'>
                <button className={`button button-nav ${content === 'summary' ? 'button-active' : ''}`} onClick={() => setContent('summary')}>Summary</button>
                <button className={`button button-nav ${content === 'event' ? 'button-active' : ''}`} onClick={() => setContent('event')}>Event</button>
                <button className={`button button-nav ${content === 'playerStats' ? 'button-active' : ''}`} onClick={() => setContent('playerStats')}>Player Stats</button>
                <button className={`button button-nav ${content === 'analytics' ? 'button-active' : ''}`} onClick={() => setContent('analytics')}>Analytics</button>
                <hr />
            </Row>

            {content === 'summary' ? (
                <Row>
                    <Col className='ms-5'>
                        <Statistics events_data={eventsData} match_data={matchData} />
                    </Col>
                    <Col>
                        <Lineups matchData={matchData} lineupsData={lineupsData} />
                    </Col>
                </Row>
            ) : content === 'event' ? (
                <Events matchData={matchData} lineupsData={lineupsData} eventsData={eventsData} threeSixtyData={threeSixtyData} />
            ) : content === 'playerStats' ? (
                <PlayerStats events_data={eventsData} match_data={matchData} lineups_data={lineupsData} />
            ) : content === 'analytics' ? (
                <Analytics events_data={eventsData} match_data={matchData} lineups_data={lineupsData} />
            ) : (
                <p>Choose Content</p>
            )}
        </Layout>
    )
}

export default Match