import React from "react";

class TwitterCardsMeta extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let {title, description, url, image, color} = this.props;

        title = title || "VTuber API";
        color = color || "#383838";
        url = url || "https://vtuber.ihateani.me/";

        return (
            <>
                {/* Twitter Card Meta */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:creator" content="@nao0809_" />
                <meta name="twitter:title" content={title} />
                {description && <meta property="twitter:description" content={description} />}
                {image && <meta property="twitter:image" content={image} />}
            </>
        )
    }
}

export default TwitterCardsMeta;