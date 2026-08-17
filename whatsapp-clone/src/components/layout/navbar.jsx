import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

function MyNavbar() {
return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
    <Container fluid>

        <Navbar.Brand href="#">
        <strong>ConvoNest</strong>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar" />

        <Navbar.Collapse id="navbar">

        <Nav className="me-auto">
            <Nav.Link href="#">Dashboard</Nav.Link>
            <Nav.Link href="#">Chats</Nav.Link>
            <Nav.Link href="#">Contacts</Nav.Link>
            <Nav.Link href="#">Campaigns</Nav.Link>
        </Nav>

        <Form className="d-flex me-3">
            <Form.Control
            type="search"
            placeholder="Search..."
            />
        </Form>

        <Button variant="success">
            Logout
        </Button>

        </Navbar.Collapse>

    </Container>
    </Navbar>
);
}

export default MyNavbar;