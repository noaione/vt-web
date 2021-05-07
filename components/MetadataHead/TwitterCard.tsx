import React from "react";

interface TwitterCardProps {
    image?: string;
    title: string;
    description: string;
}

class TwitterCardsMeta extends React.Component<TwitterCardProps> {
    constructor(props) {
        super(props);
    }

    render() {
        let {title, description, image} = this.props;

        title = title || "VTuber API";

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