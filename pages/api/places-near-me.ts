import { NowRequest, NowResponse } from "@now/node";
import * as Foursquare from "../../src/services/foursquare";

export default async (req: NowRequest, res: NowResponse) => {
  console.log(process.env);
  const data = await Foursquare.venues.explore({
    limit: 50,
    ll: `${req.query.latitude},${req.query.longitude}`,
    openNow: true,
    radius: 1500,
    section: "food"
  });
  res.json(data);
};
