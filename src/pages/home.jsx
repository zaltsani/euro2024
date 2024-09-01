import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Button } from 'react-bootstrap'

function Home() {
    const [matchesData, setMatchesData] = useState([]);

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
            })
    }, [])
    console.log(matchesData)
    return (
        <Layout>
            <div>home</div>
            <Button>Test</Button>
        </Layout>
    )
}

export default Home