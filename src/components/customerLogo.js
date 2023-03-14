import { withLDConsumer } from "launchdarkly-react-client-sdk";

const customerLogo = ({ flags, ldClient /*, ...otherProps */ }) => {
  let showFeature = ldClient.variation("show-customer-logo");
  let logo = ldClient.variation("config-customer-logo");
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
