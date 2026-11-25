
import { useState } from "react";

import {
  TextField,
  InputAdornment,
  IconButton
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function AppInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  error = false,
  helperText,
  required = false,
  fullWidth = true,
  multiline = false,
  rows = 3,
  startAdornment,
  disabled = false,
  sx = {},
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const actualType = isPassword
    ? showPassword ? "text" : "password"
    : type;

  return (
    <TextField
      name={name}
      label={label}
      value={value ?? ""}
      onChange={onChange}
      type={actualType}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      required={required}
      fullWidth={fullWidth}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      disabled={disabled}
      variant="outlined"
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "13px"
        },
        ...sx
      }}
      slotProps={{
        input: {
          startAdornment: startAdornment ? (
            <InputAdornment position="start">
              {startAdornment}
            </InputAdornment>
          ) : undefined,

          endAdornment: isPassword ? (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((current) => !current)}
                edge="end"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ) : undefined
        }
      }}
      {...props}
    />
  );
}
