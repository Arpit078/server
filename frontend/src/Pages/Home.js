import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you use react-router for navigation
import ToggleSlider from '../Components/ToggleSlider/ToggleSlider.js';
import SearchBar from '../Components/SearchBar/SearchBar.js';
import Header from '../Components/Header/Header.js';
import './Home.css';  

function Home() {
    const [isSong, setIsSong] = useState(true);
    const navigate = useNavigate(); // For redirection

    // Check if the user has an access token
    const accessToken = localStorage.getItem('accessToken');

    // Redirect or return a fallback UI if no token exists
    if (!accessToken) {
        return (
            <div className="no-access">
                <h2>Unauthorized</h2>
                <p>You need to log in to access this page.</p>
                <button onClick={() => navigate('/')}>Go to Login</button>
            </div>
        );
    }

    const handleToggle = () => {
        setIsSong(!isSong);
    };

    return (
        <div className="app-container">
            <Header isSong={isSong} />
            <SearchBar isSong={isSong} />
            <ToggleSlider isSong={isSong} onToggle={handleToggle} />
        </div>
    );
}

export default Home;
