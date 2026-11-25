
import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import CourseForm from "../../pages/course/CourseForm";

function CourseModal({
    show,
    onHide,
    onSave,
    course,
}) {
    const initialState = {
        id: "",
        name: "",
        trainer: "",
        duration: "",
        fee: "",
        enrolledStudents: "",
    };

    const [formData, setFormData] =
        useState(initialState);

    useEffect(() => {
        if (course) {
            setFormData(course);
        } else {
            setFormData(initialState);
        }
    }, [course, show]);
    const handleSubmit = async (
        values
    ) => {
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
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {course
                        ? "Edit Course"
                        : "Add Course"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <CourseForm
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

export default CourseModal;