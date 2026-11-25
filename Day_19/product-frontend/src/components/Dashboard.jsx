
import {
  Typography,
  Button,
  Paper,
  Box,
  Chip,
  Divider
} from "@mui/material";

import {
  ShoppingBag,
  Inventory2,
  TrendingUp,
  Warning,
  ReportProblem,
  ArrowForward
} from "@mui/icons-material";

export default function Dashboard({ products = [], onNavigate }) {
  // Calculate total stock
  const totalStock = products.reduce(
    (sum, product) => sum + (Number(product.stock) || 0),
    0
  );

  // Calculate total inventory value
  const inventoryValue = products.reduce(
    (sum, product) =>
      sum +
      (Number(product.price) || 0) *
      (Number(product.stock) || 0),
    0
  );

  // Find products with low stock (1 to 5 units)
  const lowStock = products.filter(product => {
    const stock = Number(product.stock);
    return stock > 0 && stock <= 5;
  });

  // Find products with zero stock
  const outOfStock = products.filter(
    product => Number(product.stock) === 0
  );

  // Get latest 5 products
  const recentProducts = [...products]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);

  return (
    <>
      {/* HEADER */}
      <div className="page-heading">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Here's what's happening with your inventory today.</p>
        </div>

        <Button
          className="add-button"
          variant="contained"
          startIcon={<ShoppingBag />}
          onClick={onNavigate}
        >
          View Products
        </Button>
      </div>

      {/* STATISTICS */}
      <div className="stats-grid">

        {/* TOTAL PRODUCTS */}
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

          <Typography fontSize={11} color="text.secondary">
            Products in database
          </Typography>
        </div>

        {/* TOTAL STOCK */}
        <div className="stat-card">
          <div className="stat-top">
            Total Stock Units

            <div className="stat-icon blue">
              <Inventory2 fontSize="small" />
            </div>
          </div>

          <div className="stat-value">
            {totalStock.toLocaleString("en-IN")}
          </div>

          <Typography fontSize={11} color="text.secondary">
            Available inventory units
          </Typography>
        </div>

        {/* INVENTORY VALUE */}
        <div className="stat-card">
          <div className="stat-top">
            Inventory Value

            <div className="stat-icon green">
              <TrendingUp fontSize="small" />
            </div>
          </div>

          <div className="stat-value">
            ₹{inventoryValue.toLocaleString("en-IN", {
              maximumFractionDigits: 2
            })}
          </div>

          <Typography fontSize={11} color="text.secondary">
            Total stock value
          </Typography>
        </div>

      </div>

      {/* STOCK ALERTS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr"
          },
          gap: 2,
          mb: 3
        }}
      >

        {/* LOW STOCK */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: "16px",
            border: "1px solid #ffe4b8",
            backgroundColor: "#fffaf1"
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                backgroundColor: "#fff0d5",
                color: "#d68a24",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Warning />
            </Box>

            <Box>
              <Typography fontSize={12} color="text.secondary">
                Low Stock Products
              </Typography>

              <Typography
                fontSize={23}
                fontWeight={800}
                color="#b97816"
              >
                {lowStock.length}
              </Typography>
            </Box>
          </Box>

          <Typography
            fontSize={11}
            color="text.secondary"
            sx={{ mt: 1.5 }}
          >
            Products with 1 to 5 units remaining.
          </Typography>
        </Paper>

        {/* OUT OF STOCK */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: "16px",
            border: "1px solid #ffd9de",
            backgroundColor: "#fff7f8"
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                backgroundColor: "#ffe6e9",
                color: "#e05264",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <ReportProblem />
            </Box>

            <Box>
              <Typography fontSize={12} color="text.secondary">
                Out of Stock
              </Typography>

              <Typography
                fontSize={23}
                fontWeight={800}
                color="#d74457"
              >
                {outOfStock.length}
              </Typography>
            </Box>
          </Box>

          <Typography
            fontSize={11}
            color="text.secondary"
            sx={{ mt: 1.5 }}
          >
            Products that need restocking.
          </Typography>
        </Paper>

      </Box>

      {/* RECENT PRODUCTS */}
      <Paper
        className="table-card"
        elevation={0}
        sx={{ overflow: "hidden" }}
      >

        {/* SECTION HEADER */}
        <Box
          sx={{
            p: 2.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Box>
            <Typography
              fontSize={17}
              fontWeight={800}
              color="#25283d"
            >
              Recent Products
            </Typography>

            <Typography fontSize={11} color="text.secondary">
              Latest products in your inventory
            </Typography>
          </Box>

          <Button
            onClick={onNavigate}
            endIcon={<ArrowForward />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: "#7259e8"
            }}
          >
            View All
          </Button>
        </Box>

        <Divider />

        {/* EMPTY STATE */}
        {recentProducts.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 6
            }}
          >
            <Inventory2
              sx={{
                fontSize: 40,
                color: "#b7addf"
              }}
            />

            <Typography fontWeight={700} sx={{ mt: 1 }}>
              No products available
            </Typography>

            <Typography fontSize={12} color="text.secondary">
              Add products to see them here.
            </Typography>
          </Box>
        ) : (

          /* PRODUCT LIST */
          recentProducts.map(product => {
            const stock = Number(product.stock) || 0;
            const price = Number(product.price) || 0;

            const stockLabel =
              stock === 0
                ? "Out of Stock"
                : stock <= 5
                  ? "Low Stock"
                  : "In Stock";

            const stockColor =
              stock === 0
                ? "error"
                : stock <= 5
                  ? "warning"
                  : "success";

            return (
              <Box
                key={product.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  px: 2.5,
                  py: 2,
                  borderBottom: "1px solid #f0f0f5",
                  "&:hover": {
                    backgroundColor: "#faf9ff"
                  }
                }}
              >

                {/* PRODUCT INFORMATION */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    minWidth: 0
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      minWidth: 38,
                      borderRadius: "11px",
                      backgroundColor: "#f0edff",
                      color: "#7259e8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Inventory2 fontSize="small" />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      fontSize={13}
                      fontWeight={700}
                      noWrap
                    >
                      {product.name}
                    </Typography>

                    <Typography
                      fontSize={11}
                      color="text.secondary"
                      noWrap
                    >
                      {product.sku} · ID #{product.id}
                    </Typography>
                  </Box>
                </Box>

                {/* PRICE AND STOCK STATUS */}
                <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                  <Typography fontSize={13} fontWeight={700}>
                    ₹{price.toLocaleString("en-IN")}
                  </Typography>

                  <Chip
                    size="small"
                    label={stockLabel}
                    color={stockColor}
                    sx={{
                      mt: 0.5,
                      fontSize: 10,
                      fontWeight: 700
                    }}
                  />
                </Box>

              </Box>
            );
          })
        )}

      </Paper>
    </>
  );
}
