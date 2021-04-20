import Head from "next/head";
import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic'

import { DateTime } from "luxon";

import Navbar from "../components/navbar";

import SEOMetaTags from "../components/header/seo";
import HeaderDefault from "../components/header/head";
import HeaderPrefetch from "../components/header/prefetch";

const TZ_LIST = [
    <option value="UTC-12:00">UTC-12:00</option>,
    <option value="UTC-11:00">UTC-11:00</option>,
    <option value="UTC-10:00">UTC-10:00</option>,
    <option value="UTC-09:30">UTC-09:30</option>,
    <option value="UTC-09:00">UTC-09:00</option>,
    <option value="UTC-08:00">UTC-08:00</option>,
    <option value="UTC-07:00">UTC-07:00</option>,
    <option value="UTC-06:00">UTC-06:00</option>,
    <option value="UTC-05:00">UTC-05:00</option>,
    <option value="UTC-04:00">UTC-04:00</option>,
    <option value="UTC-03:00">UTC-03:00</option>,
    <option value="UTC-03:30">UTC-03:30</option>,
    <option value="UTC-02:00">UTC-02:00</option>,
    <option value="UTC-01:00">UTC-01:00</option>,
    <option value="UTC+00:00">UTC+00:00</option>,
    <option value="UTC+01:00">UTC+01:00</option>,
    <option value="UTC+02:00">UTC+02:00</option>,
    <option value="UTC+03:00">UTC+03:00</option>,
    <option value="UTC+03:30">UTC+03:30</option>,
    <option value="UTC+04:00">UTC+04:00</option>,
    <option value="UTC+04:30">UTC+04:30</option>,
    <option value="UTC+05:00">UTC+05:00</option>,
    <option value="UTC+05:30">UTC+05:30</option>,
    <option value="UTC+05:45">UTC+05:45</option>,
    <option value="UTC+06:00">UTC+06:00</option>,
    <option value="UTC+06:30">UTC+06:30</option>,
    <option value="UTC+07:00">UTC+07:00</option>,
    <option value="UTC+08:00">UTC+08:00</option>,
    <option value="UTC+08:00">UTC+08:45</option>,
    <option value="UTC+09:00">UTC+09:00</option>,
    <option value="UTC+09:30">UTC+09:30</option>,
    <option value="UTC+10:00">UTC+10:00</option>,
    <option value="UTC+10:30">UTC+10:30</option>,
    <option value="UTC+11:00">UTC+11:00</option>,
    <option value="UTC+12:00">UTC+12:00</option>,
    <option value="UTC+12:45">UTC+12:45</option>,
    <option value="UTC+13:00">UTC+13:00</option>,
    <option value="UTC+14:00">UTC+14:00</option>,
]


function getPreferedTimezone(localStorage) {
    const DEFAULTS = "UTC" + DateTime.local().toFormat("ZZ");
    const prefer = localStorage.getItem("vtapi-offsetLoc");
    if (typeof prefer === "undefined" || prefer === null) {
        localStorage.setItem("vtapi-offsetLoc", DEFAULTS);
        return DEFAULTS;
    }
    return prefer;
}


class TimezoneSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selTZ: "UTC+09:00",
        }
    }

    componentDidMount() {
        this.setState({selTZ: getPreferedTimezone(localStorage)});
    }

    componentDidUpdate() {
        localStorage.setItem("vtapi-offsetLoc", this.state.selTZ);
    }

    render() {
        return (
            <>
                <h4 className="text-lg ml-2">Timezone/Offset</h4>
                <div>
                    <select className="form-select ml-2 w-full md:w-1/2 lg:w-1/3 mt-2 bg-gray-700" value={this.state.selTZ} onChange={(e) => this.setState({selTZ: e.target.value})} aria-label="timezone">
                        {TZ_LIST.map((res) => {
                            return res;
                        })}
                    </select>
                </div>
            </>
        )
    }
}

function SettingsPage() {

    return (
        <>
            <Head>
                <HeaderDefault />
                <title>Settings :: VTuber API</title>
                <SEOMetaTags title="Settings" url="https://vtuber.ihateani.me/settings" />
            </Head>
            <Navbar mode="settings" />
            <main className="antialiased h-full pb-4 mx-4 mt-6">
                <h2 className="text-3xl text-white font-bold m-2">
                    Settings
                </h2>
                <TimezoneSettings key="tzOffset" />
            </main>
        </>
    )
}

export default SettingsPage;
