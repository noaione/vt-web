import { NextApiResponse } from "next";
import fetcher from "../../lib/fetcher";

import withSession, { NextApiRequestWithSession, SimpleUser } from "../../lib/session";

const MutationNote = `mutation SetNote($id:String!,$platform:PlatformName!,$note:String) {
    VTuberSetNote(id:$id,platform:$platform,newNote:$note) {
        id
        extraNote
    }
}`;

export default withSession(async (req: NextApiRequestWithSession, res: NextApiResponse) => {
    const user = req.session.get<SimpleUser>("user");
    const data = await req.body;
    if (user) {
        try {
            const GQLRequest = {
                query: MutationNote,
                operationName: "SetNote",
                variables: {
                    id: data.id,
                    platform: data.platform,
                    note: data.note,
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
