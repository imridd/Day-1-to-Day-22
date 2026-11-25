
import { createSlice }
from "@reduxjs/toolkit";

import {
 fetchCourses,
 createCourse,
 editCourse,
 removeCourse
}
from "./courseThunk";

const initialState = {
 courses: [],
 loading: false,
 error: null
};

const courseSlice =
createSlice({

 name:"courses",

 initialState,

 reducers:{},

 extraReducers:(builder)=>{

 builder

 .addCase(
  fetchCourses.pending,
  (state)=>{
   state.loading=true;
  }
 )

 .addCase(
  fetchCourses.fulfilled,
  (state, action)=>{
   state.loading=false;
   state.courses=
   action.payload;
  }
 )

 .addCase(
  createCourse.fulfilled,
  (state, action)=>{
   state.courses.push(
    action.payload
   );
  }
 )

 .addCase(
  editCourse.fulfilled,
  (state, action)=>{

   const index =

   state.courses.findIndex(
    course =>
    course.id ===
    action.payload.id
   );

   if(index !== -1){
    state.courses[index]
    =
    action.payload;
   }
  }
 )

 .addCase(
  removeCourse.fulfilled,
  (state, action)=>{

   state.courses =
   state.courses.filter(
    course =>
    course.id !==
    action.payload
   );
  }
 );
 }

});

export default
courseSlice.reducer;