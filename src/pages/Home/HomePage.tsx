import React from "react";
import styles from "./HomePage.module.css";
import MainBanner from "../../components/features/MainBanner/MainBanner";
import AdSlider from "../../components/features/AdSlider/AdSlider";
import CategoryMenu from "../../components/features/CategoryMenu/CategoryMenu";
import FlashSaleSlider from "../../components/features/FlashSaleSlider/FlashSaleSlider";
import Header from "../../components/features/Header/Header";
import Footer from "../../components/common/Footer/Footer";

const Home = () => {
  return (
    <div className={styles.home}>
      <Header />
      <MainBanner />
      {/* <CategoryMenu /> */}
      <FlashSaleSlider />
      <Footer />
    </div>
  );
};

export default Home;
