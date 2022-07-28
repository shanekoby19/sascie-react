import Nav from "../../components/Nav";

const SasciePage = ({ Page, name }) => {
    const links = [, {
        pageName: 'dashboard',
        relativeTo: '/sascie/dashboard'
    }]

    return (
        <div 
            className='sascie'>
            <Nav links={links} currentPage={name}/>
            <Page />
        </div>
    )
}

export default SasciePage;