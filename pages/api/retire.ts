import { NextApiResponse } from "next";
import fetcher from "../../lib/fetcher";

import withSession, { NextApiRequestWithSession, SimpleUser } from "../../lib/session";

const MutationQuery = `mutation VTuberRetire($id:String!,$platform:PlatformName!,$retire:Boolean) {
    VTuberRetired(id:$id,platform:$platform,retire:$retire) {
        id
        is_retired
    }
}
`;

export default withSession(async (req: NextApiRequestWithSession, res: NextApiResponse) => {
    const user = req.session.get<SimpleUser>("user");
    const data = await req.body;
    if (user) {
        try {
            const GQLRequest = {
                query: MutationQuery,
                operationName: "VTuberRetire",
                variables: {
                    id: data.id,
                    platform: data.platform,
                    retire: data.retire,
                },
            };
            const requested = await fetcher("https://api.ihateani.me/v2/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `password ${process.env.IHAAPI_PASSWORD ?? ""}`,
                },
                body: JSON.stringify(GQLRequest),
            });
            res.json(requested);
        } catch (e) {
            res.status(e.httpCode).json(e.data);
        }
    } else {
        res.status(401).json({
            message: "Unauthorized!",
        });
    }
});
