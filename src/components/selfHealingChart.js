import { withLDConsumer, useLDClient } from "launchdarkly-react-client-sdk";
import axios from 'axios';
import { VictoryChart, VictoryLine, VictoryLabel, VictoryAxis, VictoryArea } from 'victory';
import React, { useEffect, useState } from 'react';
import * as JSLDClient from 'launchdarkly-js-client-sdk';

// Flag trigger address used to killswitch, and put data back to stable state
const webhook_url = "https://app.launchdarkly.com/webhook/triggers/63fe051d0b4cf513525ca0ae/d35c1952-d625-4a03-b188-693e657e9ab4"

// Function to send the webhook. Used in plot()
async function sendRequest(url) {
  const response = await axios.post(url);
  return response.data.answer;
}

let global_ld_client = null;

// Core component
function SelfHealingChart ({ flags, ldClient }) {
    useLDClient()
  const [label, setLabel] = useState('Problem Rate');

  // clientSideID points to your LaunchDarkly global project
  const clientSideID = '644a987a0beee912c3717bbb';

  // Set up the context properties for the global project connection (copy from local context)
  let global_context = ldClient.getContext();
  if (global_context.kind === "multi") {
    // add my global stuff to the multi-context as a separate kind (e.g., global)
  }
  else
  {
    // the react SDK is not already using a multi context so construct one
    const multiContext = {
      kind: "multi",
      localContext: global_context,
      globalContext:
        {
          kind: "global",
          key: // mparticle ID
          brand: // get the URL
          // ...
        }
    }
  }

  

  // Set options so regardless of SDK version running this code, it will work with experiments
  const options = {
    allowFrequentDuplicateEvents: true, // prevents data loss in some scenarios
    sendEventsOnlyForVariation: true, // fixes an issue in older React SDKs
    evaluationReasons: true
  };

  // Connect to LaunchDarkly - here we are making a dedicated connection just for global experiments; this doesn't interfere/interact with brand-specific connections already implemented
  if (global_ld_client === null) {
    global_ld_client = JSLDClient.initialize(clientSideID, global_context, options);
  }
  global_ld_client.waitForInitialization().then(() => {
    let eval_result = ldClient.variationDetail("config-chart-label", "Local Error Rate");
    //alert(JSON.stringify(eval_result));
    if (eval_result.reason.kind === "ERROR" || eval_result.reason.kind === "OFF" || eval_result.reason.kind === "PREREQUISITE_FAILED") {
      setLabel(global_ld_client.variation("config-chart-label", "Global Error Rate"));
    }
    else
    {
      setLabel(eval_result.value);
    }  
    // initialization succeeded, flag values are now available
  }).catch(err => {
    // initialization failed
  });

  // Chart data controlled by a flag
  const defaultValue = [
    { x: 1, y: 15 },
    { x: 2, y: 17 },
    { x: 3, y: 16 },
    { x: 4, y: 15 },
    { x: 5, y: 18 },
    { x: 6, y: 19 },
    { x: 7, y: 21 },
    { x: 8, y: 22 },
    { x: 9, y: 16 },
    { x: 10, y: 15 },
    { x: 11, y: 14 },
    { x: 12, y: 17 },
    { x: 13, y: 19 },
    { x: 14, y: 20 },
    { x: 15, y: 18 },
    { x: 16, y: 21}
  ]

  const [figures, setFigures] = useState(defaultValue);
 
  // Static red chart threshold line data
  const threshold = 60

  const thresholdData = [
    { x: 1, y: threshold },
    { x: 2, y: threshold },
    { x: 3, y: threshold },
    { x: 4, y: threshold },
    { x: 5, y: threshold },
    { x: 6, y: threshold },
    { x: 7, y: threshold },
    { x: 8, y: threshold },
    { x: 9, y: threshold },
    { x: 10, y: threshold },
    { x: 11, y: threshold },
    { x: 12, y: threshold },
    { x: 13, y: threshold },
    { x: 14, y: threshold },
    { x: 15, y: threshold }
  ]

  // Used to tell the chart to rerender
  const defaultMutation = [{
    externalMutations: [
      {
        childName: "dataLine",
        target: "parent",
        eventKey: "all",
        mutation: () => ({ data: figures }),
        
      }
  ]}]

  const [mutateChart, setMutateChart] = useState(defaultMutation)

  function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Function used to update 'figures' with new data
  function plot() {
    let eval_result = ldClient.variationDetail("config-chart-label", "Local Error Rate");
    //alert(JSON.stringify(eval_result));
    if (eval_result.reason.kind === "ERROR" || eval_result.reason.kind === "OFF" || eval_result.reason.kind === "PREREQUISITE_FAILED") {
      setLabel(global_ld_client.variation("config-chart-label", "Global Error Rate"));
    }
    else
    {
      setLabel(eval_result.value);
    }  
    const newPlotData = figures;
    const flagValue = ldClient.variation("release-self-healing-feature", false);
    const lastItem = newPlotData.slice(-1)
    const newCount = lastItem[0].x + 1

    if (flagValue) {
      const newDataValue = lastItem[0].y + getRandomNumber(3, 8)
      if (newDataValue > threshold) {
        sendRequest(webhook_url)
      }
      newPlotData.push({ x: newCount, y: newDataValue })
      for (let i = 0; i < newPlotData.length; i++) {
        const newNumber = Number(newPlotData[i].x) - 1;
        newPlotData[i].x = newNumber;
      }
    } else {
      newPlotData.push({ x: newCount, y: getRandomNumber(14, 21) })
      for (let i = 0; i < newPlotData.length; i++) {
        const newNumber = Number(newPlotData[i].x) - 1;
        newPlotData[i].x = newNumber;
      }
    }

    setFigures(newPlotData)
    setMutateChart([{
      externalMutations: [
        {
          childName: "dataLine",
          target: "parent",
          eventKey: "all",
          mutation: () => ({ data: figures }),
          
        }
    ]}])
  }

  // Core loop to repeatedly create new data
  useEffect(() => {
    const chartLoop = setInterval(plot, 2000);
    return function cleanup() {
      clearInterval(chartLoop);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  // The React SDK automatically converts flag keys with dashes and periods to camelCase.
  // See this page for details: https://docs.launchdarkly.com/sdk/client-side/react/react-web#flag-keys
  return flags.showMonitoringChart ? (
    <div>
    <VictoryChart
    domain={{ x: [1, 15], y:[0, 100]}}
    externalEventMutations={mutateChart}
    >
      <VictoryLabel 
        text="System Monitor" 
        x={225} 
        y={30} 
        textAnchor="middle"
        style = {[
          { fill: "black", fontSize: 30 }
        ]} 
      />
      <VictoryLabel 
        text={label}
        x={12} 
        y={150} 
        textAnchor="middle" 
        angle={-90}
        style = {[
          { fill: "black", fontSize: 20 }
        ]}
      />
      <VictoryAxis 
        tickFormat={[
          ""
        ]}
      />
      <VictoryAxis dependentAxis/>
      <VictoryArea
        name = "dataLine"
        data = {figures}
        interpolation="monotoneX"
        animate={{easing: "linear", duration: 1000}}
        style={{
          data: {
            fill: flags.configBackgroundColor === "blue" ? "#D8DEFF" : "#405BFF",
            fillOpacity: 0.8,
            strokeWidth: 3
          },
        }}
      />
      <VictoryLine
        name = "thresholdLine"
        data = {thresholdData}
        style={{
          data: {
            stroke: "red",
            strokeWidth: 5
          }
        }}
      />
    </VictoryChart>
    </div>
  ) : (
  <div>
  </div>
  );
};

export default withLDConsumer()(SelfHealingChart);