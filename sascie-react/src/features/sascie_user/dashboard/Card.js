const Card = ({
    value,
    description
}) => {
    return (
        <div className='card'>
            <h2 className='card__value'>{value}</h2>
            <p className='card__description'>{description}</p>
        </div>
    )
}

export default Card;