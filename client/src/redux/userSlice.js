// import { createSlice } from '@reduxjs/toolkit'

// const initialState = {
//   _id : "",
//   name : "",
//   email : "",
//   profile_pic : "",
//   token : "",
//   onlineUser : [],
//   socketConnection : null
// }

// export const userSlice = createSlice({
//   name: 'user',
//   initialState,
//   reducers: {
//     setUser : (state,action)=>{
//         state._id = action.payload._id
//         state.name = action.payload.name 
//         state.email = action.payload.email 
//         state.profile_pic = action.payload.profile_pic 
//     },
//     setToken : (state,action)=>{
//         state.token = action.payload
//     },
//     logout : (state,action)=>{
//         state._id = ""
//         state.name = ""
//         state.email = ""
//         state.profile_pic = ""
//         state.token = ""
//         state.socketConnection = null
//     },
//     setOnlineUser : (state,action)=>{
//       state.onlineUser = action.payload
//     },
//     setSocketConnection : (state,action)=>{
//       state.socketConnection = action.payload
//     }
//   },
// })

// // Action creators are generated for each case reducer function
// export const { setUser, setToken ,logout, setOnlineUser,setSocketConnection } = userSlice.actions

// export default userSlice.reducer



import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  _id: "",
  name: "",
  email: "",
  profile_pic: "",
  token: "",
  onlineUser: [],
  socketConnection: null
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      // Update all properties of the user object
      state._id = action.payload._id
      state.name = action.payload.name 
      state.email = action.payload.email 
      state.profile_pic = action.payload.profile_pic 
      state.token = action.payload.token  // Ensure the token is included
      state.onlineUser = action.payload.onlineUser || []  // Handle onlineUser if present
    },
    setToken: (state, action) => {
      state.token = action.payload
    },
    logout: (state) => {
      // Clear all user details and reset socket connection
      state._id = ""
      state.name = ""
      state.email = ""
      state.profile_pic = ""
      state.token = ""
      state.socketConnection = null
      state.onlineUser = []  // Clear onlineUser on logout
    },
    setOnlineUser: (state, action) => {
      state.onlineUser = action.payload
    },
    setSocketConnection: (state, action) => {
      state.socketConnection = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setUser, setToken, logout, setOnlineUser, setSocketConnection } = userSlice.actions

export default userSlice.reducer
