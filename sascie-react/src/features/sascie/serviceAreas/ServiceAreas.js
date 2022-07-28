import { FaRegWindowClose } from 'react-icons/fa'

const ServiceAreas = ({
    serviceAreas,
    setServiceAreas,
    items,
    setItems,
}) => {
    const removeServiceAreaTemplate = (e) => {
        const serviceAreaId = e.target.id || e.target.parentElement.id;
        setServiceAreas([...serviceAreas.filter(serviceArea => serviceArea._id !== serviceAreaId)]);
        setItems([...items.filter(item => item.serviceAreaId !== serviceAreaId)]);
    }

    const handleServiceAreaChanged = (e) => {
        const serviceAreaId = e.target.getAttribute('id');

        // Loop through the service area state and make name changes as the user changes the inputs.
        setServiceAreas(serviceAreas.map(serviceArea => {
            if(serviceArea._id !== serviceAreaId) return serviceArea;
            return {
                ...serviceArea,
                name: e.target.value
            }
        }));

        // Change the service area name in the items state area.
        setItems(items.map(item=> {
            if(item.serviceAreaId !== serviceAreaId) return item;
            return {
                ...item,
                serviceAreaName: e.target.value
            }
        }));
    }

    return (
        <div className='service__areas'>
            <h1 className='service__areas__header'>Serivce Areas Selection</h1>
            <div className='service__areas__list'>
                {
                    serviceAreas.map(serviceArea => (
                        <div id={serviceArea._id} key={serviceArea._id} className='service__areas__list__group'> 
                            <FaRegWindowClose 
                                className='service__areas__list__group--icon'
                                id={serviceArea._id}
                                onClick={removeServiceAreaTemplate}
                            />
                            <input 
                                defaultValue={serviceArea.name}
                                id={serviceArea._id}
                                className='input__base'
                                onChange={handleServiceAreaChanged}
                            />
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default ServiceAreas;