import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import EmployeeForm from "../../pages/employee/EmployeeForm";

function EmployeeModal({
    show,
    onHide,
    onSave,
    employee,
}) {
    const initialState = {
        id: "",
        name: "",
        email: "",
        department: "",
        designation: "",
        salary: "",
        joiningDate: ""
    };

    const [formData, setFormData] =
        useState(initialState);

    useEffect(() => {
        if (employee) {
            setFormData(employee);
        } else {
            setFormData(initialState);
        }
    }, [employee, show]);
    const handleSubmit = async (values) => {
        await onSave({
            ...formData,
            ...values,
        });

        onHide();
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {employee
                        ? "Edit Employee"
                        : "Add Employee"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <EmployeeForm
                    formData={formData}
                    handleSubmit={handleSubmit}
                />
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={onHide}
                >
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EmployeeModal;