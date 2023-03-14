import React from "react";
import ReactDOM from "react-dom"; // React 16
//import ReactDOMClient from "react-dom/client"; // React 18
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { asyncWithLDProvider } from "launchdarkly-react-client-sdk";
import { deviceType, osName } from "react-device-detect";
//import getUserId from "./util/getUserId";
import getExpList from "./util/getExpList";
import AWS from 'aws-sdk';


const CLIENTKEY = "6284382d30dae514fe1c974a"; // react-qr-demo / Production

//let id = getUserId();

(async () => {
  const userContext = {
    kind: "user",
    key: ["Amy", "Ben", "Cal", "Dan", "Eli"][Math.floor(Math.random() * 5)],
    email: "abc@example.org",
    role: "Build",
    address: {
      country: "United States",
      state: ["Nevada", "New York", "Seattle", "Ohio", "Oregon", "California"][Math.floor(Math.random() * 6)],
      street: "123 Main Street",
    },
    needs: [["air", "water"], ["air"], ["air", "food"], ["air", "water", "food"]][Math.floor(Math.random() * 4)],
    plan: "Employer", // "Individual",
    beta: false,
    //optIn: ["feature1", "feature2"],
    experimentInclusionOverrides: getExpList()["experimentFlags"],
  }
  const organizationContext = {
    kind: "organization",
    key: "example.org",
    industry: ["Healthcare", "Education", "Retail"][Math.floor(Math.random() * 3)],
  }
  // This device context is anonymous
  // The key is omitted, and the SDK will automatically generate one
  const deviceContext = {
    kind: "device",
    anonymous: true,
    //using the deviceType and osName selectors from the npm package
    deviceType: deviceType,
    operatingSystem: osName,
  }
  const multiContext = {
    kind: "multi",
    user: userContext,
    device: deviceContext,
    organization: organizationContext,
  }
  const LDProvider = await asyncWithLDProvider({
    clientSideID: CLIENTKEY,
    context: multiContext,
    options: {
      privateAttributes: ['email', '/address/street'],
      evaluationReasons: true,
      bootstrap: "localStorage"
    },
  });

  // https://stackoverflow.com/questions/33659059/invoke-amazon-lambda-function-from-node-app
    // You shouldn't hard-code your keys in production! 
    // http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html
    // AWS.config.update({ 
    //   accessKeyId: 'AWSAccessKeyId', 
    //   secretAccessKey: 'AWSAccessKeySecret', 
    //   region: 'eu-west-1',
    // });
    AWS.config.update({region: 'us-east-1'});
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: 'us-east-1:157e0f20-91f3-4a7a-b371-3b4eadb258f4',
    });

      AWS.config.getCredentials(function(err) {
        if (err) {
          console.log(err.stack);
          // credentials not loaded
          // // Initialize the Amazon Cognito credentials provider
        } else {
          //console.log("Access key:", AWS.config.credentials.accessKeyId);
        }
      });
    if (window.lambdaResponse === undefined) {
      window.lambdaResponse = await new AWS.Lambda().invoke({'FunctionName': 'BackendFunc'}).promise();
    }

    await new Promise(r => setTimeout(r, 5));
    console.log(window.lambdaResponse);

    // React 18
    // const root = ReactDOMClient.createRoot(document.getElementById("root"));
    // root.render(
    //    <LDProvider>
    //     <App />
    //   </LDProvider>,
    // );

    // React 16
    ReactDOM.render(
      <LDProvider>
        <App />
      </LDProvider>,
      document.getElementById("root")
    );
})();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
