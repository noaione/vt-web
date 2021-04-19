import _ from "lodash";
import React from "react";
import Head from "next/head";
import { useRouter, withRouter } from "next/router";

import CountUp from 'react-countup';

import NotFoundPage from "../404";
import { GROUPS_NAME_MAP } from "../../lib/vt";

import Navbar from "../../components/navbar";

import SEOMetaTags from "../../components/header/seo";
import HeaderDefault from "../../components/header/head";
import HeaderPrefetch from "../../components/header/prefetch";
import { route } from "next/dist/next-server/server/router";

function capitalizeLetters(text) {
    return text.slice(0).toUpperCase() + text.slice(1);
}

const QueryChannel = `
query VTuberChannelHistory($chId:[ID],$platf:PlatformName) {
    vtuber {
        channels(id:$chId,limit:1,platforms:[$platf]) {
            items {
                id
                name
                en_name
                image
                group
                platform
                statistics {
                    subscriberCount
                    viewCount
                }
                history {
                    viewsCount {
                        data
                        time
                    }
                    subscribersCount {
                        data
                        time
                    }
                }
                publishedAt
            }
        }
    }
}
`

function selectBorderColor(platform) {
    switch (platform) {
        case "youtube":
            return "border-youtube";
        case "bilibili":
            return "border-bili2";
        case "twitch":
            return "border-twitch";
        case "twitcasting":
            return "border-twcast";
        case "mildom":
            return "border-mildom";
        default:
            return "border-gray-300";
    }
}

function isType(data, type) {
    return typeof data === type;
}

function isNone(data) {
    return typeof data === "undefined" || data === null;
}

function walk(data, note) {
    const nots = note.split(".");
    for (let i = 0; i < nots.length; i++) {
        if (isNone(data)) {
            break;
        }
        const n = nots[i];
        data = data[n];
    }
    return data;
}

async function QueryFetch(channelId, platform) {
    let apiRes = await fetch("https://api.ihateani.me/v2/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            query: QueryChannel,
            variables: {
                chId: channelId,
                platf: platform
            }
        })
    }).then((res) => res.json());
    return apiRes;
}

function platformToShortCode(platform) {
    let shortCode;
    switch (platform) {
        case "youtube":
            shortCode = "yt";
            break;
        case "bilibili":
            shortCode = "b2";
            break;
        case "twitch":
            shortCode = "ttv";
            break;
        case "twitcasting":
            shortCode = "twcast";
            break;
        case "mildom":
            shortCode = "md";
            break;
        default:
            shortCode = "unk";
            break;
    }
    return shortCode;
}

const outQuinticEasing = function (t, b, c, d) {
    let ts = (t /= d) * t;
    let tc = ts * t;
    return b + c * (tc * ts + -5 * ts * ts + 10 * tc + -10 * ts + 5 * t);
}

class ChannelPageInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            data: {},
        }
    }

    componentDidMount() {
        const { channelId, platform } = this.props;
        QueryFetch(channelId, platform).then((res) => {
            const data = walk(res, "data.vtuber.channels.items");
            if (Array.isArray(data) && data.length > 0) {
                console.info("fetched", data[0]);
                this.setState({isLoading: false, data: data[0]});
            } else {
                this.setState({isLoading: false});
            }
        }).catch((err) => {
            this.setState({isLoading: false});
        })
    }

    render() {
        const { isLoading, data } = this.state;
        const { channelId, platform } = this.props;

        if (isLoading) {
            return (
                <>
                    <Head>
                        <HeaderDefault />
                        <title>{channelId} :: VTuber API</title>
                        <SEOMetaTags title={channelId} description={"Channel Information for " + channelId} />
                        <HeaderPrefetch />
                    </Head>
                    <main className="antialiased h-full pb-4 mx-4 mt-6"></main>
                </>
            )
        } else if (!isLoading && Object.keys(data).length < 1) {
            return <NotFoundPage />;
        } else {
            const {id, name, en_name, image, group, statistics, history, publishedAt} = data;
            let { subscriberCount, viewCount } = statistics;
            subscriberCount = subscriberCount || 0;
            viewCount = viewCount || 0;
            const niceName = en_name || name;
            const borderName = "border-4 " + selectBorderColor(platform);
            let ihaIco = platform;
            if (ihaIco === "mildom") {
                ihaIco += "_simple";
            }
            const orgzName = _.get(GROUPS_NAME_MAP, group, capitalizeLetters(group));
            return (
                <>
                    <Head>
                        <HeaderDefault />
                        <title>{niceName} :: VTuber API</title>
                        <SEOMetaTags title={niceName} url={`/channel/${platformToShortCode(platform)}-${id}`} image={image} description={"Channel Information for " + niceName} />
                        <HeaderPrefetch />
                    </Head>
                    <Navbar mode="channel" />
                    <main className="antialiased h-full pb-4 mx-4 mt-6 px-4">
                        <div className="flex flex-col mx-auto text-center justify-center">
                            <img className={"rounded-full mx-auto h-64 " + borderName} src={image} />
                            <h2 className="text-xl font-bold text-white mt-3">
                                <i className={"mr-2 ihaicon ihaico-" + ihaIco}></i>
                                {niceName}
                            </h2>
                            <h5 className="text-gray-400">
                                {name}
                            </h5>
                            <h6 className="text-gray-400 font-light">
                                Organization: {orgzName}
                            </h6>
                        </div>
                        <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-4 text-center">
                            <div className="col-span-1 text-white">
                                Subscribers:
                                <CountUp
                                    className="font-bold ml-2"
                                    duration={5}
                                    useEasing
                                    easingFn={outQuinticEasing}
                                    suffix=" Subs"
                                    start={0}
                                    formattingFn={(val) => val.toLocaleString()}
                                    end={subscriberCount}
                                />
                            </div>
                            <div className="col-span-1 text-white">
                                Views:
                                <CountUp
                                    className="font-bold ml-2"
                                    duration={5}
                                    useEasing
                                    easingFn={outQuinticEasing}
                                    suffix=" Views"
                                    start={0}
                                    formattingFn={(val) => val.toLocaleString()}
                                    end={viewCount}
                                />
                            </div>
                        </div>
                        <hr className="mt-4" />
                        <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 justify-center">
                            
                        </div>
                    </main>
                </>
            )
        }
    }
}

function shortCodeToPlatform(shortCode) {
    switch (shortCode) {
        case "yt":
            return "youtube";
        case "b2":
            return "bilibili";
        case "ttv":
            return "twitch";
        case "twcast":
            return "twitcasting";
        case "md":
            return "mildom";
        default:
            return null;
    }
}

const ChannelPageRouteDynamic = () => {
    const router = useRouter();
    const { chid } = router.query;
    console.info(router);
    try {
        const [ shortCode, channelId ] = chid.split("-");
        const platform = shortCodeToPlatform(shortCode);
        if (platform === null) {
            return <NotFoundPage />
        }
        if (isType(channelId, "string") && isType(shortCode, "string")) {
            return <ChannelPageInfo platform={platform} channelId={channelId} />
        }
        return <NotFoundPage />
    } catch (e) {
        return (
            <>
                <Head>
                    <HeaderDefault />
                    <title>Channel Page :: VTuber API</title>
                    <SEOMetaTags title="Channel Page" description="An information and statistics about a VTuber channel" />
                    <HeaderPrefetch />
                </Head>
                <main className="antialiased h-full pb-4 mx-4 mt-6"></main>
            </>
        )
    }

}

export default ChannelPageRouteDynamic;
