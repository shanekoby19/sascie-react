import Nav from "../../components/Nav";

const AdminPage = ({ Page, name }) => {
    const links = [{
        pageName: 'users',
        relativeTo: '/admin/users'
    }, {
        pageName: 'sascie',
        relativeTo: '/admin/sascie'
    }]

    return (
        <div className='admin__page'>
            <Nav links={links} currentPage={name}/>
            <Page />
        </div>
    )
}

export default AdminPage;