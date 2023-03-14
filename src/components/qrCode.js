import QRCode from "react-qr-code";
import { withLDConsumer } from "launchdarkly-react-client-sdk";

//Change QRURL to the URL where you'll be hosting this app
const QRURL = "https://emilhorne.github.io/react_qr_app/";

const qrCodeHome = ({ flags, ldClient /*, ...otherProps */ }) => {
  let showFeature = ldClient.variation("show-qr-code");
  return showFeature ? (
    <div>
      <br />
      <span style={{ color: flags.configBackgroundColor === "gray" ? "black" : 'yellow' }}><center>Scan me!</center></span>
      <div className="qr-wrapper">
        <QRCode value={QRURL} />
      </div>
    </div>
  ) : (
    <div></div>
  );
};

export default withLDConsumer()(qrCodeHome);
