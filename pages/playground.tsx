import React from "react";
import Head from "next/head";

import { GraphiQL } from "graphiql";
import { createGraphiQLFetcher } from "@graphiql/toolkit";
import MetadataHead from "../components/MetadataHead";

const URL = `https://api.ihateani.me/v2/graphql`;

const defaultQuery = `
query VTuberLive($cursor:String) {
    vtuber {
        live(limit:10,cursor:$cursor) {
            _total
            items {
                id
                title
                group
                platform
            }
            pageInfo {
                hasNextPage
                nextCursor
            }
        }
    }
}
`;

interface GQLPlaygroundState {
    fetcher: ReturnType<typeof createGraphiQLFetcher> | null;
}

class GraphQLPlayground extends React.Component<{}, GQLPlaygroundState> {
    constructor(props) {
        super(props);
        this.state = {
            fetcher: null,
        };
    }

    componentDidMount() {
        const fetcher = createGraphiQLFetcher({
            url: URL,
        });
        this.setState({ fetcher });
    }

    render() {
        return (
            <>
                <Head>
                    <MetadataHead.Base />
                    <title>GraphQL Playground</title>
                    <MetadataHead.SEO
                        title="GraphQL Playground"
                        description="Play around with the VTAPI here"
                        urlPath="/playground"
                    />
                    <link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />
                    <link
                        href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.23.0/theme/dracula.css"
                        rel="stylesheet"
                    />
                </Head>
                <main className="h-screen">
                    {this.state.fetcher !== null && (
                        <GraphiQL
                            fetcher={this.state.fetcher}
                            defaultQuery={defaultQuery}
                            editorTheme="dracula"
                        />
                    )}
                </main>
            </>
        );
    }
}

export default GraphQLPlayground;
