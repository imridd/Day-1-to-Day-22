import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchPages,
  savePageRequest,
  deletePageRequest,
} from "../../services/pageService";
export const loadPages = createAsyncThunk("pages/load", fetchPages);
export const savePage = createAsyncThunk("pages/save", savePageRequest);
export const removePage = createAsyncThunk("pages/remove", deletePageRequest);
const slice = createSlice({
  name: "pages",
  initialState: { items: [], status: "idle", error: null },
  reducers: {
    setPages: (s, a) => {
      s.items = a.payload;
    },
  },
  extraReducers: (b) => {
    b.addCase(loadPages.fulfilled, (s, a) => {
      s.items = a.payload;
      s.status = "succeeded";
    })
      .addCase(loadPages.pending, (s) => {
        s.status = "loading";
      })
      .addCase(loadPages.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.error.message;
      })
      .addCase(savePage.fulfilled, (s, a) => {
        const i = s.items.findIndex((p) => p.id === a.payload.id);
        if (i >= 0) s.items[i] = a.payload;
        else s.items.push(a.payload);
      })
      .addCase(removePage.fulfilled, (s, a) => {
        s.items = s.items.filter((p) => p.id !== a.payload);
      });
  },
});
export const { setPages } = slice.actions;
export default slice.reducer;

