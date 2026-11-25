import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Badge, Alert } from "react-bootstrap";
import { getEmployees, addEmployee, updateEmployee, deleteEmployeeById } from "../services/employeeService";
export default function EmployeeForm() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", department: "", role: "" });
  const departments = ["Engineering", "Finance", "Human Resources", "Marketing"];
  const roles = ["Developer", "Tester", "Manager", "Accountant", "HR Executive"];
  useEffect(() => { loadEmployees(); }, []);
  const loadEmployees = async () => {
    const data = await getEmployees();
    setEmployees(data);
  };
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const saveEmployee = async () => {
    if (!form.name || !form.email || !form.department || !form.role) {
      alert("All fields are required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      alert("Enter valid email");
      return;
    }
    if (selected) {
      await updateEmployee(selected.id, { ...form, id: selected.id });
    }
    else {
      const numericIds = employees.map(emp => Number(emp.id)).filter(id => !isNaN(id));
      const newId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
      await addEmployee({
        ...form, id: newId
      });
    }
    resetForm();
    loadEmployees();
  };
  const editEmployee = (emp) => {
    setSelected(emp);
    setForm({ name: emp.name, email: emp.email, department: emp.department, role: emp.role });
  };
  const deleteEmployee = async (id) => {
    await deleteEmployeeById(id);
    if (selected?.id === id) resetForm();
    loadEmployees();
  };
  const resetForm = () => {
    setSelected(null);
    setForm({ name: "", email: "", department: "", role: "" });
  };
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(
      (e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.department.toLowerCase().includes(q) || e.role.toLowerCase().includes(q));
  }, [employees, search]);
  return (
    <Container className="py-4">
      <h2 className="text-primary mb-4">Employee Dashboard</h2>
      <Row>
        <Col lg={4}>
          <Card className="shadow">
            <Card.Body>
              <h5>
                {selected ? "Edit Employee" : "Add Employee"}
              </h5>
              <Form>
                <Form.Control className="mb-2" placeholder="Employee Name" name="name" value={form.name} onChange={handleChange} />
                <Form.Control className="mb-2" type="email" placeholder="Email" name="email" value={form.email} onChange={handleChange} />
                <Form.Select className="mb-2" name="department" value={form.department} onChange={handleChange}>
                  <option value=""> Select Department </option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Form.Select>
                <Form.Select className="mb-3" name="role" value={form.role} onChange={handleChange}>
                  <option value="">Select Role</option>
                  {roles.map((role) => (<option key={role} value={role}>{role}</option>))}
                </Form.Select>
                <Button variant="success" className="me-2" onClick={saveEmployee}>{selected ? "Update" : "Add"}</Button>
                <Button variant="secondary" onClick={resetForm}>Clear</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card className="shadow">
            <Card.Body>
              <Form.Control className="mb-3" placeholder="Search Name / Email / Department / Role" value={search} onChange={(e) => setSearch(e.target.value)} />
              {filtered.length === 0 ? (
                <Alert variant="warning"> No Employees Found </Alert>) : (
                <Table bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((emp) => (
                      <tr key={emp.id}>
                        <td>{emp.id}</td>
                        <td>{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>
                          <Badge bg="primary">{emp.department}</Badge>
                        </td>
                        <td>
                          <Badge bg="success">{emp.role}</Badge>
                        </td>
                        <td>
                          <Button size="sm" variant="warning" className="me-2" onClick={() => editEmployee(emp)}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => deleteEmployee(emp.id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}