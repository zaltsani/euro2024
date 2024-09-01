import React from "react";
import NavigationBar from "./NavigationBar";

function Layout(props) {
    return (
        <div>
            <NavigationBar />
            <div>{ props.children }</div>
        </div>
    );
}

export default Layout;