import React from "react";
import NavigationBar from "./Navbar";

function Layout(props) {
    return (
        <div>
            <NavigationBar />
            <div>{ props.children }</div>
        </div>
    );
}

export default Layout;