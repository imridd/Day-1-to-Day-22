import {
 useDispatch,
 useSelector
}
from "react-redux";

import {
 fetchCourses,
 createCourse,
 editCourse,
 removeCourse
}
from "../redux/course/courseThunk";

export const useCourses = () => {

 const dispatch =
 useDispatch();

 const {
  courses,
  loading
 } =
 useSelector(
  (state)=>
  state.courses
 );

 return {

  courses,

  loading,

  fetchCourses: () =>
   dispatch(
    fetchCourses()
   ),

  createCourse: (course) =>
   dispatch(
    createCourse(course)
   ),

  editCourse:(id,course)=>
   dispatch(
    editCourse({
      id,
      course
    })
   ),

  deleteCourse:(id)=>
   dispatch(
    removeCourse(id)
   )

 };

};