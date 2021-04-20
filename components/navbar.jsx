import React from "react";
import Link from "next/link";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faCog, faSignInAlt, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

class Navbar extends React.Component {

    constructor(props) {
        super(props);

        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.state = {
            active: false,
        }
    }

    toggleDropdown() {
        this.setState({active: !this.state.active});
    }

    render() {
        let {mode, noSticky} = this.props;
        let homeUrl = "#";
        let livesUrl = "#";
        let scheduleUrl = "#";
        let loginUrl = "#";
        let settingsUrl = "#";

        let stickyModel = "sticky top-0 z-10";
        if (noSticky) {
            stickyModel = "";
        }

        if (mode === "lives") {
            homeUrl = "/";
            scheduleUrl = "/schedules";
            loginUrl = "/login";
            settingsUrl = "/settings";
        } else if (mode === "schedules") {
            homeUrl = "/";
            livesUrl = "/lives";
            loginUrl = "/login";
            settingsUrl = "/settings";
        } else if (mode === "settings") {
            homeUrl = "/";
            livesUrl = "/lives";
            scheduleUrl = "/schedules";
            loginUrl = "/login";
        } else if (mode === "admin") {
            homeUrl = "/";
            livesUrl = "/lives";
            scheduleUrl = "/schedules";
            loginUrl = "/api/logout";
            settingsUrl = "/settings";
        } else if (mode === "channel") {
            homeUrl = "/";
            livesUrl = "/lives";
            scheduleUrl = "/schedules";
            loginUrl = "/login";
            settingsUrl = "/settings";
        } else {
            livesUrl = "/lives";
            scheduleUrl = "/schedules";
            loginUrl = "/login";
            settingsUrl = "/settings";
        }

        let extraClass = "hidden";
        if (this.state.active) {
            extraClass = "";
        }

        return (
            <header className={"bg-gray-700 " + stickyModel}>
                <nav className="relative select-none bg-grey lg:flex lg:items-stretch w-full py-3">
                    <div className="w-full relative flex justify-between lg:w-auto pr-4 lg:static lg:block lg:justify-start">
                        <div className="flex flex-row items-center ml-4 mt-2">
                            <a href="/" className="font-semibold text-xl tracking-tight ml-2 text-white hover:opacity-80">VTuber API</a>
                        </div>
                        <button onClick={this.toggleDropdown} className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none" type="button">
                            <span className="block relative w-6 h-px rounded-sm bg-white"></span>
                            <span className="block relative w-6 h-px rounded-sm bg-white mt-1"></span>
                            <span className="block relative w-6 h-px rounded-sm bg-white mt-1"></span>
                        </button>
                    </div>
                    <div className={extraClass + " mt-4 lg:mt-0 lg:flex lg:items-stretch lg:flex-no-shrink lg:flex-grow"}>
                        <div className="lg:flex lg:items-stretch lg:justify-end ml-auto mr-4">
                            <a href={homeUrl} className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75">
                                Home
                            </a>
                            <a href={livesUrl} className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75">
                                Lives
                            </a>
                            <a href={scheduleUrl} className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75">
                                Schedules
                            </a>
                            <a href={settingsUrl} className="px-3 py-2 h-10 w-10 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75">
                                <FontAwesomeIcon icon={faCog} />
                            </a>
                            <a href={loginUrl} className="px-3 py-2 flex h-10 w-10 items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75">
                                {mode === "admin" ?
                                    <FontAwesomeIcon icon={faSignOutAlt} />
                                    :
                                    <FontAwesomeIcon icon={faSignInAlt} />
                                }
                            </a>
                        </div>
                    </div>
                </nav>
            </header>
        )
    }
}

export default Navbar;
