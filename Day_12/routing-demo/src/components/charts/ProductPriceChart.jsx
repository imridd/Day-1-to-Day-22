import { useEffect, useState } from "react";

import { LineChart } from "@mui/x-charts/LineChart";

import AppCard from "../common/AppCard";

import {
  getProducts,
} from "../../services/productService";

function ProductPriceChart() {

  const [
    productNames,
    setProductNames,
  ] = useState([]);

  const [
    prices,
    setPrices,
  ] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData =
    async () => {

      try {

        const products =
          await getProducts();

        setProductNames(
          products.map(
            (product) =>
              product.productName
          )
        );

        setPrices(
          products.map(
            (product) =>
              Number(product.price)
          )
        );

      } catch (error) {

        console.log(error);

      }
    };

  return (
    <AppCard>

      <h5 className="chart-title mb-4">
        Product Price Analysis 💰
      </h5>

      <div className="chart-wrapper">

        <LineChart
          xAxis={[
            {
              scaleType: "point",
              data: productNames,
            },
          ]}
          series={[
            {
              data: prices,
              color: "#00C897",
              curve: "monotoneX",
            },
          ]}
          height={350}
        />

      </div>

    </AppCard>
  );
}

export default ProductPriceChart;