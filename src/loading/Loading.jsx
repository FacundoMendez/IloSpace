import React, { useEffect } from 'react'
import "./loading.css"
import { gsap } from 'gsap'


const Loading = () => {
    useEffect(() => {
        const tl = gsap.timeline()

        tl.to(".containerLoad", {
            delay: 2, 
            opacity: -1,
            duration: 1
        })

        tl.to(".containerLoad", {
            display: "none"
        })
    },[])
  return (
    <div className="containerLoad">
        <span className="loader"></span>
    </div>
  )
}

export default Loading