import { useState, useEffect, useMemo, useCallback } from "react";
import { Container, Form, Button, Card, Table, } from "react-bootstrap";
import { getUsers, addUser, updateUser, deleteUser, } from "../services/userService";
function UserCrud() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUsers, setShowUsers] = useState(false);

    const [user, setUser] = useState({ name: "", username: "", email: "", phone: "", website: "", });
    useEffect(() => { loadUsers(); }, []);
    useEffect(() => {
        if (selectedUser) {
            setUser({
                id: selectedUser.id,
                name: selectedUser.name || "",
                username: selectedUser.username || "",
                email: selectedUser.email || "",
                phone: selectedUser.phone || "",
                website: selectedUser.website || "",
            });
        }
    }, [selectedUser]);
    const loadUsers = useCallback(async () => {
        const data = await getUsers();
        setUsers(data);
    }, []);

    const handleChange = useCallback((e) => {
        setUser((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    }, []);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();

            if (!user.name || !user.username || !user.email) {
                alert("Fill all mandatory fields");
                return;
            }

            if (selectedUser) {
                await updateUser(user.id, user);
                alert("User updated successfully");
                setSelectedUser(null);
            } else {
                const newId =
                    users.length > 0
                        ? Math.max(...users.map((u) => Number(u.id))) + 1
                        : 1;

                await addUser({
                    ...user,
                    id: newId,
                });

                alert("User added successfully");
            }

            setUser({
                name: "",
                username: "",
                email: "",
                phone: "",
                website: "",
            });

            loadUsers();
        },
        [user, users, selectedUser, loadUsers]
    );

    const handleDelete = useCallback(
        async (user) => {
            const confirmDelete = window.confirm(`Do you want to delete ${user.username}?`);
            if (!confirmDelete) return;
            await deleteUser(user.id);
            alert("User deleted successfully");
            loadUsers();
        }, [loadUsers]
    );
    const handleEdit = useCallback((user) => {
        setSelectedUser(user);
    }, []);
    const filteredUsers = useMemo(() => {
        return users.filter(
            (u) =>
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.username.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);
    return (
        <Container className="mt-4">
            <h2 className="text-center mb-4">
                JSON User CRUD
            </h2>
            <Card className="shadow mb-4">
                <Card.Body>
                    <h4>
                        {selectedUser ? "Update User" : "Add User"}
                    </h4>

                    <Form onSubmit={handleSubmit}>
                        <Form.Control
                            className="mb-2"
                            placeholder="Name"
                            name="name"
                            value={user.name}
                            onChange={handleChange}
                        />

                        <Form.Control
                            className="mb-2"
                            placeholder="Username"
                            name="username"
                            value={user.username}
                            onChange={handleChange}
                        />

                        <Form.Control
                            className="mb-2"
                            placeholder="Email"
                            type="email"
                            name="email"
                            value={user.email}
                            onChange={handleChange}
                        />

                        <Form.Control
                            className="mb-2"
                            placeholder="Phone"
                            name="phone"
                            value={user.phone}
                            onChange={handleChange}
                        />

                        <Form.Control
                            className="mb-3"
                            placeholder="Website"
                            name="website"
                            value={user.website}
                            onChange={handleChange}
                        />

                        <Button type="submit">
                            {selectedUser
                                ? "Update User"
                                : "Add User"}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            <Button
                variant="primary"
                className="mb-3"
                onClick={() => {
                    loadUsers();
                    setShowUsers(true);
                }}
            >
                Display Users
            </Button>
            {showUsers && (
                <>
                    <Form.Control type="text" placeholder="Search by Name, Username or Email"
                        value={search} onChange={(e) =>
                            setSearch(e.target.value)} className="mb-3" />
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Website</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, index) => (
                                <tr key={user.id}>
                                    <td>{index + 1}</td>
                                    <td>{user.name}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>{user.website}</td>
                                    <td>
                                        <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(user)}>Edit</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(user)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}
        </Container>
    );
}

export default UserCrud;