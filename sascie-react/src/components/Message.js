import React from 'react'
import { FaCheck, FaExclamationCircle } from 'react-icons/fa';

const Message = ({ message, className, fontColorClass }) => {
  // Sets up the paragraph to accept a font-color if one is passed in.
  const paragraphClass = fontColorClass ? `${className}__message ${fontColorClass}` : `${className}__message`;

  return(
    <section className={className}>
        <p className={paragraphClass}>{message}</p>
        {className==='error' ? <FaExclamationCircle className='error__icon'/> :
                               <FaCheck className='success__icon' />}
    </section>
   )

 }

export default Message;