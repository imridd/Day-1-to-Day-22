
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../services/courseService";

// READ COURSES
export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (_, { rejectWithValue }) => {
    try {
      return await getCourses();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// CREATE COURSE
export const addCourse = createAsyncThunk(
  "courses/addCourse",
  async (courseData, { rejectWithValue }) => {
    try {
      return await createCourse(courseData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// UPDATE COURSE
export const editCourse = createAsyncThunk(
  "courses/editCourse",
  async ({ id, courseData }, { rejectWithValue }) => {
    try {
      return await updateCourse(id, courseData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// DELETE COURSE
export const removeCourse = createAsyncThunk(
  "courses/removeCourse",
  async (id, { rejectWithValue }) => {
    try {
      await deleteCourse(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// INITIAL STATE
const initialState = {
  courses: [],
  loading: false,
  saving: false,
  error: null,
  mutationError: null,
};

// COURSE SLICE
const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      // FETCH COURSES
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD COURSE
      .addCase(addCourse.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })
      .addCase(addCourse.fulfilled, (state, action) => {
        state.saving = false;
        state.courses.push(action.payload);
      })
      .addCase(addCourse.rejected, (state, action) => {
        state.saving = false;
        state.mutationError = action.payload;
      })

      // EDIT COURSE
      .addCase(editCourse.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })
      .addCase(editCourse.fulfilled, (state, action) => {
        state.saving = false;

        state.courses = state.courses.map((course) =>
          course.id === action.payload.id
            ? action.payload
            : course
        );
      })
      .addCase(editCourse.rejected, (state, action) => {
        state.saving = false;
        state.mutationError = action.payload;
      })

      // DELETE COURSE
      .addCase(removeCourse.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })
      .addCase(removeCourse.fulfilled, (state, action) => {
        state.saving = false;

        state.courses = state.courses.filter(
          (course) => course.id !== action.payload
        );
      })
      .addCase(removeCourse.rejected, (state, action) => {
        state.saving = false;
        state.mutationError = action.payload;
      });
  },
});

export default courseSlice.reducer;
