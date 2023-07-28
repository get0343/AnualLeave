import moment from "moment";
import { useState } from "react";

const CalcDateDiff = () => {
    const [startDate, setStartDate] = useState(moment());
    const [endDate, setEndDate] = useState(moment().add(1, 'days'));
    const [dateDiff, setDateDiff] = useState('');

    const calculateDateDiff = () => {
        const diffInDays = endDate.diff(startDate, 'days');
        const duration = moment.duration(diffInDays, 'days');
        const years = duration.years();
        const months = duration.months();
        const days = duration.days();
        setDateDiff(`${years} years, ${months} months, and ${days} days`);
    }

    return (
        <div>
            <div>
            <label>Start Date:</label>
            <input type="date" value={startDate.format('YYYY-MM-DD')} onChange={(e) => setStartDate(moment(e.target.value))} />
            </div>
            <div>
            <label>End Date:</label>
            <input type="date" value={endDate.format('YYYY-MM-DD')} onChange={(e) => setEndDate(moment(e.target.value))} />
            </div>
            <button onClick={calculateDateDiff}>Calculate Date Difference</button>
            {dateDiff && (
                <div>
                    <p>The difference is {dateDiff} days.</p>
                </div>
            )}
        </div>
    )
}

export default CalcDateDiff;