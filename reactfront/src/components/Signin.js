import React, { useEffect, useState } from "react";
import {auth,provider} from "../firebase";
import {signInWithPopup} from "firebase/auth";
import Home from "./Home";
import './home.css';

function SignIn(){
    const [value,setValue] = useState('')
    const handleClick =()=>{
        signInWithPopup(auth,provider).then((data)=>{
            setValue(data.user.email)
            localStorage.setItem("email",data.user.email)
        })
    }

    useEffect(()=>{
        setValue(localStorage.getItem('email'))
    })

return (
    <div>
        {value?<Home/>:
        <div className = "logout">
        <button onClick={handleClick}>Sign-in with Google</button>
        </div>
        }
    </div>
);
}
export default SignIn;