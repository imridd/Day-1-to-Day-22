import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchNavigation,
  saveNavigationRequest,
} from "../../services/pageService";
export const loadNavigation = createAsyncThunk(
  "navigation/load",
  fetchNavigation,
);
export const saveNavigation = createAsyncThunk(
  "navigation/save",
  saveNavigationRequest,
);
const slice = createSlice({
  name: "navigation",
  initialState: { position: "top" },
  reducers: {},
  extraReducers: (b) =>
    b
      .addCase(loadNavigation.fulfilled, (s, a) => {
        s.position = a.payload.position;
      })
      .addCase(saveNavigation.fulfilled, (s, a) => {
        s.position = a.payload.position;
      }),
});
export default slice.reducer;
