/* eslint-disable @typescript-eslint/no-this-alias */
import React from "react";
import Head from "next/head";

import LoadingBar from "react-top-loading-bar";

import ChannelsPages from "../components/ChannelsPages";
import ChannelsComponent from "../components/ChannelsComponents";
import ChannelsPagesSkeleton from "../components/ChannelsPagesSkeleton";
import { ChannelCardProps } from "../components/ChannelCard";
import MetadataHead from "../components/MetadataHead";
import Navbar from "../components/Navbar";

import { ihaAPIQuery } from "../lib/vt";
import withSession, { NextServerSideContextWithSession, SimpleUser } from "../lib/session";
import { connect, ConnectedProps } from "react-redux";

const ChannelQuerySchemas = `query VTuberChannel($cursor:String) {
    vtuber {
        channels(platforms:[youtube,twitch,twitcasting,mildom],cursor:$cursor,limit:100) {
            _total
            items {
                id
                name
                image
                platform
                group
                publishedAt
                statistics {
                    subscriberCount
                    viewCount
                }
                is_retired
                extraNote
            }
            pageInfo {
                results_per_page
                hasNextPage
                nextCursor
            }
        }
    }
}`;

async function getAllChannelsAsync(cursor = "", page = 1, cb: (current: number, total: number) => void) {
    const results = await ihaAPIQuery(ChannelQuerySchemas, cursor);
    const gqlres = results.data.vtuber;
    page++;
    // eslint-disable-next-line no-underscore-dangle
    const expectedTotal = Math.ceil(gqlres.channels._total / gqlres.channels.pageInfo.results_per_page);
    cb(page, expectedTotal);
    const mainResults = gqlres.channels.items;
    const pageData = gqlres.channels.pageInfo;
    if (pageData.hasNextPage && pageData.nextCursor) {
        return mainResults.concat(await getAllChannelsAsync(pageData.nextCursor, page, cb));
    } else {
        return mainResults;
    }
}

const mapDispatch = {
    resetState: () => ({ type: "channels/resetState" }),
    startNewData: (payload: ChannelCardProps[]) => ({ type: "channels/bulkAddChannel", payload }),
};
const connector = connect(null, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface AdminChannelsPageState {
    isLoading: boolean;
    progressBar: number;
}

class AdminChannelsPage extends React.Component<PropsFromRedux, AdminChannelsPageState> {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            progressBar: 0,
        };
    }

    async componentDidMount() {
        const selfthis = this;
        function setLoadData(current: number, total: number) {
            selfthis.setState({ progressBar: (current / total) * 100 });
        }

        const loadedData = await getAllChannelsAsync("", 1, setLoadData);
        this.props.resetState();
        this.props.startNewData(loadedData);
        this.setState({ isLoading: false });
    }

    render() {
        const { isLoading, progressBar } = this.state;

        return (
            <React.Fragment key="channelsmain-fragment">
                <Head>
                    <MetadataHead.Base />
                    <title>Home :: VTuber API</title>
                    <MetadataHead.SEO title="Home" />
                    <MetadataHead.Prefetch />
                </Head>
                <Navbar />
                <main className="antialiased h-full pb-4 mx-4 mt-6">
                    <LoadingBar
                        color="#277844"
                        progress={progressBar}
                        onLoaderFinished={() => {
                            setTimeout(() => {
                                this.setState({ progressBar: 0 });
                            }, 2500);
                        }}
                    />
                    {isLoading ? (
                        <ChannelsPagesSkeleton />
                    ) : (
                        <div className="flex flex-col">
                            <div className="my-4">
                                <ChannelsComponent.Search />
                                <ChannelsComponent.Platforms />
                            </div>
                            <ChannelsPages isAdmin />
                        </div>
                    )}
                </main>
            </React.Fragment>
        );
    }
}

export default connector(AdminChannelsPage);

export const getServerSideProps = withSession(async function ({ req }: NextServerSideContextWithSession) {
    const user = req.session.get<SimpleUser>("user");
    if (!user) {
        return {
            redirect: {
                destination: "/login",
                permanent: false,
            },
        };
    }

    return { props: {} };
});
