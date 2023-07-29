import { th } from "date-fns/locale";
import moment from "moment/moment";
import { useEffect, useRef } from "react";
import { useState } from "react";

const CalcAnualLeave = () => {
    const [hiredDate, setHiredDate] = useState();
    const [hiredYear, setHiredYear] = useState();
    const [leavesTaken, setLeavesTaken] = useState([]);
    const [available, setAvailable] = useState(null);
    const [emp_hired_date, setEmpHiredDate] = useState();
    const [leaves, setLeaves] = useState([]);
    const [expired_years, setExpiredYears] = useState([]);
    const [years,setYears] = useState([]);
    

    const leave_year = useRef();
    const leave_taken = useRef();
    let ltaken = 0;
    
    const default_entitlement = 16; //a default entitlement leave days given to every employee who has worked after 1 year.
    let increment_days = 0; //the number of days that will be incremented every two years
    let fyear_count = 0; // holds the fiscal year count
    let remaining_days = 0; // a variable that will hold the total remaining anual leave
    //let emp_hired_date = moment(hireDate).format('YYYY-MM-DD'); // the employee hired date
    //let start_year = parseInt(emp_hired_date); // the calendar year part of the employee hired
    let initial_entitlement = 0; //this is the initial number of days the employee will be have every new fiscal year entered. not the total available anual leave.
    
    let today = moment().format('YYYY-MM-DD');

    useEffect(()=>{
        //console.log(hiredDate);
        //console.log(moment(hiredDate,'YYYY-MM-DD').isValid());
        if(moment(hiredDate,'YYYY-MM-DD').isValid()){
            let av = getTotalAvailable();
            setAvailable(av);
        }
    },[leaves])

    useEffect(()=>{
        if(moment(hiredDate,'YYYY-MM-DD').isValid()){
            let years = getFiscalYears(emp_hired_date);
            setYears(years);
        }
        
    },[hiredDate])

    /**
     * a function that will calculate the duration between two dates
     * 
     * @param {*} start start date
     * @param {*} end end date
     * @returns an array containing the result in the format of years months and days
     */
    const calculateDateDiff = (start, end) => {
        const startDate = moment(start);
        const endDate = moment(end);

        const diffInDays = endDate.diff(startDate, 'days');
        const duration = moment.duration(diffInDays, 'days');
        // const years = duration.years();
        //const months = duration.months();
        // const days = duration.days();
        return [duration.years(), duration.months(), duration.days()];
    }

    const getLeaveTaken = (year) => {
        let result = null;
        if(leavesTaken.length > 0) {
            for(let i = 0; i < leavesTaken.length; i++){
                if(leavesTaken[i].year == year){
                    result = leavesTaken[i];
                    break;
                }
            }
        }

        return result;
    }

    const getFiscalYears = (hired_date) => {
        let fyear_start;
        let fyear_end;
        let year = parseInt(moment(emp_hired_date).format('YYYY'));
        let years = [];
        let fyear_count = 0;
        
        while(true){
            
            fyear_start = moment(`${(year - 1)}-07-01`).format('YYYY-MM-DD');
            fyear_end = moment(`${year}-06-30`).format('YYYY-MM-DD');
            
            if(fyear_count == 0){
                if(moment(hired_date).isBetween(fyear_start, fyear_end)){
                    console.log(`year:${year}, start:${fyear_start}, end:${fyear_end}`);
                    years.push(year);
                    year += 1;
                    fyear_count += 1;
                } else {
                    year += 1;
                }
                console.log(today);
                    if(moment(today).isBetween(fyear_start, fyear_end)){
                        console.log('exiting');
                        break;
                    }
                
            } else {
                console.log(`year:${year}, start:${fyear_start}, end:${fyear_end}`);
                years.push(year);
                if(moment(today).isBetween(fyear_start, fyear_end)){
                    break;
                }
                year += 1;
                fyear_count += 1;
            }
        }

        return years;
    }

    const generateAnualLeaves = (start_year) => {
        let start_fyear;
        let end_fyear; 
        let exp_y = []; 
        let dec = 2;
        let fy_exp = 0;

        while(true){
            let leave = {
                year:{
                    name:'',
                    fiscal_year_start:null,
                    fiscal_year_end:null,
                    id:null,
                },
                entitlement:null,
                leaves_taken:null,
                expire:false,
            };

            start_fyear = moment(`${(start_year - 1)}-07-01`).format('YYYY-MM-DD'); // gets the given year start of fiscal year
            end_fyear = moment(`${start_year}-06-30`).format('YYYY-MM-DD'); // gets the given end of fiscal year

            ltaken = getLeaveTaken(start_year)?.taken;
            ltaken = ltaken ? ltaken : 0; 
            
            //check if the fiscal year is already expired and add it to the list.
                //every fiscal year after two years count from it, should expire
                fy_exp = fyear_count - 2
                if(fy_exp >= 0){
                    exp_y.push(fy_exp);
                }

            if(fyear_count == 0){
                if(moment(emp_hired_date).isBetween(start_fyear, end_fyear)){
                    let worked_month = calculateDateDiff(emp_hired_date, end_fyear)[1];                    
                    initial_entitlement = Math.floor(default_entitlement / 12 * worked_month); //the initial entitlement will be not the full year entitlement. it is calculated for the number of months worked
                    

                    leave.year.name = start_year;
                    leave.year.fiscal_year_start = start_fyear;
                    leave.year.fiscal_year_end = end_fyear;
                    leave.leaves_taken = ltaken;
                    leave.year.id = fyear_count;
                    leave.entitlement = initial_entitlement;

                    setLeaves(prev => [...prev, leave]);
                    start_year += 1;
                    fyear_count += 1;
                } else {
                    start_year += 1;                    
                }
            } else {
                
                leave.year.name = start_year;
                    leave.year.fiscal_year_start = start_fyear;
                    leave.year.fiscal_year_end = end_fyear;
                    leave.leaves_taken = ltaken;
                    leave.year.id = fyear_count;
                                
               /**
                * check if today is the last fiscal year and break the loop. also, calculate the last
                * remaining anual leaves for until the current day of the last fiscal year
                */
                if(moment(today).isBetween(start_fyear, end_fyear)){
                    if(fyear_count % 2 == 0) { // every 2 years add 1 day and also expire any previous year remaining leave days.
                        increment_days += 1;                         
                    }

                    let worked_month = calculateDateDiff(start_fyear, today)[1];
                    worked_month = worked_month == 0 ? 1 : worked_month; // to avoid multiplication by zero                   
                    initial_entitlement = Math.floor((default_entitlement + increment_days) / 12 * worked_month);
                    leave.entitlement = initial_entitlement; 
                    setLeaves(prev => [...prev, leave]);                  
                    break;
                }

                if(fyear_count % 2 == 0) { // every 2 years add 1 day and also expire any previous year remaining leave days.
                    increment_days += 1;                    
                    initial_entitlement = default_entitlement + increment_days;
                    leave.entitlement = initial_entitlement; 
                   
                    //exp_y.push(fyear_count - dec);
                    //dec += 1;
                    
                } else {
                    initial_entitlement = default_entitlement + increment_days;
                    leave.entitlement = initial_entitlement;                 
                }

                //add the leave to the list of leaves array
                setLeaves(prev => [...prev, leave]);          
                start_year += 1;
                fyear_count += 1;
            }
            
        }
        setExpiredYears(exp_y);

    }

    const getTotalAvailable = () => {
        let total = 0;
        leaves.forEach(leave => {
            if(!expired_years.includes(parseInt(leave.year.id))){
                let av = leave.entitlement - leave.leaves_taken;
                total += av;
            }
        });

        return total;
    }

    /**
     * a function that will calculate the anual leave the employee will have from the day hired to the current date.
     * 
     * @returns the number of availabel anual leaves the employee has.
     */

    const getAnualLeaveRemaining = (start_year) => {
        let start_fyear;
        let end_fyear;
        
        while(true){ // run until we reach the last fiscal year 

            start_fyear = moment(`${(start_year - 1)}-07-01`).format('YYYY-MM-DD'); // gets the given year start of fiscal year
            end_fyear = moment(`${start_year}-06-30`).format('YYYY-MM-DD'); // gets the given end of fiscal year

            console.log(`count=${fyear_count}, fstart=${start_fyear}, fend=${end_fyear}`);
            ltaken = getLeaveTaken(start_year)?.taken;
            ltaken = ltaken ? ltaken : 0;
            console.log(`ltaken:${ltaken}`);

            if(fyear_count == 0){
                if(moment(emp_hired_date).isBetween(start_fyear, end_fyear)){
                    let worked_month = calculateDateDiff(emp_hired_date, end_fyear)[1];
                    console.log(`worked:${worked_month}`);
                    initial_entitlement = Math.floor(default_entitlement / 12 * worked_month); //the initial entitlement will be not the full year entitlement. it is calculated for the number of months worked                    
                    remaining_days = initial_entitlement - ltaken;
                    console.log(`init:${initial_entitlement}, avail: ${remaining_days}`);                    
                    start_year += 1;
                    fyear_count += 1;
                } else {
                    start_year += 1;
                    //fyear_count += 1;
                    console.log(start_year);
                }
            } else {                
                                
               /**
                * check if today is the last fiscal year and break the loop. also, calculate the last
                * remaining anual leaves for until the current day of the last fiscal year
                */
                if(moment(today).isBetween(start_fyear, end_fyear)){
                    if(fyear_count % 2 == 0) { // every 2 years add 1 day and also expire any previous year remaining leave days.
                        increment_days += 1; 
                        remaining_days = 0;
                    }

                    let worked_month = calculateDateDiff(start_fyear, today)[1];
                    worked_month = worked_month == 0 ? 1 : worked_month; // to avoid multiplication by zero
                    console.log(`wmonth: ${worked_month}, inc:${increment_days}`);
                    initial_entitlement = Math.floor((default_entitlement + increment_days) / 12 * worked_month);
                    console.log(`last init:${initial_entitlement}`);                    
                    remaining_days += initial_entitlement - ltaken;
                    console.log(`last: ${remaining_days}`);
                    break;
                }

                if(fyear_count % 2 == 0) { // every 2 years add 1 day and also expire any previous year remaining leave days.
                    increment_days += 1;                    
                    initial_entitlement = default_entitlement + increment_days;                    
                    remaining_days = initial_entitlement - ltaken; // the prevous remaining days will not be added only this fiscal year entitlement is added.
                    console.log(`Reset: ${remaining_days}`);
                } else {
                    initial_entitlement = default_entitlement + increment_days;                    
                    remaining_days += initial_entitlement - ltaken;
                }

                console.log(`incd: ${increment_days}, Rem: ${remaining_days}`);
                start_year += 1;
                fyear_count += 1;
            }
        }// end of while

        return remaining_days;
    }

    const handleHiredDateSelect = (e) => {
        const selected = e.target.value;
        const hdate = moment(selected);
        setHiredDate(selected);
        setHiredYear(hdate.format('YYYY'));
        setEmpHiredDate(hdate.format('YYYY-MM-DD'));
    }

    const getYearsOptions = () => {
        
        const options = [];
        years.forEach(year => {
            options.push(<option value={year}>{year}</option>);
        });

        return options;
    }

    const handleLeaveTaken = () => {
        let taken = leave_taken.current.value;
        let year = leave_year.current.value;

        setLeavesTaken(prev => [...prev, {year:year, taken:taken}]);
    }

    const handleLeaveCalc = () => {
        //const result =  getAnualLeaveRemaining(parseInt(moment(hiredDate).format('YYYY')));
        //setAvailable(result);
        setLeaves([]);
        generateAnualLeaves(parseInt(moment(hiredDate).format('YYYY')));
       
    }

    return (
        <>
        <div className="anual-leave">
            <h1>A-Leave</h1>
            <div className="header">
                <div className="left">
                    <div className="group">
                        <span className="label">Hired Date</span>
                        <input type="date" name="" id="" onChange={handleHiredDateSelect} />
                    </div>
                </div>
                <div className="right">
                    <span className="result">Available:</span>
                    <span className="value">{available} Days</span>
                </div>
            </div>
            
            <div className="add-leave container">
                <div className="title">Add Leave</div>
                <div className="add-leave-body">
                    <div className="left">
                        <div className="group">
                            <span className="label">Fiscal Year</span>
                            <select name="" id="" ref={leave_year}>
                               {getYearsOptions().map(op => {
                                    return op;
                               })}
                            </select>
                        </div>
                        <div className="group">
                            <span className="label">Leave Taken (Days)</span>
                            <input type="text" name="" id="" ref={leave_taken} />
                        </div>
                        <div className="group">
                            <button onClick={handleLeaveTaken}>Add(+)</button>
                        </div>
                    </div>
                    <div className="right">
                        <div className="title">
                            <span>All Leaves</span>
                            <button onClick={()=>setLeavesTaken([])}>Clear</button>
                        </div>
                        <div className="leaves-body">
                            {leavesTaken.map(l => {
                                return (
                                    <p><span className="year">{l.year}</span><span className="taken">{l.taken}</span></p>
                                )
                            })}
                        </div>
                        
                    </div>
                </div>                
            </div>
            <div className="leave-footer-container">
                    <button className="calcLeave" onClick={handleLeaveCalc}>Calculate Leave</button>
                </div>
        </div>

        <div className="leave-summary">
            <div className="title">Leave Summary</div>
            {leaves.length > 0 ? (
               
                <table>
                    <thead>
                        <tr>
                        <th>&nbsp;</th>
                            {leaves.map(l => {                                
                                return (
                                    <th className={expired_years.includes(parseInt(l.year.id)) ? 'expired' : ''}>
                                        <span className="year">{l?.year.name}</span>
                                        <span className="fyear">{l?.year.fiscal_year_start} - {l?.year.fiscal_year_end}</span>
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>Entitlement</th>
                            {leaves?.map(l => {
                                return (
                                    <td key={l.year.id}>{l.entitlement}</td>
                                )
                            })}
                        </tr>
                        <tr>
                            <th>Leaves Taken</th>
                            {leaves?.map(l => {
                                return (
                                    <td key={l.year.id}>{l.leaves_taken}</td>
                                )
                            })}
                        </tr>
                        <tr>
                            <th>Total</th>
                            {leaves?.map(l => {
                                return (
                                    <td key={l.year.id}>{l.entitlement - l.leaves_taken}</td>
                                )
                            })}
                        </tr>
                    </tbody>
                </table>
            ) : ''}
        </div>

        </>
    )
}

export default CalcAnualLeave;