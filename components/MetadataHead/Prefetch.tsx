import React from "react";

export default function HeaderPrefetch() {
    return (
        <>
            {/* Preconnect and DNS-Prefetch */}
            <link rel="preconnect" href="https://api.ihateani.me" />
            <link rel="dns-prefetch" href="https://api.ihateani.me" />
            {/* Youtube */}
            <link rel="preconnect" href="https://yt3.ggpht.com" />
            <link rel="dns-prefetch" href="https://yt3.ggpht.com" />
            <link rel="preconnect" href="https://i.ytimg.com" />
            <link rel="dns-prefetch" href="https://i.ytimg.com" />
            {/* Twitch */}
            <link rel="preconnect" href="https://ttvthumb.glitch.me" />
            <link rel="dns-prefetch" href="https://ttvthumb.glitch.me" />
            <link rel="preconnect" href="https://static-cdn.jtvnw.net" />
            <link rel="dns-prefetch" href="https://static-cdn.jtvnw.net" />
            {/* Twitcasting */}
            <link rel="preconnect" href="https://imagegw01.twitcasting.tv" />
            <link rel="dns-prefetch" href="https://imagegw01.twitcasting.tv" />
            <link rel="preconnect" href="https://imagegw02.twitcasting.tv" />
            <link rel="dns-prefetch" href="https://imagegw02.twitcasting.tv" />
            <link rel="preconnect" href="https://imagegw03.twitcasting.tv" />
            <link rel="dns-prefetch" href="https://imagegw03.twitcasting.tv" />
            <link rel="preconnect" href="https://apiv2.twitcasting.tv" />
            <link rel="dns-prefetc" href="https://apiv2.twitcasting.tv" />
            {/* Mildom */}
            <link rel="preconnect" href="https://isscdn.mildom.tv" />
            <link rel="dns-prefetch" href="https://isscdn.mildom.tv" />
            <link rel="preconnect" href="https://vpic.mildom.com" />
            <link rel="dns-prefetch" href="https://vpic.mildom.com" />
        </>
    );
}
