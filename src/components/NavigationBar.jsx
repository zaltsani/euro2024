import React from 'react';
import { Navbar, Container, Row } from "react-bootstrap";
import '../styles/Navbar.css'


function NavigationBar() {
  return (
    <Navbar style={{
            background: "#D9D9D9",
            height: "81px"
          }}>
      <Container>
        <Navbar.Brand className='brand' href='/'>
          StatsFlood
        </Navbar.Brand>

      </Container>
    </Navbar>
  );
}

export default NavigationBar;