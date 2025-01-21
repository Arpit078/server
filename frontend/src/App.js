import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Home from "./Pages/Home";
import SongPage from "./Pages/SearchPage";
import Landing from "./Pages/Landing";
function App() {
  return (
    <BrowserRouter basename="/">
    <Routes>
        <Route index element={<Landing/>}/>
        <Route path="landing" element={<Home />} />
        <Route path="search" element={<SongPage />} />
        {/*<Route path="contact" element={<Contact />} />
        <Route path="*" element={<NoPage />} /> */}
    </Routes>
  </BrowserRouter>

  );
}

export default App;
