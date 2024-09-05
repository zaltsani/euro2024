import React, { useEffect, useRef } from 'react'
import Pitch from './Pitch';
import * as d3 from 'd3';

function Events() {
    const eventsViz = useRef();
    const id = 'chalkboard';
    const pitchProps = {
        id: id,
        width: 150,
        pitch_dimension: 'statsbomb',
        background: 'white',
        line_color: 'grey'
    };
    useEffect(() => {
        Pitch(pitchProps);
    })
    
    return (
        <div id={id}>
        </div>
  )
}

export default Events