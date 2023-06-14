import "./App.css";
import React from "react";
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Pixelate from "./components/Pixelate";

export default function App() {
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
