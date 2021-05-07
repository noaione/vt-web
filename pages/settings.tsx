import Head from "next/head";
import React from "react";

import MetadataHead from "../components/MetadataHead";
import Navbar from "../components/Navbar";

import TimezoneSettings from "../components/SettingsPage/Timezone";

export default function SettingsPage() {
    return (
        <>
            <Head>
                <MetadataHead.Base />
                <title>Settings :: VTuber API</title>
                <MetadataHead.SEO title="Settings" urlPath="/settings" />
            </Head>
            <Navbar mode="settings" />
            <main className="antialiased h-full pb-4 mx-4 mt-6">
                <h2 className="text-3xl text-white font-bold m-2">Settings</h2>
                <TimezoneSettings />
            </main>
        </>
    );
}
