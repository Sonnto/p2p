import "./App.css";
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Pixelate from "./components/Pixelate";

function App() {
  return (
    <div>
      <Header />
      <main>
        <Banner />
        <Pixelate />
      </main>
      <Footer />
    </div>
  );
}

export default App;
