import { NextApiResponse } from "next";

import withSession, { NextApiRequestWithSession, SimpleUser } from "../../lib/session";

export default withSession(async (req: NextApiRequestWithSession, res: NextApiResponse) => {
    const user = req.session.get<SimpleUser>("user");
    if (user) {
        res.json({
            loggedIn: true,
            ...user,
        });
    } else {
        res.json({
            loggedIn: false,
        });
    }
});
