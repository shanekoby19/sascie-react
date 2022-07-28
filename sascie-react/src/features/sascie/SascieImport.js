import { FaPaperclip } from 'react-icons/fa';

const SascieImport = ({
    file,
    setFile
}) => {
    return (
        <div className='sascie__import'>
            <div className='sascie__import__file__selectors'>
                <label 
                    htmlFor="import"
                    className='sascie__import__file__selector sascie__import__file__selector--text'
                >{ file ? file.name.slice(0, 24).concat('...') : "Upload Import File" }</label>
                <label 
                    htmlFor="import"
                    className='sascie__import__file__selector'
                ><FaPaperclip className='sascie__import__file__selector--icon'/></label>
            </div>
            <input
                className='sascie__import__file__input'
                type='file'
                id='import'
                accept='text/csv'
                onChange={(e) => setFile(e.target.files[0])}
            />
        </div> 
    );
}

export default SascieImport;