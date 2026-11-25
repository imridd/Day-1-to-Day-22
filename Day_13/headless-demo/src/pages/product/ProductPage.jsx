
import { useState, useEffect } from "react";
import ProductModal from "../../components/modals/ProductModal";
import { useProducts } from "../../hooks/useProducts";
import ProductViewModal from "../../components/modals/ProductViewModal";
import ProductCard from "./ProductCard";
import { toast } from "react-toastify";
import CardList from "../../components/headless/CardList";
import DataGrid from "../../components/headless/DataGrid";
import DataList from "../../components/headless/DataList";
function ProductsPage() {
  const {
    products,
    fetchProducts,
    createProduct,
    editProduct,
    deleteProduct,
  } = useProducts();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortOrder, setSortOrder] = useState("price-asc");
  const [showView, setShowView] = useState(false);
  const [viewType, setViewType] =
    useState("table");

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts =
    [...products]
      .filter((product) =>
        product.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      )
      .sort((a, b) => {
        switch (sortOrder) {
          case "price-asc":
            return a.price - b.price;

          case "price-desc":
            return b.price - a.price;

          case "stock-asc":
            return a.stock - b.stock;

          case "stock-desc":
            return b.stock - a.stock;

          default:
            return 0;
        }
      });
  const tableData = filteredProducts.map(
    (product, index) => ({
      ...product,
      sno: index + 1,
    })
  );

  const columns = [
    {
      key: "sno",
      label: "SNO"
    },
    {
      key: "name",
      label: "Product"
    },
    {
      key: "category",
      label: "Category"
    },
    {
      key: "price",
      label: "Price"
    },
    {
      key: "stock",
      label: "Stock"
    }
  ];
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setShowView(true);

    toast.info(
      `${product.name} details opened 👀`
    );
  };


  const handleDelete = async (id) => {
    toast.error("Product is removed from the cart");

    await deleteProduct(id);

    fetchProducts();
  };

  const handleSave = async (
    productData
  ) => {
    if (selectedProduct) {
      await editProduct(
        selectedProduct.id,
        {
          ...productData,
          id: selectedProduct.id,
        }
      );
      toast.info(
        "Details updated"
      );
    } else {
      await createProduct(
        productData
      ); toast.success(
        "Product added to the cart table"
      );
    }

    await fetchProducts();

    setShowModal(false);

    setSelectedProduct(null);
  };
  return (

    <div>

      <div
        className="
 d-flex
 justify-content-between
 align-items-center
 mb-4"
      >

        <input

          className="form-control"

          style={{
            width: "250px"
          }}

          placeholder=
          "Search Product"

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

        />
        <button
          className="btn btn-primary"
          onClick={handleAddProduct}
        >
          Add Product
        </button>
        <select
          className="form-select"
          style={{
            width: "220px",
          }}
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(
              e.target.value
            )
          }
        >
          <option value="price-asc">
            Price Low → High
          </option>

          <option value="price-desc">
            Price High → Low
          </option>

          <option value="stock-asc">
            Stock Low → High
          </option>

          <option value="stock-desc">
            Stock High → Low
          </option>
        </select>
        <select
          className="form-select w-auto"
          value={viewType}
          onChange={(e) =>
            setViewType(e.target.value)
          }
        >
          <option value="card">
            Card View
          </option>

          <option value="table">
            Table View
          </option>

          <option value="list">
            List View
          </option>
        </select>
      </div>
      {filteredProducts.length > 0 ? (
        <>
          {viewType === "card" && (
            <CardList
              data={filteredProducts}
              renderItem={(product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            />
          )}

          {viewType === "table" && (
            <DataGrid
              columns={columns}
              data={tableData}
              renderActions={(row) => (
                <>
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() =>
                      handleView(row)
                    }
                  >
                    View
                  </button>

                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() =>
                      handleEdit(row)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() =>
                      handleDelete(
                        row.id
                      )
                    }
                  >
                    Delete
                  </button>
                </>
              )}
            />
          )}

          {viewType === "list" && (
            <DataList
              data={filteredProducts}
              renderItem={(product) => (
                <div
                  key={product.id}
                  className="course-item"
                >
                  <div>
                    <h5>
                      {product.name}
                    </h5>

                    <p>
                      Category:
                      {product.category}
                    </p>

                    <p>
                      Price: ₹
                      {product.price}
                    </p>

                    <p>
                      Stock:
                      {product.stock}
                    </p>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        handleView(
                          product
                        )
                      }
                    >
                      View
                    </button>

                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() =>
                        handleEdit(
                          product
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDelete(
                          product.id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            />
          )}
        </>
      ) : (
        <div className="text-center mt-5">
          No Products Found
        </div>
      )}
      <ProductModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedProduct(null);
        }}
        onSave={handleSave}
        product={selectedProduct}
      />
      <ProductViewModal
        show={showView}
        onHide={() =>
          setShowView(false)
        }
        product={selectedProduct}
      />

    </div>

  );
}

export default ProductsPage;