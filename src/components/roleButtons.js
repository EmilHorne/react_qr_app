import { withLDConsumer } from "launchdarkly-react-client-sdk";
import React, { useState } from "react";
import styled from 'styled-components';
import ls from "local-storage";
import getUserId from "../util/getUserId";

const Button = styled.button`
  background-color: black;
  color: white;
  font-size: 20px;
  padding: 2px 60px;
  border-radius: 20px;
  margin: 2px 0px;
  cursor: pointer;
  &:disabled {
    color: grey;
    opacity: 0.7;
    cursor: default;
  }
`;

const ButtonToggle = styled(Button)`
  opacity: 0.6;
  ${({ active }) =>
    active &&
    `
    opacity: 1;
  `}
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: center;
  align-content: center;
`;

const roles = ['Build', 'Measure', 'Learn', 'Operate', 'Use'];

const RoleButtons = ({ flags, ldClient /*, ...otherProps */ }) => {
  const [active, setActive] = useState(roles[0]);

  function ToggleGroup() {
    return (
      <ButtonGroup>
        {roles.map(role => (
          <ButtonToggle
            key={role}
            active={active === role}
            onClick={() => {
              setActive(role);
              let context = ldClient.getContext();
              context.user.role = role;
              
              ldClient.identify(context);
              ldClient.track("Button Click Count - "+role, context, 1);
            } }
          >
            {role}
          </ButtonToggle>
        ))}
      </ButtonGroup>
    );
  };

  class MyRoleButtons extends React.Component {    
    render() {
      let showFeature = ldClient.variation("show-role-buttons", true);

      return showFeature ? (
        <ToggleGroup />
      ) : (
        <div/>
      );
    };
  };

  return ( <MyRoleButtons /> );
};

export default withLDConsumer()(RoleButtons);
