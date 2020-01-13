import axios from "axios";

type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> &
      Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

interface VenueCategory {
  icon: {
    prefix: string;
    suffix: string;
  };
  id: string;
  name: string;
  pluralName: string;
  primary: boolean;
  shortName: string;
}

interface VenuePhoto {
  id: string;
  height: number;
  prefix: string;
  suffix: string;
  width: number;
}

export interface VenueLocation {
  address?: string;
  cc?: string;
  city?: string;
  country?: string;
  crossStreet?: string;
  distance?: number;
  formattedAddress: string[];
  lat?: number;
  lng?: number;
  postalCode?: string;    
  state?: string;
}

export interface BaseVenue {
  categories: VenueCategory[];
  id: string;
  location: VenueLocation;
  name: string;
}

export interface DetailedVenue extends BaseVenue {
  bestPhoto: VenuePhoto;
  canonicalUrl: string;
  rating: number;
  ratingSignals: number;
}

interface VenuesParamsBase {
  ll?: string;
  near?: string;
  llAcc?: number;
  alt?: number;
  altAcc?: number;
  radius?: number;
  query?: string;
  categoryId?: string;
  limit?: number;
}

interface VenuesRecAndExploreFilters {
  offset?: number;
  openNow?: boolean;
  sortByDistance?: boolean;
}

interface VenuesExploreBaseParams
  extends VenuesParamsBase,
    VenuesRecAndExploreFilters {
  section?:
    | "food"
    | "drinks"
    | "coffee"
    | "shops"
    | "arts"
    | "outdoors"
    | "sights"
    | "trending"
    | "nextVenues"
    | "topPicks";
  novelty?: "new" | "old";
  friendVisits?: "visited" | "notvisited";
  time?: "any";
  day?: "any";
  lastVenue?: string;
  sortByPopularity?: boolean;
  price?: number;
  saved?: boolean;
}

type VenuesExploreParams = RequireOnlyOne<
  VenuesExploreBaseParams,
  "ll" | "near"
>;

async function makeFoursquareRequest(
  url: string,
  params: { [key: string]: string | number } = {},
) {
  try {
    const { data: { response } } = await axios.get(
      `https://api.foursquare.com/v2${url}`, 
      { 
        params: {
          ...params,
          client_id: process.env.FOURSQUARE_CLIENT_ID,
          client_secret: process.env.FOURSQUARE_CLIENT_SECRET,
          v: "20180323",
        },
      },
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export const venues = {
  details: (id: string) =>
    makeFoursquareRequest(`/venues/${id}`),
  explore: (params: VenuesExploreParams) =>
    makeFoursquareRequest("/venues/explore", params),
};
