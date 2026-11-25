
import axiosClient from "../api/axiosClient";

const COURSE_URL = "/courses";

export const getCourses = async () => {
  const response =
    await axiosClient.get(COURSE_URL);

  return response.data;
};

export const addCourse = async (course) => {
  const response =
    await axiosClient.post(
      COURSE_URL,
      course
    );

  return response.data;
};

export const updateCourse = async (
  id,
  course
) => {
  const response =
    await axiosClient.put(
      `${COURSE_URL}/${id}`,
      course
    );

  return response.data;
};

export const deleteCourse = async (id) => {
  await axiosClient.delete(
    `${COURSE_URL}/${id}`
  );

  return id;
};
