import { withLDConsumer } from "launchdarkly-react-client-sdk";
import heart from "./../images/heart.svg";

const customerLogo = ({ flags, ldClient /*, ...otherProps */ }) => {
  let showFeature = ldClient.variation("reactShowCustomerLogo");
  let logo = ldClient.variation("reactCustomerLogo");
  let logoOnClickUrl = ldClient.variation("reactCustomerLogoOnClickUrl");

  return showFeature ? (
  <div>
    <a href={logoOnClickUrl}><img src={logo} className="customer-logo" alt="customerLogo" /></a>
  </div>
  ) : (
  <div />
  );
};

export default withLDConsumer()(customerLogo);
