import React from "react";
import NavigationBar from "./NavigationBar";
import Footer from "./Footer";

function Layout(props) {
    return (
        <div>
            <NavigationBar />
                <div>{ props.children }</div>
            <Footer />
        </div>
    );
}

export default Layout;