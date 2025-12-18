import SwapyContainer from './swapy/SwapyContainer';
import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/Blog';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        {/* <Route path="/" element={<SwapyContainer />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
