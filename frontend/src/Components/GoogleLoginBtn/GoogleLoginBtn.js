import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleLogin = () => {
  const navigate = useNavigate();
  useEffect(() => {
    /* Initialize the Google login button */
    window.google.accounts.id.initialize({
      client_id: process.env.GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById('googleLoginButton'),
      { theme: 'outline', size: 'large' } // Customize the button
    );
  }, []);

  const handleCredentialResponse = async (response) => {
    const idToken = response.credential;

    // Send the token to the backend for verification
    console.log(idToken)
    const res = await fetch('http://localhost:5001/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: idToken }),
    });

    if (res.ok) {
      const { user, accessToken } = await res.json();

      // Save the access token in local storage or cookies
      localStorage.setItem('accessToken', accessToken);

      alert(`Welcome ${user.name}`);
      navigate('/landing');
      
    } else {
      alert('Authentication failed');
    }
  };

  return <div id="googleLoginButton"></div>;
};

export default GoogleLogin;
