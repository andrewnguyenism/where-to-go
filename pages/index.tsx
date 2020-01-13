import * as React from "react";

import Head from "next/head";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  CssBaseline,
  Grid,
  Typography,
  CardHeader
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Stars as StarsIcon } from "@material-ui/icons";

import RollingLoader from "../src/components/RollingLoader";
import * as Foursquare from "../src/services/foursquare";

export default function Index() {
  const [position, setPosition] = React.useState<Position | null>(null);
  const [gettingPosition, setGettingPosition] = React.useState(false);
  const [places, setPlaces] = React.useState<Foursquare.BaseVenue[]>([]);
  const [filteredPlaces, setFilteredPlaces] = React.useState<
    Foursquare.BaseVenue[]
  >([]);
  const [fetchingResult, setFetchingResult] = React.useState(false);
  const [detailedResult, setDetailedResult] = React.useState<
    Foursquare.DetailedVenue | undefined
  >(undefined);
  const [basicResult, setBasicResult] = React.useState<
    Foursquare.BaseVenue | undefined
  >(undefined);
  const [resultHistory, setResultHistory] = React.useState<
    Foursquare.BaseVenue[]
  >([]);
  const [remainingTries, setRemainingTries] = React.useState(4);
  const [error, setError] = React.useState<string | null>(null);

  const findAPlace = async (givenPosition: Position) => {
    const data = await Foursquare.venues.explore({
      limit: 50,
      ll: `${(position || givenPosition).coords.latitude},${
        (position || givenPosition).coords.longitude
      }`,
      openNow: true,
      radius: 1500,
      section: "food"
    });
    setPlaces(
      data.groups[0].items.map(
        (item: { venue: Foursquare.BaseVenue }) => item.venue
      )
    );
  };

  const handleRollDiceClick = async (event: any) => {
    setFetchingResult(true);
    setGettingPosition(true);
    const geo = navigator.geolocation;
    if (!geo) {
      setError("Geolocation is not supported");
      return;
    }
    geo.getCurrentPosition(
      position => {
        setGettingPosition(false);
        setPosition(position);
        findAPlace(position);
      },
      error => {
        setGettingPosition(false);
        setError(error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  React.useEffect(() => {
    if (places.length > 0) {
      const placesToUse = filteredPlaces.length > 0 ? filteredPlaces : places;
      const randomPlace =
        placesToUse[Math.floor(Math.random() * placesToUse.length)];
      const getDetailedVenue = async (
        undetailedVenue: Foursquare.BaseVenue
      ) => {
        try {
          const detailedVenue = await Foursquare.venues.details(
            undetailedVenue.id
          );
          setDetailedResult(detailedVenue.venue);
        } catch (error) {
          setBasicResult(undetailedVenue);
          setDetailedResult(undefined);
          console.error(error);
        } finally {
          setFilteredPlaces(
            placesToUse.filter(place => randomPlace.id !== place.id)
          );
          setRemainingTries(remainingTries - 1);
          setResultHistory([randomPlace, ...resultHistory]);
        }
      };
      getDetailedVenue(randomPlace);
    }
  }, [places]);

  React.useEffect(() => {
    setFetchingResult(false);
  }, [basicResult, detailedResult]);

  const classes = useStyles();
  return (
    <div className="container">
      <Head>
        <title>Where To Go</title>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
          key="viewport"
        />
      </Head>
      <CssBaseline />
      {!fetchingResult && !basicResult && !detailedResult ? (
        <Button
          color="primary"
          disabled={gettingPosition}
          fullWidth
          onClick={handleRollDiceClick}
          variant="contained"
        >
          Find Me A Place
        </Button>
      ) : null}
      {fetchingResult ? (
        <RollingLoader
          entrants={[
            "🥨",
            "🥯",
            "🥞",
            "🍗",
            "🥩",
            "🍔",
            "🍟",
            "🍕",
            "🌭",
            "🥪",
            "🌮",
            "🌯",
            "🍳",
            "🥘",
            "🍲",
            "🥗",
            "🍛",
            "🍜",
            "🍝",
            "🍣",
            "🥟",
            "🥡",
            "🍦",
            "🍩",
            "🍷",
            "🍻",
            "🥤"
          ]}
          size={48}
        />
      ) : null}
      {detailedResult || basicResult ? (
        <Container>
          <Card className={classes.card}>
            {detailedResult && detailedResult.bestPhoto ? (
              <CardMedia
                className={classes.cardImage}
                component="img"
                height="1024"
                image={`${detailedResult.bestPhoto.prefix}1024x1024${detailedResult.bestPhoto.suffix}`}
              />
            ) : null}
            <CardContent>
              <Typography gutterBottom variant="h5">
                {(basicResult ? basicResult : detailedResult ? detailedResult : {}).name}
              </Typography>
              {detailedResult ? (
                <Typography gutterBottom variant="caption">
                  {detailedResult.rating
                    ? `${detailedResult.rating}/10${
                        detailedResult.ratingSignals
                          ? ` (${detailedResult.ratingSignals})`
                          : ""
                      }`
                    : undefined}
                </Typography>
              ) : null}
              <Typography gutterBottom color="textSecondary" variant="body2">
                {(basicResult ? basicResult : detailedResult ? detailedResult : {}).categories?.find(category => category.primary)?.name}
              </Typography>
              <Typography variant="body1">
                {(basicResult ? basicResult : detailedResult ? detailedResult : {}).location?.formattedAddress.join(", ")}
              </Typography>
            </CardContent>
            <CardActions>
              {detailedResult ? (
                <Button
                  size="small"
                  color="primary"
                  href={detailedResult.canonicalUrl}
                >
                  View Details
                </Button>
              ) : null}
              <Button
                size="small"
                disabled={remainingTries < 1}
                color="primary"
                onClick={handleRollDiceClick}
              >
                Roll Again {remainingTries > 0 ? `(${remainingTries})` : ""}
              </Button>
            </CardActions>
          </Card>
          {resultHistory.length > 1 ? (
            <Typography className={classes.history} variant="body2">
              Past Results:{" "}
              {resultHistory
                .slice(1)
                .map(result => result.name)
                .join(", ")}
            </Typography>
          ) : null}
        </Container>
      ) : null}
      <style global>{`
        body,html {
          height: 100%;
        }
        body {
          align-items: center;          
          display: flex;
          justify-content: center;
        }
        div.container {
          width: 100%;
        }
      `}</style>
    </div>
  );
}

const useStyles = makeStyles(theme => ({
  card: {
    marginTop: theme.spacing(2)
  },
  cardImage: {
    height: 250
  },
  history: {
    marginTop: theme.spacing(2)
  }
}));
