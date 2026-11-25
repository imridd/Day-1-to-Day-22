import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  Chip,
  Divider
} from "@mui/material";

import {
  Inventory2,
  Tag,
  CurrencyRupee,
  Layers,
  Fingerprint,
  Close
} from "@mui/icons-material";

export default function ProductView({
  open,
  product,
  onClose
}) {
  if (!product) return null;

  const details = [
    {
      label: "Product ID",
      value: `#${product.id}`,
      icon: <Fingerprint />,
      color: "#7259e8",
      background: "#f0edff"
    },
    {
      label: "SKU",
      value: product.sku,
      icon: <Tag />,
      color: "#3689dc",
      background: "#eaf4ff"
    },
    {
      label: "Product Name",
      value: product.name,
      icon: <Inventory2 />,
      color: "#16a085",
      background: "#e7f8f3"
    },
    {
      label: "Price",
      value: `₹${Number(product.price).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      icon: <CurrencyRupee />,
      color: "#d68a24",
      background: "#fff5e5"
    },
    {
      label: "Available Stock",
      value: `${product.stock} units`,
      icon: <Layers />,
      color: "#e05264",
      background: "#fff0f1"
    }
  ];

  return (
    <Dialog
      className="product-dialog"
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography fontSize={19} fontWeight={800} color="#25283d">
              Product Details
            </Typography>

            <Typography fontSize={12} color="text.secondary">
              Complete product information
            </Typography>
          </Box>

          <Button
            onClick={onClose}
            sx={{
              minWidth: 35,
              width: 35,
              height: 35,
              borderRadius: "10px",
              color: "#777",
              backgroundColor: "#f3f4f8",
              fontSize: 18
            }}
          >
            <Close fontSize="small" />
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            background: "linear-gradient(135deg, #7259e8, #9b7cf5)",
            borderRadius: "15px",
            p: 2.5,
            mb: 2.5,
            color: "white"
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "13px",
                backgroundColor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Inventory2 sx={{ fontSize: 27 }} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography fontSize={17} fontWeight={800}>
                {product.name}
              </Typography>

              <Typography fontSize={12} sx={{ opacity: 0.85 }}>
                SKU: {product.sku}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack spacing={1.5}>
          {details.map((item) => (
            <Box
              key={item.label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                border: "1px solid #eeeef4",
                borderRadius: "12px",
                backgroundColor: "#fff"
              }}
            >
              <Box
                sx={{
                  width: 39,
                  height: 39,
                  flexShrink: 0,
                  borderRadius: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: item.color,
                  backgroundColor: item.background
                }}
              >
                {item.icon}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontSize={11} color="text.secondary">
                  {item.label}
                </Typography>

                <Typography
                  fontSize={13}
                  fontWeight={700}
                  color="#25283d"
                  sx={{ overflowWrap: "anywhere" }}
                >
                  {item.value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography fontSize={12} color="text.secondary">
            Current stock status
          </Typography>

          <Chip
            label={
              product.stock === 0
                ? "Out of Stock"
                : product.stock <= 5
                  ? "Low Stock"
                  : "In Stock"
            }
            size="small"
            color={
              product.stock === 0
                ? "error"
                : product.stock <= 5
                  ? "warning"
                  : "success"
            }
            sx={{ fontWeight: 700, borderRadius: "7px" }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "10px",
            py: 1,
            background: "linear-gradient(135deg, #7259e8, #9b7cf5)",
            "&:hover": {
              background: "linear-gradient(135deg, #6046d0, #8664e8)"
            }
          }}
        >
          Close Details
        </Button>
      </DialogActions>
    </Dialog>
  );
}