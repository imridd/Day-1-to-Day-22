import { useEffect } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Box,
  InputAdornment,
  Divider,
  CircularProgress
} from "@mui/material";

import {
  Inventory2,
  Tag,
  CurrencyRupee,
  Layers,
  Add,
  Edit,
  Close
} from "@mui/icons-material";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { productSchema } from "../validation/productSchema";

export default function ProductForm({
  open,
  product,
  onClose,
  onSave
}) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: "",
      name: "",
      price: "",
      stock: ""
    }
  });

  useEffect(() => {
    reset(
      product
        ? {
            sku: product.sku,
            name: product.name,
            price: String(product.price),
            stock: String(product.stock)
          }
        : {
            sku: "",
            name: "",
            price: "",
            stock: ""
          }
    );
  }, [product, open, reset]);

  const editing = Boolean(product);

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "11px",
      backgroundColor: "#fafaff",
      fontSize: 13,
      "& fieldset": {
        borderColor: "#e7e7f0"
      },
      "&:hover fieldset": {
        borderColor: "#a99ae9"
      },
      "&.Mui-focused fieldset": {
        borderColor: "#7259e8",
        borderWidth: 1.5
      }
    },
    "& .MuiInputLabel-root": {
      fontSize: 13
    },
    "& .MuiFormHelperText-root": {
      marginLeft: 0
    }
  };

  const fields = [
    {
      name: "sku",
      label: "SKU",
      placeholder: "Example: ELEC-001",
      icon: <Tag fontSize="small" />
    },
    {
      name: "name",
      label: "Product Name",
      placeholder: "Enter product name",
      icon: <Inventory2 fontSize="small" />
    },
    {
      name: "price",
      label: "Price",
      placeholder: "Enter product price",
      icon: <CurrencyRupee fontSize="small" />,
      type: "number",
      inputProps: { min: 0, step: "0.01" }
    },
    {
      name: "stock",
      label: "Available Stock",
      placeholder: "Enter stock quantity",
      icon: <Layers fontSize="small" />,
      type: "number",
      inputProps: { min: 0, step: 1 }
    }
  ];

  return (
    <Dialog
      className="product-dialog"
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "11px",
                  background: "linear-gradient(135deg, #7259e8, #9b7cf5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white"
                }}
              >
                {editing ? <Edit /> : <Add />}
              </Box>

              <Box>
                <Typography
                  fontSize={19}
                  fontWeight={800}
                  color="#25283d"
                >
                  {editing ? "Edit Product" : "Add New Product"}
                </Typography>

                <Typography fontSize={11} color="text.secondary">
                  {editing
                    ? "Update your product information"
                    : "Fill in the details to add a new product"}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Button
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              minWidth: 35,
              width: 35,
              height: 35,
              borderRadius: "10px",
              color: "#777",
              backgroundColor: "#f3f4f8"
            }}
          >
            <Close fontSize="small" />
          </Button>
        </Stack>
      </DialogTitle>

      <Divider />

      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent sx={{ pt: 3 }}>
          <Box
            sx={{
              backgroundColor: "#f5f3ff",
              border: "1px solid #e9e3ff",
              borderRadius: "11px",
              p: 1.5,
              mb: 3
            }}
          >
            <Typography fontSize={12} fontWeight={700} color="#7259e8">
              PRODUCT INFORMATION
            </Typography>

            <Typography fontSize={11} color="#777">
              All fields are required. Please enter valid product details.
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            {fields.map((item) => (
              <Controller
                key={item.name}
                name={item.name}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={item.label}
                    placeholder={item.placeholder}
                    type={item.type || "text"}
                    fullWidth
                    size="medium"
                    error={!!errors[item.name]}
                    helperText={errors[item.name]?.message}
                    sx={inputStyle}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box sx={{ color: "#8875dc", display: "flex" }}>
                              {item.icon}
                            </Box>
                          </InputAdornment>
                        )
                      },
                      htmlInput: item.inputProps || {}
                    }}
                  />
                )}
              />
            ))}
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            gap: 1
          }}
        >
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              px: 2.5,
              color: "#666",
              borderColor: "#e0e0e8",
              fontWeight: 700,
              "&:hover": {
                borderColor: "#aaa",
                backgroundColor: "#f8f8fb"
              }
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting
                ? <CircularProgress size={16} color="inherit" />
                : editing
                  ? <Edit />
                  : <Add />
            }
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              px: 3,
              py: 1,
              fontWeight: 700,
              background: "linear-gradient(135deg, #7259e8, #9b7cf5)",
              boxShadow: "0 4px 12px rgba(114,89,232,0.2)",
              "&:hover": {
                background: "linear-gradient(135deg, #6046d0, #8664e8)",
                boxShadow: "0 5px 15px rgba(114,89,232,0.3)"
              }
            }}
          >
            {isSubmitting
              ? "Saving..."
              : editing
                ? "Update Product"
                : "Create Product"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}