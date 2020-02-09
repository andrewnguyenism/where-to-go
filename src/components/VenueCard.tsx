import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import * as Foursquare from "../services/foursquare";

interface Props {
  basicInfo?: Foursquare.BaseVenue;
  canReroll: boolean,
  detailedInfo?: Foursquare.DetailedVenue;
  rerollLabel: React.ReactNode;
  onClickReroll: () => void;
}

const useStyles = makeStyles(theme => ({
  card: {
    marginTop: theme.spacing(2),
    maxWidth: 800,
    minWidth: 400,
  },
  cardImage: {
    height: 250
  },
}));

const VenueCard = ({
  basicInfo,
  canReroll,
  detailedInfo,
  onClickReroll,
  rerollLabel,
}: Props) => {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      {detailedInfo && detailedInfo.bestPhoto ? (
        <CardMedia
          className={classes.cardImage}
          component="img"
          height="1024"
          image={`${detailedInfo.bestPhoto.prefix}1024x1024${detailedInfo.bestPhoto.suffix}`}
        />
      ) : null}
      <CardContent>
        <Typography gutterBottom variant="h5">
          {(basicInfo ? basicInfo : detailedInfo ? detailedInfo : {}).name}
        </Typography>
        {detailedInfo ? (
          <Typography gutterBottom variant="caption">
            {detailedInfo.rating
              ? `${detailedInfo.rating}/10${
                  detailedInfo.ratingSignals
                    ? ` (${detailedInfo.ratingSignals})`
                    : ""
                }`
              : undefined}
          </Typography>
        ) : null}
        <Typography gutterBottom color="textSecondary" variant="body2">
          {
            (basicInfo
              ? basicInfo
              : detailedInfo
              ? detailedInfo
              : {}
            ).categories?.find(category => category.primary)?.name
          }
        </Typography>
        <Typography variant="body1">
          {(basicInfo
            ? basicInfo
            : detailedInfo
            ? detailedInfo
            : {}
          ).location?.formattedAddress.join(", ")}
        </Typography>
      </CardContent>
      <CardActions>
        {detailedInfo ? (
          <Button
            size="small"
            color="primary"
            href={detailedInfo.canonicalUrl}
          >
            View Details
          </Button>
        ) : null}
        <Button
          size="small"
          disabled={!canReroll}
          color="primary"
          onClick={onClickReroll}
        >
          {rerollLabel}
          
        </Button>
      </CardActions>
    </Card>
  );
};

export default VenueCard;
