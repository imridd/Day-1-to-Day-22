import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import ProductForm from "../../pages/product/ProductForm";

function ProductModal({
    show,
    onHide,
    onSave,
    product,
}) {
    const initialState = {
        id: "",
        name: "",
        category: "",
        price: "",
        stock: "",
    };

    const [formData, setFormData] =
        useState(initialState);

    useEffect(() => {
        if (product) {
            setFormData(product);
        } else {
            setFormData(initialState);
        }
    }, [product, show]);
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
                    {product
                        ? "Edit Product"
                        : "Add Product"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <ProductForm
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

export default ProductModal;