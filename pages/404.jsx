import React from "react";
import Head from "next/head";

class NotFoundPage extends React.Component {
    render() {
        return (
            <>
                <Head>
                    <title>404 :: VTuber API</title>
                    <link rel="preconnect" href="https://api.ihateani.me" />
                    <link rel="preconnect" href="https://i.ytimg.com" />
                </Head>
                <div className="bg-gray-900 text-white h-screen text-center w-screen flex flex-col items-center justify-center">
                    <div>
                        <h1 className="inline-block border-r border-gray-300 m-0 mr-5 py-3 pr-6 pl-0 text-2xl font-semibold align-top">404</h1>
                        <div className="inline-block text-left leading-10 h-10 align-middle items-center place-items-start justify-items-center">
                            <h2 className="text-sm font-normal mt-5 p-0 self-center place-self-center">
                                This page could not be found.
                            </h2>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default NotFoundPage;
