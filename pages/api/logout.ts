import { NextApiResponse } from "next";

import withSession, { NextApiRequestWithSession } from "../../lib/session";

export default withSession(async (req: NextApiRequestWithSession, res: NextApiResponse) => {
    await req.session.destroy();
    res.setHeader("cache-control", "no-store, max-age=0");
    res.json({ loggedIn: false });
});
