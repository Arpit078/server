import express from "express"
import cors from "cors";
const app = express()
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
import { getPlaylistTracks,getSearchedTracks,getSpotifyToken } from "./spotify.js";
import validator from 'validator';
import { rateLimit } from 'express-rate-limit'

app.use(cors()); // Use CORS middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
import { postgres_client } from "./lib/postgres_wrapper.js";
import { redis_client } from "./lib/redis_wrapper.js";
import { poll } from "./utils.js";
import { send_message} from "./lib/rabbitMQ_wrapper.js";
import {googleAuthMiddleware} from "./middleware/googleAuthMiddleware.js"
import { OAuth2Client } from 'google-auth-library';

var PORT = process.env.PORT||5001;


const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(generalLimiter);

app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;

  try {
    // Reuse middleware logic for token verification
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    // Example response: Send an access token (mock for now)
    res.json({
      user: { name, email, picture },
      accessToken: token, // In a real app, issue a signed JWT here
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid token' });
  }
});

app.get('/protected', googleAuthMiddleware, (req, res) => {
  res.json({ message: `Hello ${req.user.name}, you're authenticated!` });
});


app.get('/api/search', googleAuthMiddleware, async (req, res) => {
  try {
    let query = req.query.query; // Retrieve query from query parameters
    
    // Validate and sanitize the input
    if (!query || !validator.isAscii(query)) {
      return res.status(400).send({ error: "Invalid query parameter." });
    }
    query = validator.escape(query); // Escape any potentially harmful characters
    
    let token = await getSpotifyToken(redis_client);
    let data = await getSearchedTracks(query, token);
    res.status(200).send(data);
  } catch (err) {
    console.error(err);
    res.status(err.response?.status || 500).send(err.response?.data || 'An error occurred');
  }
});

app.get('/api/queryPlaylist', googleAuthMiddleware, async (req, res) => {
  try {
    let playlistUrl = req.query.query; // Retrieve playlistUrl from query parameters
    
    // Validate and sanitize the playlist URL
    if (!playlistUrl || !validator.isURL(playlistUrl, { protocols: ['https'] })) {
      return res.status(400).send({ error: "Invalid playlist URL format." });
    }
    playlistUrl = validator.escape(playlistUrl); // Escape any harmful characters

    const regex = /https:\/\/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)(\?.*)?/;
    const match = playlistUrl.match(regex);

    // Error handling for cases where playlistId is not found
    if (!match) {
      console.error("Invalid playlist URL format.");
      return res.status(400).send({ error: "Invalid playlist URL format." });
    }

    let playlistId = match[1];

    try {
      let token = await getSpotifyToken(redis_client);      
      let data = await getPlaylistTracks(playlistId, token);
      res.status(200).send(data);
    } catch (err) {
      console.error("Error fetching playlist tracks:", err);
      res.status(500).send({ error: "Failed to fetch playlist tracks." });
    }
  } catch (err) {
    console.error(err);
    res.status(err.response?.status || 500).send(err.response?.data || 'An error occurred');
  }
});

app.get('/api/poll', async (req, res) => {
  try {
      let songId = req.query.songId; // Retrieve songId from query parameters
      let songExists = await poll(songId, redis_client, postgres_client);
      res.status(200).json({ success: songExists });
  } catch (err) {
      console.error(err);
      res.status(err.response?.status || 500).send(err.response?.data || 'An error occurred');
  }
});

app.post('/api/download', async (req, res) => {
  try {
    let songs = req.body.songs;

    const filteredSongs = [];
    for (let i=0;i<songs.length;i++) {
      const songExists = await poll(songs[i].id, redis_client, postgres_client); // Access song ID
      if (songExists != 1) {
        filteredSongs.push(songs[i]);
      } 
    }

    let isSent = await send_message('download_queue', filteredSongs);
    res.status(200).send({ success: isSent });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});


app.listen(PORT, function(err){
	if (err) console.log(err);
	console.log("Server listening on PORT", PORT);
});
