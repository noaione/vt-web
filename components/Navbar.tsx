import React from "react";
import Link from "next/link";
import Router from "next/router";

interface NavbarProps {
    mode?: "lives" | "schedules" | "videos" | "settings" | "admin" | "channel" | "video";
    noSticky?: boolean;
}

interface NavbarState {
    active: boolean;
}

class Navbar extends React.Component<NavbarProps, NavbarState> {
    constructor(props) {
        super(props);
        this.toggleDropdown = this.toggleDropdown.bind(this);

        this.state = {
            active: false,
        };
    }

    toggleDropdown() {
        this.setState((prevState) => ({ active: !prevState.active }));
    }

    async navigateLink(urlTarget: string, logOut: boolean = false) {
        if (logOut && this.props.mode === "admin") {
            await fetch("/api/logout", {
                method: "POST",
            });
            urlTarget = "/";
        }
        Router.push(urlTarget);
    }

    render() {
        const { mode, noSticky } = this.props;

        let homeUrl = "#";
        let livesUrl = "#";
        let scheduleUrl = "#";
        let loginUrl = "#";
        let settingsUrl = "#";
        let videosUrl = "#";

        let stickyModel = "sticky top-0 z-10";
        if (noSticky) {
            stickyModel = "";
        }

        if (mode === "lives") {
            homeUrl = "/";
            scheduleUrl = "/schedules";
            loginUrl = "/login";
            settingsUrl = "/settings";
            videosUrl = "/videos";
        } else if (mode === "schedules") {
            homeUrl = "/";
            livesUrl = "/lives";
            loginUrl = "/login";
            settingsUrl = "/settings";
            videosUrl = "/videos";
        } else if (mode === "settings") {
            homeUrl = "/";
            livesUrl = "/lives";
            scheduleUrl = "/schedules";
            videosUrl = "/videos";
            loginUrl = "/login";
        } else if (mode === "videos") {
            homeUrl = "/";
            livesUrl = "/lives";
            scheduleUrl = "/schedules";
            settingsUrl = "/settings";
            loginUrl = "/login";
        } else if (mode === "admin") {
            homeUrl = "/";
            livesUrl = "/lives";
            scheduleUrl = "/schedules";
            videosUrl = "/videos";
            loginUrl = "/api/logout";
            settingsUrl = "/settings";
        } else if (mode === "channel" || mode === "video") {
            homeUrl = "/";
            livesUrl = "/lives";
            scheduleUrl = "/schedules";
            videosUrl = "/videos";
            loginUrl = "/login";
            settingsUrl = "/settings";
        } else {
            livesUrl = "/lives";
            scheduleUrl = "/schedules";
            loginUrl = "/login";
            settingsUrl = "/settings";
            videosUrl = "/videos";
        }

        let extraClass = "hidden";
        if (this.state.active) {
            extraClass = "";
        }

        const outerThis = this;

        return (
            <header className={"bg-gray-700 " + stickyModel}>
                <nav className="relative select-none bg-grey lg:flex lg:items-stretch w-full py-3">
                    <div className="w-full relative flex justify-between lg:w-auto pr-4 lg:static lg:block lg:justify-start">
                        <div className="flex flex-row items-center ml-4 mt-2">
                            <Link href="/" passHref>
                                <a className="font-semibold text-xl tracking-tight ml-2 text-white hover:opacity-80">
                                    VTuber API
                                </a>
                            </Link>
                        </div>
                        <button
                            onClick={this.toggleDropdown}
                            className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
                            type="button"
                        >
                            <span className="block relative w-6 h-px rounded-sm bg-white"></span>
                            <span className="block relative w-6 h-px rounded-sm bg-white mt-1"></span>
                            <span className="block relative w-6 h-px rounded-sm bg-white mt-1"></span>
                        </button>
                    </div>

                    <div
                        className={
                            extraClass +
                            " mt-4 lg:mt-0 lg:flex lg:items-stretch lg:flex-no-shrink lg:flex-grow"
                        }
                    >
                        <div className="lg:flex lg:items-stretch lg:justify-end ml-auto mr-4">
                            <Link href={homeUrl} passHref>
                                <a
                                    className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        outerThis.navigateLink(homeUrl);
                                    }}
                                >
                                    Home
                                </a>
                            </Link>
                            <Link href={livesUrl} passHref>
                                <a
                                    className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        outerThis.navigateLink(livesUrl);
                                    }}
                                >
                                    Lives
                                </a>
                            </Link>
                            <Link href={scheduleUrl} passHref>
                                <a
                                    className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        outerThis.navigateLink(scheduleUrl);
                                    }}
                                >
                                    Schedules
                                </a>
                            </Link>
                            <Link href={videosUrl} passHref>
                                <a
                                    className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        outerThis.navigateLink(videosUrl);
                                    }}
                                >
                                    Videos
                                </a>
                            </Link>
                            <Link href={settingsUrl} passHref>
                                <a
                                    className="px-3 py-2 h-10 w-10 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        outerThis.navigateLink(settingsUrl);
                                    }}
                                >
                                    <i className="ihaicon ihaico-cog" />
                                </a>
                            </Link>
                            <Link href={loginUrl} passHref>
                                <a
                                    className="px-3 py-2 flex h-10 w-10 items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        outerThis.navigateLink(loginUrl, true);
                                    }}
                                >
                                    {mode === "admin" ? (
                                        <i className="ihaicon ihaico-exit" />
                                    ) : (
                                        <i className="ihaicon ihaico-enter" />
                                    )}
                                </a>
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>
        );
    }
}

export default Navbar;
