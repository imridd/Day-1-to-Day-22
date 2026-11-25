
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Chip,
  CircularProgress,
  Typography,
  Box,
  Tooltip
} from "@mui/material";

import {
  Visibility,
  Edit,
  Delete,
  Inventory2
} from "@mui/icons-material";

export default function ProductTable({
  products,
  loading,
  onView,
  onEdit,
  onDelete
}) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: "0 0 17px 17px",
        overflowX: "auto"
      }}
    >
      <Table className="product-table" sx={{ minWidth: 650 }}>

        {/* TABLE HEADER */}
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>PRODUCT NAME</TableCell>
            <TableCell>PRICE</TableCell>
            <TableCell>STOCK STATUS</TableCell>
            <TableCell align="center">ACTIONS</TableCell>
          </TableRow>
        </TableHead>

        {/* TABLE BODY */}
        <TableBody>

          {/* LOADING */}
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Box
                  sx={{
                    py: 6,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2
                  }}
                >
                  <CircularProgress
                    size={32}
                    thickness={4}
                    sx={{ color: "#7259e8" }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Loading your products...
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>

          ) : products.length === 0 ? (

            /* EMPTY STATE */
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Box
                  sx={{
                    py: 6,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  <Inventory2
                    sx={{
                      fontSize: 45,
                      color: "#b7addf"
                    }}
                  />

                  <Typography fontWeight={700}>
                    No products found
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Add your first product to get started.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>

          ) : (

            /* PRODUCT DATA */
            products.map(product => (
              <TableRow
                key={product.id}
                hover
                sx={{
                  transition: "background-color 0.2s",
                  "&:hover": {
                    backgroundColor: "#f8f7ff"
                  }
                }}
              >

                {/* ID */}
                <TableCell>
                  <Typography
                    fontSize={12}
                    fontWeight={700}
                    color="text.secondary"
                  >
                    #{product.id}
                  </Typography>
                </TableCell>

                {/* SKU */}
                <TableCell>
                  <Chip
                    label={product.sku}
                    size="small"
                    sx={{
                      backgroundColor: "#f0edff",
                      color: "#7055dc",
                      fontWeight: 700,
                      fontSize: 10,
                      borderRadius: "7px"
                    }}
                  />
                </TableCell>

                {/* PRODUCT NAME */}
                <TableCell>
                  <Typography
                    fontSize={13}
                    fontWeight={700}
                    color="#25283d"
                  >
                    {product.name}
                  </Typography>

                  <Typography
                    fontSize={10}
                    color="text.secondary"
                  >
                    Product ID: {product.id}
                  </Typography>
                </TableCell>

                {/* PRICE */}
                <TableCell>
                  <Typography
                    fontSize={13}
                    fontWeight={700}
                    color="#25283d"
                  >
                    ₹{Number(product.price).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </Typography>
                </TableCell>

                {/* STOCK STATUS */}
                <TableCell>
                  <Chip
                    label={
                      product.stock === 0
                        ? "Out of Stock"
                        : product.stock <= 5
                          ? `Low Stock · ${product.stock}`
                          : `In Stock · ${product.stock}`
                    }
                    size="small"
                    color={
                      product.stock === 0
                        ? "error"
                        : product.stock <= 5
                          ? "warning"
                          : "success"
                    }
                    sx={{
                      fontWeight: 700,
                      fontSize: 10,
                      borderRadius: "7px"
                    }}
                  />
                </TableCell>

                {/* ACTION BUTTONS */}
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 0.5
                    }}
                  >
                    <Tooltip title="View Product">
                      <IconButton
                        size="small"
                        onClick={() => onView(product)}
                        sx={{
                          color: "#3689dc",
                          backgroundColor: "#eaf4ff",
                          "&:hover": {
                            backgroundColor: "#d8eaff"
                          }
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit Product">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(product)}
                        sx={{
                          color: "#7259e8",
                          backgroundColor: "#f0edff",
                          "&:hover": {
                            backgroundColor: "#e4ddff"
                          }
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete Product">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(product.id)}
                        sx={{
                          color: "#e05264",
                          backgroundColor: "#fff0f1",
                          "&:hover": {
                            backgroundColor: "#ffe0e3"
                          }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>

              </TableRow>
            ))
          )}

        </TableBody>
      </Table>
    </TableContainer>
  );
}
