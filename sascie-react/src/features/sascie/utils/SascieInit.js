import { useRef } from "react";
import { TextField } from "@material-ui/core";
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';

const SascieInit = ({
    setPrograms,
    user,
    startDate,
    setStartDate,
    endDate,
    setEndDate
}) => {
    // Redux Selectors
    const daysRef = useRef('');
    

    const handleProgramsSelected = (e) => {
        const booleans = Array.from(e.target.children).map(optionEl => optionEl.selected);
        setPrograms([...user.programs.filter((_, index) => booleans[index])]);
    }

    return (
        <div className='programs'>
            <h1 className='programs__header'>Program Selection</h1>
            <h2 className='programs__select__header'>Select the programs you would like to create a new Sascie for.</h2>
            <select 
                className='programs__select select__base' 
                name='programs' 
                multiple 
                size={user.programs.length < 5 ? user.programs.length : 5}
                onChange={handleProgramsSelected}
            >
            {   
                user.programs.map(program => (
                    <option className='programs__option' key={program._id} value={program._id}>
                        {program.name}
                    </option>
                ))
            }
            </select>
            <div className='programs__start__date'>
                <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newStartDate) => {
                        setStartDate(newStartDate);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                />
            </div>
            <div className='programs__num__days'>
                <label htmlFor='num__days'>Number of days</label>
                <input 
                    className='programs__num__days__input input__base'
                    placeholder='Enter number of days (optional)'
                    ref={daysRef}
                    onChange={() => parseInt(daysRef.current.value) ? setEndDate(moment().add(daysRef.current.value, 'days')) : setEndDate(moment().add(6, 'months'))}
                    >
                </input>
            </div>
            <div className='programs__end__date'>
                <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newEndDate) => {
                        setEndDate(newEndDate);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                />
            </div>
            
        </div>
    )
}

export default SascieInit;