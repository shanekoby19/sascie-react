import { motion } from 'framer-motion'

const loaderVariants = {
    animationOne: {
        x: [-80, 80],
        y: [0, -120],
        transition: {
            x: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1,
            },
            y: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: .5,
                ease: 'easeOut'
            }
        }
    }
}

const Loader = ({
    message
}) => {
    return (
        <div className='loader__container'>
            <motion.div 
                className='loader'
                variants={loaderVariants}
                animate="animationOne"
            >
            </motion.div>
            <p>{ message || 'Contacting the Database' }</p>
        </div>
    )
}

export default Loader;