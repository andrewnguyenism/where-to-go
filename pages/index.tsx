import * as React from 'react';
import Head from 'next/head';
import {Button, Card, CardContent, CssBaseline, Grid, TextField, Typography, Container, CardActions} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {Stars as StarsIcon} from '@material-ui/icons';
import {Autocomplete} from '@material-ui/lab';
import useSWR from 'swr';
import {throttle} from 'lodash';
import parse from 'autosuggest-highlight/parse';

function loadScript(src: string, position: HTMLElement | null, id: string) {
  if (!position) {
    return;
  }

  const script = document.createElement('script');
  script.setAttribute('async', '');
  script.setAttribute('id', id);
  script.src = src;
  position.appendChild(script);
}

const autocompleteService = { current: null };
const autocompleteToken = { current : null };
const placesService = { current: null };

interface AutocompletePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    secondary_text: string;
    main_text_matched_substrings: [
      {
        offset: number;
        length: number;
      }
    ];
  };
}

interface LatLng {
  lat: () => number;
  lng: () => number;
}

interface PlaceResult {
  geometry: {
    location: LatLng;
  };
  id: string;
  name: string;
  photos: Array<{getUrl: () => string; height: number; width: number}>;
  price_level: 0 | 1 | 2 | 3 | 4;
  rating: number;
  user_ratings_total: number;
}

export default function Index() {
  const [options, setOptions] = React.useState<AutocompletePrediction[]>([]);
  const [locationInput, setLocationInput] = React.useState<string>('');
  const [location, setLocation] = React.useState<PlaceResult | undefined>(undefined);
  const [places, setPlaces] = React.useState<PlaceResult[]>([]);
  const [filteredPlaces, setFilteredPlaces] = React.useState<PlaceResult[]>([]);
  const [fetchingResult, setFetchingResult] = React.useState<boolean>(false);
  const [result, setResult] = React.useState<PlaceResult | undefined>(undefined);
  const [resultHistory, setResultHistory] = React.useState<PlaceResult[]>([]);
  const [remainingTries, setRemainingTries] = React.useState(4);
  const loaded = React.useRef(false);

  if (typeof window !== 'undefined' && !loaded.current && process.env.GOOGLE_MAPS_API_KEY) {
    if (!document.querySelector('#google-maps')) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`,
        document.querySelector('head'),
        'google-maps',
      );
    }

    loaded.current = true;
  }

  if (typeof window !== 'undefined' && !placesService.current && (window as any).google) {
    placesService.current = new (window as any).google.maps.places.PlacesService(document.createElement('div'));
  }

  const handleLocationInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocationInput(event.target.value);
  };

  const handleLocationChange = (event: React.ChangeEvent<{}>, location: AutocompletePrediction) => {
    if (placesService.current && location !== null) {
      setFetchingResult(true);
      (placesService.current as any).getDetails(
        {
          fields: ['geometry.location'], 
          placeId: location.place_id,
          sessionToken: autocompleteToken.current,
        },
        (result?: PlaceResult) => {
          setFetchingResult(false);
          setLocation(result);
          if ((window as any).google) {
            autocompleteToken.current = new (window as any).google.maps.places.AutocompleteSessionToken();
          }
        },
      );
    }
  };

  const fetchAutocompleteOptions = React.useMemo<(input: any, callback: any) => void>(
    () => 
      throttle((input, callback) => {
        (autocompleteService.current as any).getPlacePredictions(input, callback);
      }, 500),
    [],
  );

  React.useEffect(() => {
    let active = true;

    if (!autocompleteService.current && (window as any).google) {
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
    }
    if (!autocompleteToken.current && (window as any).google) {
      autocompleteToken.current = new (window as any).google.maps.places.AutocompleteSessionToken();
    }
    if (!autocompleteService.current && !autocompleteToken.current) {
      return undefined;
    }

    if (locationInput === '') {
      setOptions([]);
      return undefined;
    }

    fetchAutocompleteOptions(
      { 
        input: locationInput, 
        types: ['(cities)'],
        sessionToken: autocompleteToken.current,
      }, 
      (results?: AutocompletePrediction[]) => {
        if (active) {
          setOptions(results || []);
        }
      },
    );

    return () => {
      active = false;
    };
  }, [locationInput, fetchAutocompleteOptions]);

  const handleRollDiceClick = (event: any) => {
    (placesService.current as any).nearbySearch(
      {
        location: location?.geometry.location, 
        openNow: true,
        radius: '1000',
        type: 'restaurant',
      },
      (results?: PlaceResult[]) => {
        setPlaces(results || []);
      }
    )
  };

  React.useEffect(() => {
    if (places.length > 0) {
      const placesToUse = filteredPlaces.length > 0 ? filteredPlaces : places;
      const randomPlace = placesToUse[Math.floor(Math.random() * placesToUse.length)];
      setResult(randomPlace);
      setFilteredPlaces(placesToUse.filter(place => randomPlace.id !== place.id));
      setRemainingTries(remainingTries - 1);
      setResultHistory([randomPlace, ...resultHistory]);
    }
  }, [places]);

  const classes = useStyles();
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
      <Autocomplete
        autoComplete
        disableOpenOnFocus
        freeSolo
        includeInputInList
        disabled={fetchingResult || result !== undefined} 
        filterOptions={x => x}
        getOptionLabel={option => (typeof option === 'string' ? option : option.description)}
        onChange={handleLocationChange}
        options={options}
        renderInput={params => (
          <TextField 
            {...params}
            fullWidth
            label="Location" 
            margin="normal" 
            variant="filled" 
            value={locationInput} 
            onChange={handleLocationInputChange} />
        )}
        renderOption={option => {
          const matches = option.structured_formatting.main_text_matched_substrings;
          const parts = parse(
            option.structured_formatting.main_text,
            matches.map((match: any) => [match.offset, match.offset + match.length]),
          );

          return (
            <Grid container alignItems="center">
              <Grid item xs>
                {parts.map((part, index) => (
                  <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                    {part.text}
                  </span>
                ))}
                <Typography variant="body2" color="textSecondary">
                  {option.structured_formatting.secondary_text}
                </Typography>
              </Grid>
            </Grid>
          );
        }}
      />
      <Button 
        color="primary"
        disabled={location === undefined || result !== undefined} 
        fullWidth
        onClick={handleRollDiceClick}
        variant="contained">
        Find Me A Place
      </Button>
      {result ? (
        <Card className={classes.card}>
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {result.name}
            </Typography>
            <Grid container>
              <Grid item xs={1}>
                <StarsIcon />
              </Grid>
              {result.rating ? (
                <Grid item xs>
                  <Typography variant="body1">
                    {result.rating} {result.user_ratings_total ? `(${result.user_ratings_total})` : ''}
                  </Typography>
                </Grid>
                ) : null
              }
            </Grid>
          </CardContent>
          <CardActions>
            <Button size="small" color="primary">
              View Details
            </Button>
            <Button size="small" disabled={remainingTries < 1} color="primary" onClick={handleRollDiceClick}>
              Roll Again {remainingTries > 0 ? `(${remainingTries})`: ''}
            </Button>
          </CardActions>
        </Card>
      ) : null}
      {resultHistory.length > 1 ? (
        <Typography className={classes.history} variant="body2">
          Past Results: {resultHistory.slice(1).map(result => result.name).join(", ")}
        </Typography>
      ) : null}
    </Container>
  );
};

const useStyles = makeStyles(theme => ({
  card: {
    marginTop: theme.spacing(2),
  },
  history: {
    marginTop: theme.spacing(2),
  },
}));