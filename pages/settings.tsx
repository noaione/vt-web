import Head from "next/head";
import React from "react";

import MetadataHead from "../components/MetadataHead";
import Navbar from "../components/Navbar";

import SettingsComponent from "../components/SettingsComponents";

export default function SettingsPage() {
    const commit = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "(Dev Mode)";

    const extraConfig = commit !== "(Dev Mode)" ? { rel: "noreferrer noopener", target: "_blank" } : {};

    return (
        <>
            <Head>
                <MetadataHead.Base />
                <title>Settings :: VTuber API</title>
                <MetadataHead.SEO title="Settings" urlPath="/settings" />
            </Head>
            <Navbar mode="settings" />
            <main className="antialiased h-full pb-4 mx-4 mt-6 flex flex-col">
                <h2 className="text-3xl text-white font-bold m-2">Settings</h2>
                <SettingsComponent.Timezone />
                <SettingsComponent.FreeChat />
                <SettingsComponent.Excluder />
                <SettingsComponent.Platform />
                <SettingsComponent.LivesSort />
            </main>
            <footer className="mx-4 border-t-2 border-gray-600">
                <div className="mx-2 flex flex-col mt-4">
                    <div>This project is made by N4O#8868</div>
                    <div>
                        Source code:{" "}
                        <a
                            className="text-blue-400 hover:text-blue-500 hover:underline transition duration-150"
                            href="https://github.com/noaione/vt-web"
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            https://github.com/noaione/vt-web
                        </a>
                    </div>
                    <div>
                        It utilize the{" "}
                        <a
                            className="text-blue-400 hover:text-blue-500 hover:underline transition duration-150"
                            href="https://api.ihateani.me/v2"
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            ihateani.me API
                        </a>{" "}
                        for the VTuber API data, and use Next.JS for the website itself.
                    </div>
                </div>
                {commit && (
                    <div className="ml-2 flex flex-row gap-1 mt-2 text-sm text-gray-400">
                        <span>Commit:</span>
                        <a
                            className="text-blue-400 hover:text-blue-500 hover:underline transition duration-150"
                            href={
                                commit === "(Dev Mode)"
                                    ? "#"
                                    : `https://github.com/noaione/vt-web/commit/${commit}`
                            }
                            {...extraConfig}
                        >
                            {commit === "(Dev Mode)" ? commit : commit.slice(0, 7)}
                        </a>
                    </div>
                )}
            </footer>
        </>
    );
}
