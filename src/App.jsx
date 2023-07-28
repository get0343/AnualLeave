import React from 'react';
import { createRoot } from 'react-dom/client';
import CalcDateDiff from './CalcDateDiff';
import DateChecker from './DateChecker';
import CalcAnualLeave from './CalcAnualLeave';
import './app.scss';

const App = () => {
  return (
    <>
        {/* <CalcDateDiff />
        <DateChecker dateToCheck={"2023-07-20"} startDate={"2023-07-15"} endDate={"2023-07-28"} /> */}
        <CalcAnualLeave />
    </>
  )
}

export default App;