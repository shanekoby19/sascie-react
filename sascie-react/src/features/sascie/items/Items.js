import { useState } from 'react';
import { FaAngleUp, FaAngleDown, FaRegWindowClose } from 'react-icons/fa';

const Items = ({
    items,
    setItems,
    executions,
    setExecutions
}) => {
    const [activeServiceAreaId, setActiveServiceAreaId] = useState('');

    const handleChangeVisibility = (e) => {
        const serviceAreaId = e.target.getAttribute('id') || e.target.parentElement.getAttribute('id');

        setItems(items.map(item => {
            if(item.serviceAreaId !== serviceAreaId) {
                return {
                    ...item,
                    itemsVisible: false,
                }
            };
            
            // Set the active service area in our state.
            setActiveServiceAreaId(item.serviceAreaId);
            return {
                ...item, 
                itemsVisible: !item.itemsVisible
            }
        }))
    }

    const handleItemChanged = (e) => {
        const itemId = e.target.getAttribute('id');

        // As the user changes the item input, update the item name with the new value.
        setItems(items.map(item => {
            if(item._id !== itemId) return item;
            return {
                ...item,
                name: e.target.value
            }
        }));

        // Change the item name in the executions state.
        setExecutions(executions.map(execution => {
            if(execution.itemId !== itemId) return execution;
            return {
                ...execution,
                itemName: e.target.value
            }
        }));
    }

    const removeItemTemplate = (e) => {
        const itemId = e.target.id || e.target.parentElement.id;

        setItems(items.map(itemObj => {
            if(itemObj.serviceAreaId !== activeServiceAreaId) return itemObj;
            return {
                ...itemObj,
                items: [...itemObj.items.filter(item => item._id !== itemId)]
            }
        }));

        setExecutions([...executions.filter(executionObj => executionObj.itemId !== itemId)]);
    }


    return (
        <div className='items'>
            <h1 className='items__header'>Item Selection</h1>
            <div className='items__list'>
                {
                    items.map(itemObj => (
                        <div  key={itemObj.serviceAreaId} className='items__list__service__area'>
                            <div className='items__list__service__area--header'>
                                <h2>
                                    {itemObj.serviceAreaName}
                                </h2>
                                { 
                                    itemObj.itemsVisible ? 
                                    <FaAngleUp 
                                        className='items__list__service__area--header__icon'
                                        id={itemObj.serviceAreaId}
                                        onClick={handleChangeVisibility}
                                    /> :
                                    <FaAngleDown 
                                        className='items__list__service__area--header__icon'
                                        id={itemObj.serviceAreaId}
                                        onClick={handleChangeVisibility}
                                    />
                                }
                            </div>
                            <div className='items__list__items'>
                            {
                                itemObj.itemsVisible &&
                                itemObj.items.map(item => {
                                    return (
                                        <div key={item._id} className='items__list__item__group'>
                                            <FaRegWindowClose 
                                                className='items__list__item__group--icon'
                                                id={item._id}
                                                onClick={removeItemTemplate}
                                            />
                                            <input
                                                className='items__list__item input__base'
                                                defaultValue={item.name}
                                                id={item._id}
                                                onChange={handleItemChanged}
                                            ></input>
                                        </div>
                                    )
                                })
                            }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Items;