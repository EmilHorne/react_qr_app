import "./App.css";
import React, { useState, useEffect } from "react";
import { useFlags } from "launchdarkly-react-client-sdk";

//import Toggle from "./components/toggle";

//import { addResponseMessage } from 'react-chat-widget';

import Heart from "./components/heart";
import CustomerLogo from "./components/customerLogo";
import HeaderLDLogo from "./components/headerLogo";
import SelfHealingChart from "./components/selfHealingChart";
import QRCode from "./components/qrCode";
import RoleButtons from "./components/roleButtons";
import InputBox from "./components/inputBox";
import Experiment from "./components/experiment";
import Astronaut from "./components/astronaut";
import Chatbot from "./components/chatbot";

function App() {
  const [headerStyle, setHeaderStyle] = useState("gray-app-header");
  const { configBackgroundColor } = useFlags();
  //const ldClient = useLDClient();

  useEffect(() => {
    setHeaderStyle("gray-app-header");
    const updateBackGroundColor = () => {
      // Sets the className to "purple-app-header", "blue-app-header", etc.
      const headerStyle = configBackgroundColor + "-app-header";
      setHeaderStyle(headerStyle);

      return configBackgroundColor;
    };
    updateBackGroundColor();
  }, [configBackgroundColor]);

  return (
    <div className={headerStyle}>
      <div className="black-header">
        <HeaderLDLogo />
      </div>
      <div className={headerStyle}>
        <Heart />
        <CustomerLogo />
        <SelfHealingChart />
        <QRCode />
        <RoleButtons />
        <InputBox />
        <br />
        <Astronaut />
        <div className="chatbot">
          <Chatbot />
        </div>
      </div>
    </div>
  );
}

export default App;
