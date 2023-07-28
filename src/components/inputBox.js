import { withLDConsumer } from "launchdarkly-react-client-sdk";
import React from "react";
import ls from "local-storage";
import getUserId from "../util/getUserId";

const InputBox = ({ flags, ldClient /*, ...otherProps */ }) => {
  class MyInputBox extends React.Component {
    constructor(props) {
      super(props);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleSubmitSite = this.handleSubmitSite.bind(this);

      this.input = React.createRef();
    };

    async handleSubmit(event) {
      event.preventDefault();
      //const ldClient = useLDClient();
      let context = ldClient.getContext();
      if (this.input.current.value === "no-beta") {
	      context.user.beta = false;

        const projectKey = 'react-qr-demo';
        const environmentKey = 'gideon';
        const resp = await fetch(
          `https://app.launchdarkly.com/api/v2/projects/${projectKey}/environments/${environmentKey}/experiments`,
          {
            method: 'GET',
            headers: {
              "LD-API-Version": "beta",
              "Authorization": 'api-6ad7e0d6-ab58-4a6b-8ce3-30dce11ad14f'
            }
          }
        );
      
        const data = resp.text();
        alert(JSON.stringify(data));

        let expList = { "experimentFlags": [ "config-background-color", "release-new-ui" ] };
        let lsKey = 'LD_Exp_List_' + getUserId();
        ls.set(lsKey, JSON.stringify(expList));
      } else {
        context.user.key = this.input.current.value;
      }
      ldClient.identify(context);
      ldClient.track("counter.submit", context, 1);
      //.then(
      //alert('You entered: ' + this.input.current.value + ' -- ' + JSON.stringify(context))
      //);
    };

    async handleSubmitSite(event) {
      event.preventDefault();
      //alert('You entered: ' + this.input.current.value)

      //const ldClient = useLDClient();
      let context = ldClient.getContext();
      //alert (JSON.stringify(context));
      //context.site.key = this.input.current.value;
      //ldClient.identify(context);
      ldClient.track("Engagement", null, 1);
      //.then(
      //alert('You entered: ' + this.input.current.value + ' -- ' + JSON.stringify(context))
      //);
    };

    render() {
      let showFeature = ldClient.variation("experimental-ui-change", "control");
      let role = ldClient.variation("role", "dev");

      return showFeature === "variant A" ? (
        <form onSubmit={this.handleSubmit}>
          <label>
            Who are you?
            <input type="text" ref={this.input} minlength="2" maxlength="12" size="7" />
          </label>
          <input type="submit" value="Submit" />
        </form>
      ) : showFeature === "variant C" ? (
        <form onSubmit={this.handleSubmitSite}>
        <label>
          Enter site name:
          <input type="text" ref={this.input} minlength="2" maxlength="12" size="7" />
        </label>
        <input type="submit" value="Submit" />
      </form>
      ) : (
        <div/>
      );
    };
  };

  return ( <MyInputBox /> );
};

export default withLDConsumer()(InputBox);
