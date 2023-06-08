import "./App.css";
import React from "react";
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Pixelate from "./components/Pixelate";

export default function App() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);
  return (
    <div>
      <Header />
      <main>
        <p>{!data ? "Loading server test data..." : data}</p>
        <Banner />
        <Pixelate />
      </main>
      <Footer />
    </div>
  );
}
