import Link from "next/link";
import React from "react";

import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import breaks from "remark-breaks";

function MarkdownLinkFormatting({ href, ...rest }: React.HTMLProps<HTMLAnchorElement>) {
    const internalLink = href && href.startsWith("/");
    if (internalLink) {
        return (
            <Link href={href} passHref>
                <a {...rest} />
            </Link>
        );
    }

    return <a href={href} {...rest} rel="noopener noreferrer" target="_blank" />;
}

export default function Markdownify(props: { children?: React.ReactNode }) {
    const { children } = props;
    if (typeof children !== "string") {
        return null;
    }

    return (
        <ReactMarkdown
            className="react-md"
            components={{
                a: ({ ...props }) => <MarkdownLinkFormatting {...props} />,
            }}
            remarkPlugins={[breaks, gfm]}
        >
            {children}
        </ReactMarkdown>
    );
}
