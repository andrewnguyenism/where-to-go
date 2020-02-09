import * as React from "react";

import axios from "axios";
import Head from "next/head";

import { Button, Container, CssBaseline } from "@material-ui/core";

import PastResults from "../src/components/PastResults";
import RollingLoader from "../src/components/RollingLoader";
import VenueCard from "../src/components/VenueCard";
import { emojisToRoll } from "../src/constants";
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
  const [remainingRerolls, setRemainingRerolls] = React.useState(4);
  const [error, setError] = React.useState<string | null>(null);

  const findAPlace = async (givenPosition: Position) => {
    const {data} = await axios.get('/api/places-near-me', {
      params: {
        latitude: (position || givenPosition).coords.latitude,
        longitude: (position || givenPosition).coords.longitude,
      },
    });
    console.log(data);
    setPlaces(
      data.groups[0].items.map(
        (item: { venue: Foursquare.BaseVenue }) => item.venue
      )
    );
  };

  const handleRollDiceClick = async () => {
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
          const {data} = await axios.get(`/api/place-details/${undetailedVenue.id}`);
          console.log(data);
          setDetailedResult(data.venue);
        } catch (error) {
          setBasicResult(undetailedVenue);
          setDetailedResult(undefined);
          console.error(error);
        } finally {
          setFilteredPlaces(
            placesToUse.filter(place => randomPlace.id !== place.id)
          );
          setRemainingRerolls(
            places.length < remainingRerolls
              ? places.length - 1
              : remainingRerolls - 1
          );
          setResultHistory([randomPlace, ...resultHistory]);
        }
      };
      getDetailedVenue(randomPlace);
    }
  }, [places]);

  React.useEffect(() => {
    setFetchingResult(false);
  }, [basicResult, detailedResult]);

  return (
    <Container>
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
        <RollingLoader entrants={emojisToRoll} size={48} />
      ) : null}
      {basicResult !== undefined || detailedResult !== undefined ? (
        <>
          <VenueCard
            basicInfo={basicResult}
            canReroll={remainingRerolls > 0}
            detailedInfo={detailedResult}
            onClickReroll={handleRollDiceClick}
            rerollLabel={`Roll Again ${
              remainingRerolls > 0 ? `(${remainingRerolls})` : ""
            }`}
          />
          {resultHistory.length > 1 ? (
            <PastResults results={resultHistory
              .slice(1)
              .map(result => result.name)} />
          ) : null}
        </>
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
      `}</style>
    </Container>
  );
}
