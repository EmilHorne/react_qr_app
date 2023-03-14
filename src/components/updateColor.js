import { withLDConsumer } from "launchdarkly-react-client-sdk";

const updateBackGroundColor = ({ flags, ldClient /*, ...otherProps */ }) => {
  let showColorFeature = ldClient.variation("config-background-color");

  return showColorFeature;
};

export default withLDConsumer()(updateBackGroundColor);
