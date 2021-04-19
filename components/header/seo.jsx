import React from "react";

import OpenGraphMeta from "./ogmeta";
import TwitterCardsMeta from "./twcard";

class SEOMetaTags extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let {description} = this.props;

        const { url, image, color } = this.props;
        let titleReal = this.props.title;
        titleReal = titleReal || "Home";
        let copyDesc = description;
        copyDesc = copyDesc || "A Frontend for ihateani.me VTuber API";

        return (
            <>
                {copyDesc && <meta name="description" content={copyDesc} />}

                <OpenGraphMeta title={titleReal} description={copyDesc} url={url} image={image} color={color} />
                <TwitterCardsMeta title={titleReal} description={copyDesc} url={url} image={image} color={color} />
            </>
        )
    }
}

export default SEOMetaTags;