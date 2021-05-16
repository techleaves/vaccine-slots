import React, { Fragment } from 'react';
import VaccineSlot from './VaccineSlot/index';
import VaccineSlotNew from "./VaccineSlotNew/index";

const sections = () => {
  return (
    <Fragment>
      <VaccineSlot />
      {/* <VaccineSlotNew /> */}
    </Fragment>
  );
};

export default sections;
