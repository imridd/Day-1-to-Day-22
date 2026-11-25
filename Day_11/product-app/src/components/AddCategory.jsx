import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { useState } from "react";
const AddCategory = ({ categories, addCategoryHandler }) => {
    const [showCategories, setShowCategories] = useState(false);
    const categorySchema = Yup.object({
        name: Yup.string().min(3, "Minimum 3 characters").max(50, "Maximum 50 characters").required("Category Name Required"),
        description: Yup.string().min(10, "Minimum 10 characters").max(200, "Maximum 200 characters").required("Description Required")
    });
    const formik = useFormik({
        initialValues: {
            name: "",
            description: ""
        },
        validationSchema: categorySchema,
        onSubmit: async (values, helpers) => {
            try {
                const numericIds = categories.map((category) => Number(category.id)).filter((id) => !isNaN(id));
                const newId = numericIds.length > 0? Math.max(...numericIds) + 1: 1;
                const newCategory = {
                    id: newId,
                    name: values.name,
                    description: values.description

                };
                await addCategoryHandler(newCategory);
                toast.success("Category Added Successfully");
                helpers.resetForm();

            } catch (error) {
                toast.error("Unable to Add Category");
            }
        }
    });
    return (
        <Card className="shadow border-0">
            <Card.Header className="bg-success text-white">
                <h4 className="mb-0">Add Category</h4>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={formik.handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label> Category Name </Form.Label>
                                <Form.Control type="text"
                                    name="name"
                                    placeholder="Enter Category Name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.name &&formik.errors.name}/>
                                <Form.Control.Feedback type="invalid">{formik.errors.name}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="description"
                                    placeholder="Enter Description"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.description &&formik.errors.description}/>
                                <Form.Control.Feedback type="invalid">{formik.errors.description}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button type="submit" variant="success">Add Category</Button>
                </Form>
            </Card.Body>
            <Card.Footer>
                <div className="text-center mb-3">
                    <Button
                        variant={showCategories ? "danger" : "primary"}
                        onClick={() =>
                            setShowCategories(!showCategories)
                        }>
                        {showCategories? "Hide Categories": "Show Categories"}
                    </Button>
                </div>
                {showCategories && (
                    <>
                        <h5 className="mb-3 text-center">Available Categories</h5>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Category ID</th>
                                    <th>Category Name</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length > 0 ? (
                                    categories.map((category) => (
                                        <tr key={category.id}>
                                            <td>{category.id}</td>
                                            <td>{category.name}</td>
                                            <td>{category.description}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center">No Categories Available</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </>
                )}
            </Card.Footer>
        </Card>
    );
};

export default AddCategory;