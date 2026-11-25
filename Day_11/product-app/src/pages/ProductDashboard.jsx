import { useEffect, useState } from "react";
import {Container,Row,Col,Card, Button} from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import AddProduct from "../components/AddProduct";
import AddCategory from "../components/AddCategory";
import ProductTable from "../components/ProductTable";
import {getProducts,addProduct,updateProduct,deleteProduct} from "../services/productService";
import {getCategories,addCategory} from "../services/categoryService";
const ProductDashboard = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedProduct, setSelectedProduct] =useState(null);
    const [showProducts, setShowProducts] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);
    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.log("Error Loading Products",error);
        }
    };
    const loadCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.log("Error Loading Categories",error);
        }
    };
    const addProductHandler = async (product
    ) => {
        try {
            await addProduct(product);
            loadProducts();
        } catch (error) {
            console.log(error);
        }
    };
    const updateProductHandler =async (id, updatedProduct) => {
            try {
                await updateProduct(id,updatedProduct);
                loadProducts();
                setSelectedProduct(null);
            } catch (error) {
                console.log(error);
            }
        };
    const deleteProductHandler =async (id) => {
            try {
                await deleteProduct(id);
                loadProducts();
            } catch (error) {
                console.log(error);
            }
        };
    const addCategoryHandler =async (category) => {
            try {
                await addCategory(category);
                loadCategories();
            } catch (error) {
                console.log(error);
            }
        };

    const editHandler = (product
    ) => {
        setSelectedProduct(product);
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };
    const clearEdit = () => {
        setSelectedProduct(null);
    };
    const totalProducts =products.length;
    const totalCategories =categories.length;
    const totalInventory = products.reduce(( total,product) =>total +Number(product.stock),0);
    return (
        <Container fluid className="py-4 bg-light min-vh-100">
            <ToastContainer position="top-right" />
            <Row className="mb-4">
                <Col>
                    <Card
                        className="shadow border-0 text-center"
                        style={{
                            background:
                                "linear-gradient(135deg,#0d6efd,#4f9cff)",
                            color: "white",
                        }}>
                        <Card.Body>
                            <h1 className="fw-bold">
                                All in one Product Store
                            </h1>
                            <p className="mb-0">
                                Get whatever you want
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="shadow-sm border-0 text-center h-100">
                        <Card.Body>
                            <h6 className="text-muted">Total Products</h6>
                            <h2 className="text-primary fw-bold">
                                {totalProducts}
                            </h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 text-center h-100">
                        <Card.Body>
                            <h6 className="text-muted">Total Categories</h6>
                            <h2 className="text-success fw-bold">
                                {totalCategories}
                            </h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 text-center h-100">
                        <Card.Body>
                            <h6 className="text-muted">Total Inventory </h6>
                            <h2 className="text-warning fw-bold">{totalInventory}</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="g-4">
                <Col lg={6}>
                    <AddProduct
                        categories={categories}
                        products={products}
                        selectedProduct={selectedProduct}
                        clearEdit={clearEdit}
                        onAddProduct={addProductHandler}
                        onUpdateProduct={updateProductHandler}
                    />
                </Col>
                <Col lg={6}>
                    <AddCategory categories={categories}addCategoryHandler={addCategoryHandler}/>
                </Col>
            </Row>
            <Row className="mt-5">
                <Col className="text-center">
                    <Button variant={showProducts ? "danger" : "primary"} size="lg" onClick={() =>setShowProducts(!showProducts)} >
                        {showProducts ? "Hide Product List" : "Show Product List"}
                    </Button>
                </Col>
            </Row>
            {showProducts && (
                <Row className="mt-4">
                    <Col>
                        <Card className="shadow border-0">
                            <Card.Header className="bg-primary text-white fw-bold text-center">
                                Product List
                            </Card.Header>
                            <Card.Body>
                                <ProductTable
                                    products={products}
                                    onEdit={editHandler}
                                    onDelete={deleteProductHandler}
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};
export default ProductDashboard;