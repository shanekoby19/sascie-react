import { useState } from 'react';
import { useSelector } from "react-redux";

import ItemCard from "./ItemCard";
import { getAllItems } from '../../sascie/sascieSlice';
import ItemFilters from "./ItemFilters";

const SascieEntry = () => {
    const [items, setItems] = useState(useSelector(getAllItems));
    const [currentExecutionMetricIndex, setCurrentExecutionMetricIndex] = useState(0);

    return (
        <div className='sascie__entry'>
            <div className='sascie__entry__filters'>
                <ItemFilters 
                    items={items}
                    setItems={setItems}
                    currentExecutionMetricIndex={currentExecutionMetricIndex}
                    setCurrentExecutionMetricIndex={setCurrentExecutionMetricIndex}
                />
            </div>
            <div className='sascie__entry__items'>
                {
                    items.map(item => (
                        <ItemCard 
                            key={item._id} 
                            item={item}
                            currentExecutionMetricIndex={currentExecutionMetricIndex}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default SascieEntry;