import React from 'react';
import moment from 'moment';

const DateChecker = ({ dateToCheck, startDate, endDate }) => {
  const isBetween = moment(dateToCheck).isBetween(startDate, endDate);
  return (
    <div>
      {isBetween ? (
        <p>
          The date {dateToCheck} is between {startDate} and {endDate}.
        </p>
      ) : (
        <p>
          The date {dateToCheck} is not between {startDate} and {endDate}.
        </p>
      )}
    </div>
  );
};

export default DateChecker;