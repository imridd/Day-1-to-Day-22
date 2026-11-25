import { useEffect, useRef, useLayoutEffect } from "react";
import {Alert,Button,Card,Col,Form,Row, Stack} from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
const AddProduct = ({categories,products,selectedProduct,clearEdit,onAddProduct,onUpdateProduct}) => {
    const productSchema = Yup.object({
        name: Yup.string()
            .min(3, "Minimum 3 characters")
            .max(60, "Maximum 60 characters")
            .required("Product Name Required"),
        category: Yup.string()
            .required("Category Required"),
        price: Yup.number()
            .typeError("Enter valid price")
            .positive("Price must be positive")
            .required("Price Required"),
        stock: Yup.number()
            .typeError("Enter valid stock")
            .integer("Whole number only")
            .min(0, "Stock cannot be negative")
            .required("Stock Required"),
        supplierEmail: Yup.string()
            .email("Enter valid email")
            .required("Supplier Email Required"),
        description: Yup.string()
            .min(10, "Minimum 10 characters")
            .required("Description Required")
    });
    const formik = useFormik({
        initialValues: {
            name: "",
            category: "",
            categoryId: "",
            price: "",
            stock: "",
            supplierEmail: "",
            description: ""
        },
        validationSchema: productSchema,
        onSubmit: async (values, helpers) => {
            try {
                if (selectedProduct) {
                    const updatedProduct = {...selectedProduct,
                        categoryId: Number(values.categoryId),
                        category: values.category,
                        price: Number(values.price),
                        stock: Number(values.stock),
                        description: values.description
                    };
                    await onUpdateProduct(selectedProduct.id, updatedProduct);
                    toast.success("Product Updated Successfully");
                } else {
                    const numericIds = products.map((p) => Number(p.id)).filter((id) => !isNaN(id));
                    const newId = numericIds.length > 0 ? Math.max(...numericIds) + 1: 1;
                    const newProduct = {
                        id: newId,
                        name: values.name,
                        categoryId: Number(values.categoryId),
                        category: values.category,
                        price: Number(values.price),
                        stock: Number(values.stock),
                        supplierEmail: values.supplierEmail,
                        description: values.description
                    };
                    await onAddProduct(newProduct);
                    toast.success("Product Added Successfully");
                }
                helpers.resetForm();
                clearEdit();
            } catch (error) {
                toast.error("Something went wrong");
            } finally {
                helpers.setSubmitting(false);
            }
        }
    });
    const textareaRef = useRef(null);
    useLayoutEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [formik.values.description]);
    useEffect(() => {
        if (selectedProduct) {
            formik.setValues({
                name: selectedProduct.name || "",
                category: selectedProduct.category || "",
                categoryId: selectedProduct.categoryId || "",
                price: selectedProduct.price || "",
                stock: selectedProduct.stock || "",
                supplierEmail:selectedProduct.supplierEmail || "",
                description:selectedProduct.description || ""
            });
        } else formik.resetForm();
    }, [selectedProduct]);
    const categoryInvalid = formik.touched.category &&formik.errors.category;
    return (
        <Card className="shadow border-0 mb-4">
            <Card.Header className={selectedProduct? "bg-warning text-dark": "bg-primary text-white"}>
                <h4 className="mb-0">
                    {selectedProduct ? "Edit Product": "Add Product"}
                </h4>
            </Card.Header>
            <Card.Body>
                {selectedProduct && (
                    <Alert variant="info"> Product Name & Supplier Email cannot be edited</Alert>
                )}
                <Form onSubmit={formik.handleSubmit}>
                    <fieldset disabled={formik.isSubmitting}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label> Product Name </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        placeholder="Enter Product Name"
                                        value={formik.values.name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={selectedProduct}
                                        isInvalid={formik.touched.name &&formik.errors.name}/>
                                    <Form.Control.Feedback type="invalid">{formik.errors.name}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select name="category" value={formik.values.category}
                                        onChange={(e) => {
                                            const selectedName=e.target.value;
                                            const categoryObj = categories.find((cat) =>cat.name ===selectedName);
                                            formik.setFieldValue("category",selectedName);
                                            formik.setFieldValue("categoryId",categoryObj?.id || "");}}
                                        onBlur={formik.handleBlur}
                                        isInvalid={categoryInvalid}>
                                        <option value=""> Select Category</option>
                                        {categories.map(
                                            (category) => (
                                                <option
                                                    key={category.id} value={category.name}>
                                                    {category.name}
                                                </option>))}
                                    </Form.Select>

                                    <Form.Control.Feedback
                                        type="invalid"
                                    >
                                        {formik.errors.category}
                                    </Form.Control.Feedback>

                                </Form.Group>

                            </Col>

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Price
                                    </Form.Label>

                                    <Form.Control
                                        type="number"
                                        name="price"
                                        placeholder="Enter Price"
                                        value={formik.values.price}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.price &&
                                            formik.errors.price
                                        }
                                    />

                                    <Form.Control.Feedback
                                        type="invalid"
                                    >
                                        {formik.errors.price}
                                    </Form.Control.Feedback>

                                </Form.Group>

                            </Col>

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Stock
                                    </Form.Label>

                                    <Form.Control
                                        type="number"
                                        name="stock"
                                        placeholder="Enter Stock"
                                        value={formik.values.stock}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.stock &&
                                            formik.errors.stock
                                        }
                                    />

                                    <Form.Control.Feedback
                                        type="invalid"
                                    >
                                        {formik.errors.stock}
                                    </Form.Control.Feedback>

                                </Form.Group>

                            </Col>

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Supplier Email
                                    </Form.Label>

                                    <Form.Control
                                        type="email"
                                        name="supplierEmail"
                                        placeholder="Enter Supplier Email"
                                        value={
                                            formik.values
                                                .supplierEmail
                                        }
                                        onChange={
                                            formik.handleChange
                                        }
                                        onBlur={
                                            formik.handleBlur
                                        }
                                        disabled={
                                            selectedProduct
                                        }
                                        isInvalid={
                                            formik.touched
                                                .supplierEmail &&
                                            formik.errors
                                                .supplierEmail
                                        }
                                    />

                                    <Form.Control.Feedback
                                        type="invalid"
                                    >
                                        {
                                            formik.errors
                                                .supplierEmail
                                        }
                                    </Form.Control.Feedback>

                                </Form.Group>

                            </Col>

                            <Col md={12}>

                                <Form.Group className="mb-3">

                                    <Form.Control
                                        ref={textareaRef}
                                        as="textarea"
                                        rows={1}
                                        name="description"
                                        placeholder="Enter Product Description"
                                        value={formik.values.description}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            formik.touched.description &&
                                            formik.errors.description
                                        }
                                        style={{
                                            minHeight: "120px",
                                            resize: "vertical",
                                            overflow: "hidden",
                                        }}
                                    />

                                    <Form.Control.Feedback
                                        type="invalid"
                                    >
                                        {
                                            formik.errors
                                                .description
                                        }
                                    </Form.Control.Feedback>

                                </Form.Group>

                            </Col>

                        </Row>

                        <Stack
                            direction="horizontal"
                            gap={2}
                        >

                            <Button
                                type="submit"
                                variant={
                                    selectedProduct
                                        ? "warning"
                                        : "primary"
                                }
                            >
                                {selectedProduct
                                    ? "Update Product"
                                    : "Add Product"}
                            </Button>

                            <Button
                                variant="secondary"
                                type="button"
                                onClick={() => {

                                    formik.resetForm();

                                    clearEdit();

                                }}
                            >
                                Reset
                            </Button>

                        </Stack>

                    </fieldset>

                </Form>

            </Card.Body>

        </Card>
    );
};

export default AddProduct;