import { Navbar, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const NavigationBar = () => {

  let navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('accessToken')
    navigate('/')
  }

  return (
    <Navbar bg="light" expand="lg" style={{marginBottom: "40px"}} >
      <Navbar.Brand as={Link} to="/">Odin Socials</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link as={Link} to="/">Profile</Nav.Link>
          <Nav.Link as={Link} to="/users/new-thread">New Thread</Nav.Link>
          <Nav.Link as={Link} to="/users/threads">Threads</Nav.Link>
          <Nav.Link as={Link} to="/users/friends">Friends</Nav.Link>
        </Nav>
        <Nav className="justify-content-end" style={{ marginLeft: "auto"}}>
          <Button variant="outline-primary" onClick={logout}>Logout</Button>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;
