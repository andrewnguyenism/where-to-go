import { Chip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

interface Props {
  results: string[];
}

const useStyles = makeStyles(theme => ({
  root: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
  result: {
    margin: theme.spacing(0.5)
  }
}));

const PastResults = ({ results }: Props) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography variant="body2">Past Results:</Typography>
      <div>
        {results.map(result => (
          <Chip className={classes.result} label={result} size="small" />
        ))}
      </div>
    </div>
  );
};

export default PastResults;
