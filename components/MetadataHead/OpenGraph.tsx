import React from "react";

interface OpenGraphProps {
    image?: string;
    title: string;
    url: string;
    description: string;
}

class OpenGraphMeta extends React.Component<OpenGraphProps> {
    constructor(props) {
        super(props);
    }

    render() {
        let {title, description, url, image} = this.props;

        url = url || "https://vtuber.ihateani.me/";
        image = image || "/assets/favicon.png";

        return (
            <>
                {/* OpenGraph Meta */}
                {title && <meta property="og:title" content={title} />}
                {description && <meta property="og:description" content={description} />}
                {image && <meta property="og:image" content={image} />}
                <meta property="og:url" content={url} />
                <meta property="og:site_name" content="VTuber API" />
                <meta property="og:type" content="website" />
            </>
        )
    }
}

export default OpenGraphMeta;
