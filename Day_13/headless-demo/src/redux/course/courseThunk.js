
import { createAsyncThunk }
from "@reduxjs/toolkit";

import * as courseService
from "../../services/courseService";

export const fetchCourses =
createAsyncThunk(
  "courses/fetchCourses",
  async () =>
    await courseService.getCourses()
);

export const createCourse =
createAsyncThunk(
  "courses/createCourse",
  async (course) =>
    await courseService.addCourse(course)
);

export const editCourse =
createAsyncThunk(
  "courses/editCourse",
  async ({ id, course }) =>
    await courseService.updateCourse(
      id,
      course
    )
);

export const removeCourse =
createAsyncThunk(
  "courses/removeCourse",
  async (id) =>
    await courseService.deleteCourse(id)
);
