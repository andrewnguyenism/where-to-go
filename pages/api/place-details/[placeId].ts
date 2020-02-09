import { NowRequest, NowResponse } from "@now/node";
import * as Foursquare from "../../../src/services/foursquare";

export default async (req: NowRequest, res: NowResponse) => {
    const detailedVenue = await Foursquare.venues.details(String(req.query.placeId));
    res.json(detailedVenue);
};
