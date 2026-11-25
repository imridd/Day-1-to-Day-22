import { useEffect, useState } from "react";

import {
  Typography,
  Button,
  Paper,
  Snackbar,
  Alert
} from "@mui/material";

import {
  Add,
  Inventory2,
  Dashboard as DashboardIcon,
  ShoppingBag,
  TrendingUp
} from "@mui/icons-material";

import Dashboard from "./components/Dashboard";
import ProductTable from "./components/ProductTable";
import ProductForm from "./components/ProductForm";
import ProductView from "./components/ProductView";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from "./services/productService";

import "./App.css";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activePage, setActivePage] = useState("dashboard");

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success"
  });

  function showToast(message, type = "success") {
    setToast({ open: true, message, type });
  }

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function openAddForm() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEditForm(product) {
    setEditing(product);
    setFormOpen(true);
  }

  async function saveProduct(data) {
    try {
      if (editing) {
        await updateProduct(editing.id, data);
        showToast("Product updated successfully");
      } else {
        await createProduct(data);
        showToast("Product created successfully");
      }

      setFormOpen(false);
      setEditing(null);
      await loadProducts();
    } catch (error) {
      showToast(error.message, "error");
      throw error;
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await deleteProduct(id);
      showToast("Product deleted successfully");
      await loadProducts();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  function handleView(product) {
    setSelected(product);
    setViewOpen(true);
  }

  // SIDEBAR NAVIGATION
  function navigateTo(page) {
    setActivePage(page);
  }

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">
            <Inventory2 />
          </div>
          <span className="brand-name">NEXORA</span>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <div
          className={`nav-item ${activePage === "dashboard" ? "active" : ""}`}
          onClick={() => navigateTo("dashboard")}
          role="button"
          tabIndex={0}
          onKeyDown={event => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              navigateTo("dashboard");
            }
          }}
        >
          <DashboardIcon fontSize="small" />
          Dashboard
        </div>

        <div
          className={`nav-item ${activePage === "products" ? "active" : ""}`}
          onClick={() => navigateTo("products")}
          role="button"
          tabIndex={0}
          onKeyDown={event => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              navigateTo("products");
            }
          }}
        >
          <ShoppingBag fontSize="small" />
          Products
        </div>

        <div className="sidebar-label" style={{ marginTop: 30 }}>
          MANAGEMENT
        </div>

        <div
          className={`nav-item ${activePage === "inventory" ? "active" : ""}`}
          onClick={() => navigateTo("inventory")}
          role="button"
          tabIndex={0}
          onKeyDown={event => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              navigateTo("inventory");
            }
          }}
        >
          <TrendingUp fontSize="small" />
          Inventory Overview
        </div>

        <div className="sidebar-bottom">
          <b>NEXORA INVENTORY</b>
          <br />
          Product management workspace
          <br />
          <span style={{ color: "#8174ed" }}>
            ● System operational
          </span>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-label">
            WORKSPACE / {activePage.toUpperCase()}
          </div>

          <div className="profile">
            <div className="profile-avatar">A</div>

            <div>
              <Typography fontSize={12} fontWeight={800}>
                Admin
              </Typography>

              <Typography fontSize={10} color="text.secondary">
                Administrator
              </Typography>
            </div>
          </div>
        </div>

        {/* DASHBOARD PAGE */}
        {activePage === "dashboard" && (
          <Dashboard
            products={products}
            onNavigate={() => navigateTo("products")}
          />
        )}

        {/* PRODUCTS PAGE */}
        {activePage === "products" && (
          <>
            <div className="page-heading">
              <div>
                <h1>Product Management</h1>
                <p>Manage, monitor and organize your inventory.</p>
              </div>

              <Button
                className="add-button"
                variant="contained"
                startIcon={<Add />}
                onClick={openAddForm}
              >
                Add Product
              </Button>
            </div>

            <div className="stats-grid">

              <div className="stat-card">
                <div className="stat-top">
                  Total Products
                  <div className="stat-icon purple">
                    <ShoppingBag fontSize="small" />
                  </div>
                </div>

                <div className="stat-value">
                  {products.length}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  Total Stock Units
                  <div className="stat-icon blue">
                    <Inventory2 fontSize="small" />
                  </div>
                </div>

                <div className="stat-value">
                  {products.reduce(
                    (sum, product) => sum + Number(product.stock),
                    0
                  ).toLocaleString("en-IN")}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  Inventory Value
                  <div className="stat-icon green">
                    <TrendingUp fontSize="small" />
                  </div>
                </div>

                <div className="stat-value">
                  ₹{products.reduce(
                    (sum, product) =>
                      sum + Number(product.price) * Number(product.stock),
                    0
                  ).toLocaleString("en-IN", {
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>

            </div>

            <Paper className="table-card" elevation={0}>
              <div className="table-toolbar">
                <div>
                  <h2>All Products</h2>
                  <p>Complete list of products in your database</p>
                </div>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={loadProducts}
                  sx={{
                    textTransform: "none",
                    borderRadius: "9px",
                    fontWeight: 700
                  }}
                >
                  Refresh
                </Button>
              </div>

              <ProductTable
                products={products}
                loading={loading}
                onView={handleView}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            </Paper>
          </>
        )}

        {/* INVENTORY PAGE */}
        {activePage === "inventory" && (
          <Dashboard
            products={products}
            onNavigate={() => navigateTo("products")}
          />
        )}

      </main>

      {/* ADD / EDIT */}
      <ProductForm
        open={formOpen}
        product={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={saveProduct}
      />

      {/* VIEW */}
      <ProductView
        open={viewOpen}
        product={selected}
        onClose={() => setViewOpen(false)}
      />

      {/* NOTIFICATION */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() =>
          setToast(prev => ({ ...prev, open: false }))
        }
      >
        <Alert
          severity={toast.type}
          variant="filled"
          onClose={() =>
            setToast(prev => ({ ...prev, open: false }))
          }
        >
          {toast.message}
        </Alert>
      </Snackbar>

    </div>
  );
}