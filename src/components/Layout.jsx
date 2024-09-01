import React from "react";
import NavigationBar from "./NavigationBar";
// import { Navbar } from "react-bootstrap";

function Layout(props) {
    return (
        <div>
            <NavigationBar />
            {/* <Navbar></Navbar> */}
            <div>{ props.children }</div>
        </div>
    );
}

export default Layout;