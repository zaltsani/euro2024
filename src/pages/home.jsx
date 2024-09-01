import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Button, Col, Table } from 'react-bootstrap'
import Schedule from '../components/home/Schedule';

function Home() {
    const [matchesData, setMatchesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("https://raw.githubusercontent.com/statsbomb/open-data/master/data/matches/55/282.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Response Not OK")
                }
                return response.json();
            })
            .then(data => {
                setMatchesData(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            })
    }, [])

    const [numberMatches, setNumberMatches] = useState(7);
    const showMoreMatches = () => {
        setNumberMatches(numberMatches+5);
    };



    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    
    return (
        <Layout>
            <Col className='container'>
                <h2 className='mt-4'>Euro 2024</h2>
                <Col sm={7}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Match Date</th>
                                <th>Team</th>
                                <th className='text-center'>Score</th>
                                <th className='text-end'>Team</th>
                            </tr>
                        </thead>
                        {matchesData?.slice(0, numberMatches).map((match, index) => (
                            <Schedule key={index} match={match} />
                        ))}
                    </Table>
                    <Button onClick={showMoreMatches}>Show More</Button>
                </Col>
            </Col>
        </Layout>
    )
}

export default Home