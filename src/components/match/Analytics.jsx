import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Pitch from './Pitch';
import VerticalPitch from './VerticalPitch2';
import '../../styles/match/Analytics.css';
import { Button, ButtonGroup } from 'react-bootstrap';

function Analytics(props) {
    const { events_data, match_data, lineups_data } = props;

    const homeTeam = match_data?.home_team.home_team_name;
    const awayTeam = match_data?.away_team.away_team_name;
    const homeLineups = lineups_data[0]["lineup"];
    const awayLineups = lineups_data[1]["lineup"];
    const homePlayersPlay = homeLineups.filter(d => d.positions.length !== 0);
    const awayPlayersPlay = awayLineups.filter(d => d.positions.length !== 0);
    const homeStarting = homePlayersPlay.filter(d => d.positions[0].start_reason === "Starting XI");
    const awayStarting = awayPlayersPlay.filter(d => d.positions[0].start_reason === "Starting XI");

    const [homeAway, setHomeAway] = useState('home')
    const listPlayers = homeAway === 'home' ? homeStarting : awayStarting;

    const passes = events_data.filter(event => event.type.name === 'Pass');
    const passes_first_third = passes.filter(pass => pass.location[0] <= 1/3 * 120);
    const passes_middle_third = passes.filter(pass => (pass.location[0] > 1/3 * 120) && (pass.location[0] < 2/3*120));
    const passes_final_third = passes.filter(pass => pass.location[0] >= 2/3 * 120);


    // Passing Network
    for (const index in listPlayers) {
        const playerId = listPlayers[index]['player_id'];
        const playerPasses = passes.filter(pass => pass.player.id === playerId);
        const PassXTotal = playerPasses.reduce((accumulator, currentItem) => accumulator + currentItem["location"][0], 0);
        const PassYTotal = playerPasses.reduce((accumulator, currentItem) => accumulator + currentItem["location"][1], 0);
        const AverageXLocation = PassXTotal / playerPasses.length;
        const AverageYLocation = PassYTotal / playerPasses.length;
        listPlayers[index]["average_passing_location"] = [AverageXLocation, AverageYLocation];

        const playerReceiptPass = passes.filter(pass => ('recipient' in pass.pass && pass.pass.recipient.id === playerId));
        const ReceiptXTotal = playerReceiptPass.reduce((accumulator, currentItem) => accumulator + currentItem["pass"]["end_location"][0], 0);
        const ReceiptYTotal = playerReceiptPass.reduce((accumulator, currentItem) => accumulator + currentItem["pass"]["end_location"][1], 0);
        const AverageXReceiptLocation = ReceiptXTotal / playerReceiptPass.length;
        const AverageYReceiptLocation = ReceiptYTotal / playerReceiptPass.length;
        listPlayers[index]["average_receipt_pass_location"] = [AverageXReceiptLocation, AverageYReceiptLocation];

        const averageLocationX = (PassXTotal + ReceiptXTotal) / (playerPasses.length + playerReceiptPass.length);
        const averageLocationY = (PassYTotal + ReceiptYTotal) / (playerPasses.length + playerReceiptPass.length);
        listPlayers[index]["average_location_pass_and_receipt"] = [averageLocationX, averageLocationY];
        
        // Passing Connection
        const passingConnection = []
        for (const index in listPlayers) {
            const playerIdConnection = listPlayers[index]["player_id"];
            const playerNameConnection = listPlayers[index]["player_name"];
            const passesToConnection = playerPasses.filter(pass => 'recipient' in pass.pass &&  pass.pass.recipient.id === playerIdConnection);
            passingConnection.push({
                "player": {"id": playerIdConnection, "name": playerNameConnection},
                "number_passes": passesToConnection.length
            });
        }
        listPlayers[index]["passing_connection"] = passingConnection;
    }

    const passingNetworkRef = useRef();
    useEffect(() => {
        const svg = d3.select(passingNetworkRef.current)
        svg.selectAll("*").remove()
        // Make Pitch
        const id = 'passingNetwork';
        const width = 400
        const pitchProps = {
            svgRef: passingNetworkRef,
            width: width,
            margin: width/40,
            pitch_dimension: 'statsbomb',
            background: 'white',
            line_color: 'grey'
        };
        VerticalPitch(pitchProps)

        const dimensions = require('../../data/dimensions.json')
        const dimension = dimensions["statsbomb"]
        const height = width * dimension.length/dimension.width*dimension.aspect
        var scX = d3.scaleLinear().domain([0, dimension.length]).range([ height - 2*pitchProps["margin"], 0 ])
        var scY = dimension.invert_y
                    ? d3.scaleLinear().domain([0, dimension.width]).range([ 0, width - 2*pitchProps["margin"] ])
                    : d3.scaleLinear().domain([dimension.width, 0]).range([ 0, width - 2*pitchProps["margin"] ])

        const passingNetworkSvg = svg.append("g").attr("class", "passing-network")

        const linePassingNetwork = passingNetworkSvg
            .append("g")
                .attr("class", "line-passing-network")
        for (const index in listPlayers) {
            const player = listPlayers[index]
            for (const connectionIndex in listPlayers[index]["passing_connection"]) {
                const playerPassConnection = listPlayers.find(player => player.player_id === listPlayers[index]["passing_connection"][connectionIndex]["player"]["id"]);;
                const numberPasses = listPlayers[index]["passing_connection"][connectionIndex]["number_passes"];
                if (numberPasses > 5) {
                    const playerGroup = passingNetworkSvg.select(`[id='${player.player_name}'`)
                    linePassingNetwork
                        .append("path")
                            .attr("d",
                                `M ${scY(player["average_location_pass_and_receipt"][1])} ${scX(player["average_location_pass_and_receipt"][0])}
                                L ${scY(playerPassConnection["average_location_pass_and_receipt"][1])} ${scX(playerPassConnection["average_location_pass_and_receipt"][0])}`)
                            .attr("stroke", "red")
                            .attr("stroke-width", numberPasses > 12 ? 6 : numberPasses/12 * 6)
                            .attr("opacity", numberPasses > 12 ? 1 : numberPasses/12)
                }
            }
        }

        const playerPassingNetwork = passingNetworkSvg.append("g").attr("class", "player-passing-network")
            .selectAll("g")
            .data(listPlayers)
            .join("g")
                .attr("transform", d => `translate(${scY(d.average_location_pass_and_receipt[1])}, ${scX(d.average_location_pass_and_receipt[0])})`)
                .attr("id", d => d.player_name)
        playerPassingNetwork
            .append("circle")
                .attr("r", 10)
                .attr("fill", "white")
                .attr("stroke", "gray")
                .attr("stroke-width", 2)
        playerPassingNetwork
            .append('text')
                .text(d => d.jersey_number)
                .attr("fill", "black")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
    })


    // Passing Network First Third
    for (const index in listPlayers) {
        const playerId = listPlayers[index]['player_id'];
        const playerPasses = passes_first_third.filter(pass => pass.player.id === playerId);
        const PassXTotal = playerPasses.reduce((accumulator, currentItem) => accumulator + currentItem["location"][0], 0);
        const PassYTotal = playerPasses.reduce((accumulator, currentItem) => accumulator + currentItem["location"][1], 0);
        const AverageXLocation = PassXTotal / playerPasses.length;
        const AverageYLocation = PassYTotal / playerPasses.length;
        listPlayers[index]["average_passing_location_first_third"] = [AverageXLocation, AverageYLocation];

        const playerReceiptPass = passes_first_third.filter(pass => ('recipient' in pass.pass && pass.pass.recipient.id === playerId));
        const ReceiptXTotal = playerReceiptPass.reduce((accumulator, currentItem) => accumulator + currentItem["pass"]["end_location"][0], 0);
        const ReceiptYTotal = playerReceiptPass.reduce((accumulator, currentItem) => accumulator + currentItem["pass"]["end_location"][1], 0);
        const AverageXReceiptLocation = ReceiptXTotal / playerReceiptPass.length;
        const AverageYReceiptLocation = ReceiptYTotal / playerReceiptPass.length;
        listPlayers[index]["average_receipt_pass_location_first_third"] = [AverageXReceiptLocation, AverageYReceiptLocation];

        const averageLocationX = (PassXTotal + ReceiptXTotal) / (playerPasses.length + playerReceiptPass.length);
        const averageLocationY = (PassYTotal + ReceiptYTotal) / (playerPasses.length + playerReceiptPass.length);
        listPlayers[index]["average_location_pass_and_receipt_first_third"] = [averageLocationX, averageLocationY];
        
        // Passing Connection
        const passingConnection = []
        for (const index in listPlayers) {
            const playerIdConnection = listPlayers[index]["player_id"];
            const playerNameConnection = listPlayers[index]["player_name"];
            const passesToConnection = playerPasses.filter(pass => 'recipient' in pass.pass &&  pass.pass.recipient.id === playerIdConnection);
            passingConnection.push({
                "player": {"id": playerIdConnection, "name": playerNameConnection},
                "number_passes": passesToConnection.length
            });
        }
        listPlayers[index]["passing_connection_first_third"] = passingConnection;
    }

    const passingNetworkFirstThird = useRef();
    useEffect(() => {
        const svg = d3.select(passingNetworkFirstThird.current)
        svg.selectAll("*").remove()
        // Make Pitch
        const id = 'passingNetwork';
        const width = 400
        const pitchProps = {
            svgRef: passingNetworkFirstThird,
            width: width,
            margin: width/40,
            pitch_dimension: 'statsbomb',
            background: 'white',
            line_color: 'grey'
        };
        VerticalPitch(pitchProps)

        const dimensions = require('../../data/dimensions.json')
        const dimension = dimensions["statsbomb"]
        const height = width * dimension.length/dimension.width*dimension.aspect
        var scX = d3.scaleLinear().domain([0, dimension.length]).range([ height - 2*pitchProps["margin"], 0 ])
        var scY = dimension.invert_y
                    ? d3.scaleLinear().domain([0, dimension.width]).range([ 0, width - 2*pitchProps["margin"] ])
                    : d3.scaleLinear().domain([dimension.width, 0]).range([ 0, width - 2*pitchProps["margin"] ])

        const passingNetworkSvg = svg.append("g").attr("class", "passing-network")

        const linePassingNetwork = passingNetworkSvg
            .append("g")
                .attr("class", "line-passing-network")
        for (const index in listPlayers) {
            const player = listPlayers[index]
            for (const connectionIndex in listPlayers[index]["passing_connection_first_third"]) {
                const playerPassConnection = listPlayers.find(player => player.player_id === listPlayers[index]["passing_connection_first_third"][connectionIndex]["player"]["id"]);;
                const numberPasses = listPlayers[index]["passing_connection_first_third"][connectionIndex]["number_passes"];
                if (numberPasses > 0) {
                    const playerGroup = passingNetworkSvg.select(`[id='${player.player_name}'`)
                    linePassingNetwork
                        .append("path")
                            .attr("d",
                                `M ${scY(player["average_location_pass_and_receipt_first_third"][1])} ${scX(player["average_location_pass_and_receipt_first_third"][0])}
                                L ${scY(playerPassConnection["average_location_pass_and_receipt_first_third"][1])} ${scX(playerPassConnection["average_location_pass_and_receipt_first_third"][0])}`)
                            .attr("stroke", "red")
                            .attr("stroke-width", numberPasses > 12 ? 6 : numberPasses/12 * 6)
                            .attr("opacity", numberPasses > 12 ? 1 : numberPasses/12)
                }
            }
        }

        const playerPassingNetwork = passingNetworkSvg.append("g").attr("class", "player-passing-network")
            .selectAll("g")
            .data(listPlayers)
            .join("g")
                .attr("transform", d => `translate(${scY(d.average_location_pass_and_receipt_first_third[1])}, ${scX(d.average_location_pass_and_receipt_first_third[0])})`)
                .attr("id", d => d.player_name)
        playerPassingNetwork
            .append("circle")
                .attr("r", 10)
                .attr("fill", "white")
                .attr("stroke", "gray")
                .attr("stroke-width", 2)
        playerPassingNetwork
            .append('text')
                .text(d => d.jersey_number)
                .attr("fill", "black")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
    })


    // Passing Network Middle Third
    for (const index in listPlayers) {
        const playerId = listPlayers[index]['player_id'];
        const playerPasses = passes_middle_third.filter(pass => pass.player.id === playerId);
        const PassXTotal = playerPasses.reduce((accumulator, currentItem) => accumulator + currentItem["location"][0], 0);
        const PassYTotal = playerPasses.reduce((accumulator, currentItem) => accumulator + currentItem["location"][1], 0);
        const AverageXLocation = PassXTotal / playerPasses.length;
        const AverageYLocation = PassYTotal / playerPasses.length;
        listPlayers[index]["average_passing_location_middle_third"] = [AverageXLocation, AverageYLocation];

        const playerReceiptPass = passes_middle_third.filter(pass => ('recipient' in pass.pass && pass.pass.recipient.id === playerId));
        const ReceiptXTotal = playerReceiptPass.reduce((accumulator, currentItem) => accumulator + currentItem["pass"]["end_location"][0], 0);
        const ReceiptYTotal = playerReceiptPass.reduce((accumulator, currentItem) => accumulator + currentItem["pass"]["end_location"][1], 0);
        const AverageXReceiptLocation = ReceiptXTotal / playerReceiptPass.length;
        const AverageYReceiptLocation = ReceiptYTotal / playerReceiptPass.length;
        listPlayers[index]["average_receipt_pass_location_middle_third"] = [AverageXReceiptLocation, AverageYReceiptLocation];

        const averageLocationX = (PassXTotal + ReceiptXTotal) / (playerPasses.length + playerReceiptPass.length);
        const averageLocationY = (PassYTotal + ReceiptYTotal) / (playerPasses.length + playerReceiptPass.length);
        listPlayers[index]["average_location_pass_and_receipt_middle_third"] = [averageLocationX, averageLocationY];
        
        // Passing Connection
        const passingConnection = []
        for (const index in listPlayers) {
            const playerIdConnection = listPlayers[index]["player_id"];
            const playerNameConnection = listPlayers[index]["player_name"];
            const passesToConnection = playerPasses.filter(pass => 'recipient' in pass.pass &&  pass.pass.recipient.id === playerIdConnection);
            passingConnection.push({
                "player": {"id": playerIdConnection, "name": playerNameConnection},
                "number_passes": passesToConnection.length
            });
        }
        listPlayers[index]["passing_connection_middle_third"] = passingConnection;
    }

    const passingNetworkMiddleThird = useRef();
    useEffect(() => {
        const svg = d3.select(passingNetworkMiddleThird.current)
        svg.selectAll("*").remove()
        // Make Pitch
        const id = 'passingNetwork';
        const width = 400
        const pitchProps = {
            svgRef: passingNetworkMiddleThird,
            width: width,
            margin: width/40,
            pitch_dimension: 'statsbomb',
            background: 'white',
            line_color: 'grey'
        };
        VerticalPitch(pitchProps)

        const dimensions = require('../../data/dimensions.json')
        const dimension = dimensions["statsbomb"]
        const height = width * dimension.length/dimension.width*dimension.aspect
        var scX = d3.scaleLinear().domain([0, dimension.length]).range([ height - 2*pitchProps["margin"], 0 ])
        var scY = dimension.invert_y
                    ? d3.scaleLinear().domain([0, dimension.width]).range([ 0, width - 2*pitchProps["margin"] ])
                    : d3.scaleLinear().domain([dimension.width, 0]).range([ 0, width - 2*pitchProps["margin"] ])

        const passingNetworkSvg = svg.append("g").attr("class", "passing-network")

        const linePassingNetwork = passingNetworkSvg
            .append("g")
                .attr("class", "line-passing-network")
        for (const index in listPlayers) {
            const player = listPlayers[index]
            for (const connectionIndex in listPlayers[index]["passing_connection_middle_third"]) {
                const playerPassConnection = listPlayers.find(player => player.player_id === listPlayers[index]["passing_connection_middle_third"][connectionIndex]["player"]["id"]);;
                const numberPasses = listPlayers[index]["passing_connection_middle_third"][connectionIndex]["number_passes"];
                if (numberPasses > 0) {
                    const playerGroup = passingNetworkSvg.select(`[id='${player.player_name}'`)
                    linePassingNetwork
                        .append("path")
                            .attr("d",
                                `M${scY(player["average_location_pass_and_receipt_middle_third"][1])} ${scX(player["average_location_pass_and_receipt_middle_third"][0])}
                                L ${scY(playerPassConnection["average_location_pass_and_receipt_middle_third"][1])} ${scX(playerPassConnection["average_location_pass_and_receipt_middle_third"][0])}`)
                            .attr("stroke", "red")
                            .attr("stroke-width", numberPasses > 12 ? 6 : numberPasses/12 * 6)
                            .attr("opacity", numberPasses > 12 ? 1 : numberPasses/12)
                }
            }
        }

        const playerPassingNetwork = passingNetworkSvg.append("g").attr("class", "player-passing-network")
            .selectAll("g")
            .data(listPlayers)
            .join("g")
                .attr("transform", d => `translate(${scY(d.average_location_pass_and_receipt_middle_third[1])}, ${scX(d.average_location_pass_and_receipt_middle_third[0])})`)
                .attr("id", d => d.player_name)
        playerPassingNetwork
            .append("circle")
                .attr("r", 10)
                .attr("fill", "white")
                .attr("stroke", "gray")
                .attr("stroke-width", 2)
        playerPassingNetwork
            .append('text')
                .text(d => d.jersey_number)
                .attr("fill", "black")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
    })

    // Passing Network Final Third
    for (const index in listPlayers) {
        const playerId = listPlayers[index]['player_id'];
        const playerPasses = passes_final_third.filter(pass => pass.player.id === playerId);
        const PassXTotal = playerPasses.reduce((accumulator, currentItem) => accumulator + currentItem["location"][0], 0);
        const PassYTotal = playerPasses.reduce((accumulator, currentItem) => accumulator + currentItem["location"][1], 0);
        const AverageXLocation = PassXTotal / playerPasses.length;
        const AverageYLocation = PassYTotal / playerPasses.length;
        listPlayers[index]["average_passing_location_final_third"] = [AverageXLocation, AverageYLocation];

        const playerReceiptPass = passes_final_third.filter(pass => ('recipient' in pass.pass && pass.pass.recipient.id === playerId));
        const ReceiptXTotal = playerReceiptPass.reduce((accumulator, currentItem) => accumulator + currentItem["pass"]["end_location"][0], 0);
        const ReceiptYTotal = playerReceiptPass.reduce((accumulator, currentItem) => accumulator + currentItem["pass"]["end_location"][1], 0);
        const AverageXReceiptLocation = ReceiptXTotal / playerReceiptPass.length;
        const AverageYReceiptLocation = ReceiptYTotal / playerReceiptPass.length;
        listPlayers[index]["average_receipt_pass_location_final_third"] = [AverageXReceiptLocation, AverageYReceiptLocation];

        const averageLocationX = (PassXTotal + ReceiptXTotal) / (playerPasses.length + playerReceiptPass.length);
        const averageLocationY = (PassYTotal + ReceiptYTotal) / (playerPasses.length + playerReceiptPass.length);
        listPlayers[index]["average_location_pass_and_receipt_final_third"] = [averageLocationX, averageLocationY];
        
        // Passing Connection
        const passingConnection = []
        for (const index in listPlayers) {
            const playerIdConnection = listPlayers[index]["player_id"];
            const playerNameConnection = listPlayers[index]["player_name"];
            const passesToConnection = playerPasses.filter(pass => 'recipient' in pass.pass &&  pass.pass.recipient.id === playerIdConnection);
            passingConnection.push({
                "player": {"id": playerIdConnection, "name": playerNameConnection},
                "number_passes": passesToConnection.length
            });
        }
        listPlayers[index]["passing_connection_final_third"] = passingConnection;
    }

    const passingNetworkFinalThird = useRef();
    useEffect(() => {
        const svg = d3.select(passingNetworkFinalThird.current)
        svg.selectAll("*").remove()
        // Make Pitch
        const id = 'passingNetwork';
        const width = 400
        const pitchProps = {
            svgRef: passingNetworkFinalThird,
            width: width,
            margin: width/40,
            pitch_dimension: 'statsbomb',
            background: 'white',
            line_color: 'grey'
        };
        VerticalPitch(pitchProps)

        const dimensions = require('../../data/dimensions.json')
        const dimension = dimensions["statsbomb"]
        const height = width * dimension.length/dimension.width*dimension.aspect
        var scX = d3.scaleLinear().domain([0, dimension.length]).range([ height - 2*pitchProps["margin"], 0 ])
        var scY = dimension.invert_y
                    ? d3.scaleLinear().domain([0, dimension.width]).range([ 0, width - 2*pitchProps["margin"] ])
                    : d3.scaleLinear().domain([dimension.width, 0]).range([ 0, width - 2*pitchProps["margin"] ])

        const passingNetworkSvg = svg.append("g").attr("class", "passing-network")

        const linePassingNetwork = passingNetworkSvg
            .append("g")
                .attr("class", "line-passing-network")
        for (const index in listPlayers) {
            const player = listPlayers[index]
            for (const connectionIndex in listPlayers[index]["passing_connection_final_third"]) {
                const playerPassConnection = listPlayers.find(player => player.player_id === listPlayers[index]["passing_connection_final_third"][connectionIndex]["player"]["id"]);;
                const numberPasses = listPlayers[index]["passing_connection_final_third"][connectionIndex]["number_passes"];
                if (numberPasses > 0) {
                    const playerGroup = passingNetworkSvg.select(`[id='${player.player_name}'`)
                    linePassingNetwork
                        .append("path")
                            .attr("d",
                                `M${scY(player["average_location_pass_and_receipt_final_third"][1])} ${scX(player["average_location_pass_and_receipt_final_third"][0])}
                                L ${scY(playerPassConnection["average_location_pass_and_receipt_final_third"][1])} ${scX(playerPassConnection["average_location_pass_and_receipt_final_third"][0])}`)
                            .attr("stroke", "red")
                            .attr("stroke-width", numberPasses > 12 ? 6 : numberPasses/12 * 6)
                            .attr("opacity", numberPasses > 12 ? 1 : numberPasses/12)
                }
            }
        }

        const playerPassingNetwork = passingNetworkSvg.append("g").attr("class", "player-passing-network")
            .selectAll("g")
            .data(listPlayers)
            .join("g")
                .attr("transform", d => `translate(${scY(d.average_location_pass_and_receipt_final_third[1])}, ${scX(d.average_location_pass_and_receipt_final_third[0])})`)
                .attr("id", d => d.player_name)
        playerPassingNetwork
            .append("circle")
                .attr("r", 10)
                .attr("fill", "white")
                .attr("stroke", "gray")
                .attr("stroke-width", 2)
        playerPassingNetwork
            .append('text')
                .text(d => d.jersey_number)
                .attr("fill", "black")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
    })

    // const xScale = d3.scaleBand()
    //     .domain([0, 1, 2])
    //     .range([0, 500])
    // console.log(xScale(0)); // Outputs the starting position of 'A'
    // console.log(xScale(1)); // Outputs the starting position of 'B'
    // console.log(xScale(2));
    // console.log(Array(10).fill().map(function(element, index) {
    //     return {"a": index}
    // }))
    // console.log(Array.from({length:5}, (value, index) => index))
    // console.log(xScale.bandwidth())


    // Passes Heatmaps
    const [passesHeatmapsHomeAway, setPassesHeatmapsHomeAway] = useState('home')
    const passesHeatmaps = passesHeatmapsHomeAway === 'home' ? passes.filter(d => d.team.name === homeTeam) : passes.filter(d => d.team.name === awayTeam);
    const heatmapsRef = useRef();
    useEffect(() => {
        const svg = d3.select(heatmapsRef.current)
        svg.selectAll("*").remove()
        // Make Pitch
        const id = 'heatmaps';
        const width = 700
        const pitchProps = {
            svgRef: heatmapsRef,
            width: width,
            margin: width/40,
            pitch_dimension: 'statsbomb',
            background: 'white',
            line_color: 'grey'
        };

        const dimensions = require('../../data/dimensions.json');
        const dimension = dimensions["statsbomb"];
        const height = width * dimension.width/dimension.length*dimension.aspect;
        const innerWidth = width - 2*pitchProps["margin"];
        const innerHeight = height - 2*pitchProps["margin"];
        var scX = d3.scaleLinear().domain([0, dimension.length]).range([ 0, innerWidth ])
        var scY = dimension.invert_y
                    ? d3.scaleLinear().domain([0, dimension.width]).range([ 0, innerHeight ])
                    : d3.scaleLinear().domain([dimension.width, 0]).range([ 0, innerHeight ])
        
        function generateArray(start, stop, length) {
            const step = (stop - start) / (length - 1);
            return Array.from({ length }, (_, i) => start + i * step);
        }
        const xBins = d3.histogram()
            .value(d => d["location"][0])
            .domain([0, dimension.length])
            .thresholds(generateArray(0, dimension.length + 0.1, 7))
            (passesHeatmaps);
        
        xBins.forEach(bin => {
            bin.yBins = d3.histogram()
                .value(d => d.location[1]) // Use the y-coordinate
                .domain(scY.domain())
                .thresholds(generateArray(0, dimension.width + 0.1, 7)) // Number of bins
                (bin);
        });

        const heatmapsData = []
        xBins.forEach(xBin => {
            xBin.yBins.forEach(yBin => {
                const filteredData = Object.keys(yBin)
                    .filter(key => !isNaN(key))
                    .reduce((obj, key) => {
                        obj[key] = yBin[key];
                        return obj;
                    }, []);

                if (yBin.length > 0) {
                    const xTotal = filteredData.reduce((accumulator, currentItem) => accumulator + currentItem["pass"]["end_location"][0], 0);
                    const yTotal = filteredData.reduce((accumulator, currentItem) => accumulator + currentItem["pass"]["end_location"][1], 0);
                    const averageX = xTotal / yBin.length;
                    const averageY = yTotal / yBin.length;
                    heatmapsData.push({
                        x0: xBin.x0,
                        x1: xBin.x1,
                        y0: yBin.x0,
                        y1: yBin.x1,
                        count: yBin.length,
                        averageX: averageX,
                        averageY: averageY
                    });
                } else {
                    heatmapsData.push({
                        x0: xBin.x0,
                        x1: xBin.x1,
                        y0: yBin.x0,
                        y1: yBin.x1,
                        count: yBin.length,
                        averageX: undefined,
                        averageY: undefined
                    });
                }
            });
        });

        console.log(passes)
        const colorScale = d3.scaleSequential(d3.interpolateRgb("white", "red"))
            .domain([0, d3.max(heatmapsData, d => d.count)]);

        const heatmapsSvg = svg.append("g").attr("class", "heatmaps").attr("transform", `translate(${pitchProps.margin}, ${pitchProps.margin})`)

        heatmapsSvg.append("g")
            .selectAll("rect")
            .data(heatmapsData)
            .join("rect")
                .attr("x", d => scX(d.x0))
                .attr("y", d => scY(d.y0))
                .attr("width", d => scX(d.x1 - d.x0))
                .attr("height", d => scY(d.y1 - d.y0))
                .attr("fill", d => colorScale(d.count))
                .attr("opacity", 0.8);
        const heatmapsBin = heatmapsSvg.append("g").selectAll("g")
            .data(heatmapsData)
            .join("g")
        heatmapsBin
            .append("path")
                .attr("d", d => 
                    `M${scX(d.x0 + ((d.x1-d.x0)/2))} ${scY(d.y0 + (d.y1-d.y0)/2)}
                    ${d.averageX !== undefined ? 'L' + scX(d.averageX) + ' ' + scY(d.averageY) : ''}`)
                .attr("stroke", "black")
                .attr("stroke-width", 1)

        var arrowLength = 1;
            function angle(x1, y1, x2, y2) {
                var dx = x2 - x1;
                var dy = y2 - y1;
                var angle = Math.atan2(dy, dx)
                var baseLeftX = x2 - arrowLength * Math.cos(angle - Math.PI / 6)
                var baseLeftY = y2 - arrowLength * Math.sin(angle - Math.PI / 6)
                var baseRightX = x2 - arrowLength * Math.cos(angle + Math.PI / 6)
                var baseRightY = y2 - arrowLength * Math.sin(angle + Math.PI / 6)
                
                return ({
                    'baseLeftX': baseLeftX,
                    'baseLeftY': baseLeftY,
                    'baseRightX': baseRightX,
                    'baseRightY': baseRightY
                })
            }
        
        heatmapsBin
            .append("path")
                .attr( 'd', d => {
                    const startX = d.x0 + (d.x1-d.x0)/2;
                    const startY = d.y0 + (d.y1-d.y0)/2;
                    const endX = d.averageX;
                    const endY = d.averageY;
                    const baseLeftX = angle(startX, startY, endX, endY)['baseLeftX']
                    const baseLeftY = angle(startX, startY, endX, endY)['baseLeftY']
                    const baseRightX = angle(startX, startY, endX, endY)['baseRightX']
                    const baseRightY = angle(startX, startY, endX, endY)['baseRightY']
                    return `M ${scX(endX)}, ${scY(endY)} L ${scX(baseLeftX)}, ${scY(baseLeftY)} L${scX(baseRightX)}, ${scY(baseRightY)} `
                })
                .attr("fill", "black")


        Pitch(pitchProps)
    })


    return (
        <div>
            <div className='analytics-container'>
                <div className='header'>
                    <div className='title'>Passing Network</div >
                    <div className='button-teams'>
                        <ButtonGroup>
                            <Button variant={`${homeAway === 'home' ? 'danger' : 'outline-danger'}`} onClick={() => setHomeAway("home")}>{homeTeam}</Button>
                            <Button variant={`${homeAway === 'away' ? 'danger' : 'outline-danger'}`} onClick={() => setHomeAway("away")}>{awayTeam}</Button>
                        </ButtonGroup>
                    </div>
                </div>
                <div className='passing-network-container'>
                    <div>
                        <p>Ball in First Third</p>
                        <svg ref={passingNetworkFirstThird} fill='none' className='pitch' />
                    </div>
                    <div>
                        <p>Ball in Middle Third</p>
                        <svg ref={passingNetworkMiddleThird} fill='none' className='pitch' />
                    </div>
                    <div>
                        <p>Ball in Final Third</p>
                        <svg ref={passingNetworkFinalThird} fill='none' className='pitch' />
                    </div>
                </div>
            </div>
            
            <div className='analytics-container'>
                <div className='header'>
                    <div className='title'>Passes Heatmaps</div >
                    <div className='button-teams'>
                        <ButtonGroup>
                            <Button variant={`${passesHeatmapsHomeAway   === 'home' ? 'danger' : 'outline-danger'}`} onClick={() => setPassesHeatmapsHomeAway("home")}>{homeTeam}</Button>
                            <Button variant={`${passesHeatmapsHomeAway === 'away' ? 'danger' : 'outline-danger'}`} onClick={() => setPassesHeatmapsHomeAway("away")}>{awayTeam}</Button>
                        </ButtonGroup>
                    </div>
                </div>
                <div className='heatmaps-container'>
                    <div>
                        <svg ref={heatmapsRef} fill='none' className='pitch' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Analytics