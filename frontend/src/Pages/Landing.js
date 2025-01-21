import React, { useState } from 'react';
import Header from '../Components/Header/Header.js';
import './Landing.css';  
import GoogleLogin from '../Components/GoogleLoginBtn/GoogleLoginBtn.js';
function Landing() {
    const [isSong, setIsSong] = useState(true);
    
    const handleToggle = () => {
        setIsSong(!isSong);
    };
    return (
      <div className="app-container">
        <Header isSong={true} />
        <GoogleLogin/>
      </div>
    );
}

export default Landing;
