// import axios from 'axios'
// import React, { useEffect } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { Outlet, useLocation, useNavigate } from 'react-router-dom'
// import { logout, setOnlineUser, setSocketConnection, setUser } from '../redux/userSlice'
// import Sidebar from '../components/Sidebar'
// import logo from '../assets/logo.png'
// import io from 'socket.io-client'

// const Home = () => {
//   const user = useSelector(state => state.user)
//   const dispatch = useDispatch()
//   const navigate = useNavigate()
//   const location = useLocation()

//   console.log('user',user)
//   const fetchUserDetails = async()=>{
//     try {
//         const URL = `${backendUrl}/api/user-details`
//         const response = await axios({
//           url : URL,
//           withCredentials : true
//         })

//         dispatch(setUser(response.data.data))

//         if(response.data.data.logout){
//             dispatch(logout())
//             navigate("/email")
//         }
//         console.log("current user Details",response)
//     } catch (error) {
//         console.log("error",error)
//     }
//   }

//   useEffect(()=>{
//     fetchUserDetails()
//   },[])
//   const backendUrl = window.location.hostname === 'localhost' ? 
//     'http://localhost:8080' : 
//     'http://192.168.49.2:30002';

//   /***socket connection */
//   useEffect(()=>{
//     const socketConnection = io(backendUrl,{
//       auth : {
//         token : localStorage.getItem('token')
//       },
//     })

//     socketConnection.on('onlineUser',(data)=>{
//       console.log(data)
//       dispatch(setOnlineUser(data))
//     })

//     dispatch(setSocketConnection(socketConnection))

//     return ()=>{
//       socketConnection.disconnect()
//     }
//   },[])


//   const basePath = location.pathname === '/'
//   return (
//     <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
//         <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
//            <Sidebar/>
//         </section>

//         {/**message component**/}
//         <section className={`${basePath && "hidden"}`} >
//             <Outlet/>
//         </section>


//         <div className={`justify-center items-center flex-col gap-2 hidden ${!basePath ? "hidden" : "lg:flex" }`}>
//             <div>
//               <img
//                 src={logo}
//                 width={250}
//                 alt='logo'
//               />
//             </div>
//             <p className='text-lg mt-2 text-slate-500'>Select user to send message</p>
//         </div>
//     </div>
//   )
// }

// export default Home



import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { logout, setOnlineUser, setSocketConnection, setUser } from '../redux/userSlice'
import Sidebar from '../components/Sidebar'
import logo from '../assets/logo.png'
import io from 'socket.io-client'

const Home = () => {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const [socketConnection, setSocket] = useState(null)  // Local state to manage socket connection

  console.log('user', user)

  const fetchUserDetails = async () => {
    try {
      const URL = `${backendUrl}/api/user-details`
      const response = await axios({
        url: URL,
        withCredentials: true
      })

      if (response.data?.data) {
        // If the user is logged in, update the Redux store
        dispatch(setUser(response.data.data))

        // If the user is marked for logout, dispatch the logout action
        if (response.data.data.logout) {
          dispatch(logout())
          navigate("/email")
        }
      } else {
        console.log("No user data found")
      }

      console.log("current user Details", response)
    } catch (error) {
      console.log("Error fetching user details", error)
    }
  }

  useEffect(() => {
    fetchUserDetails()
  }, [])

  const backendUrl = window.location.hostname === 'localhost' ? 
    'http://localhost:8080' : 
    'http://192.168.49.2:30002';

  useEffect(() => {
    const socket = io(backendUrl, {
      auth: {
        token: localStorage.getItem('token')
      },
    })

    // Handle online user updates
    socket.on('onlineUser', (data) => {
      console.log(data)
      dispatch(setOnlineUser(data))
    })

    // Store socket connection in local state
    setSocket(socket)

    // Dispatch only the socket ID to Redux (not the entire socket object)
    dispatch(setSocketConnection(socket.id))

    return () => {
      // Ensure socket connection is disconnected on cleanup
      socket.disconnect()
    }
  }, [dispatch])

  const basePath = location.pathname === '/'
  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
      <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      {/**message component**/}
      <section className={`${basePath && "hidden"}`} >
        <Outlet />
      </section>

      <div className={`justify-center items-center flex-col gap-2 hidden ${!basePath ? "hidden" : "lg:flex" }`}>
        <div>
          <img
            src={logo}
            width={250}
            alt='logo'
          />
        </div>
        <p className='text-lg mt-2 text-slate-500'>Select user to send message</p>
      </div>
    </div>
  )
}

export default Home
