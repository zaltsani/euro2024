import React from 'react';
import '../styles/Footer.css';
import statsbombLogo from '../assets/SB - Icon Lockup - Colour positive.png';

function Footer() {
  return (
    <div className='footer align-content-center'>
        <div
        className='d-flex justify-content-center'
        style={{
            // "padding-top": "10px",
            "font-size": "30px",
            "font-weight": "bold",
        }}>
            StatsFlood
        </div>
        <div className='d-flex justify-content-center align-items-center mt-2'>
            <span>Data Provided by</span>
            <img src={statsbombLogo} height={"18px"} className='ms-2' alt='statsbomb-logo' />
        </div>
    </div>
  )
}

export default Footer