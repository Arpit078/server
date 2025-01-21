import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // Assuming you use react-router for navigation
import SongsList from '../Components/SongList/SongList.js';
import SearchBar from '../Components/SearchBar/SearchBar.js';
import DownloadPlaylist from '../Components/DownloadAll/DownloadAll.js';
import './SearchPage.css'
import Logo from '../Components/Logo/Logo.js';
function SongPage() {
  const location = useLocation();
  const { isSong, query } = location.state || {};
  const [songs, setSongs] = useState([]);
  const hostname = window.location.hostname
  useEffect(() => {
    const fetchSongs = async () => {
      // Retrieve the access token from localStorage
      const accessToken = localStorage.getItem('accessToken');
  
      // Check if access token exists
      if (!accessToken) {
          console.error('Access token missing');
          return;
      }
  
      try {
          // Make the fetch request with Authorization header
          const response = await fetch(`http://${hostname}/api/${isSong ? 'search' : 'queryPlaylist'}?query=${query}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`, // Add the Authorization header
              },
          });
  
          // Parse the response
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
  
          const data = await response.json();
          console.log(data);
          setSongs(data); // Set the songs data to state
  
      } catch (error) {
          console.error('Error fetching songs:', error);
      }
  };
  
  // Call fetchSongs in a useEffect hook or elsewhere in your component
  fetchSongs();
  }, [isSong, query]);

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
  return (
    <div className="app">
      <Logo isSong={isSong} />
      <div className='search-bar'>
        <SearchBar isSong={isSong} />
        <DownloadPlaylist isSong={isSong} songs={isSong ? songs : songs[1]} />
      </div>
      <h1>{isSong ? 'Search result for : ' : ''}"{isSong ? query : songs[0]}"</h1>
      <SongsList songs={isSong ? songs : songs[1]} isSong={isSong} />
    </div>
  );
}

export default SongPage;
