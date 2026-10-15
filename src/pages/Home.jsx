import React, { useState } from "react";
import "../styles/HomePage.css";
import { useOrders } from "../components/OrderContext";
import { formatMoney, orderTotal } from "../utils/format";

const HomePage = ({ user }) => {
  const { orders } = useOrders();
  const [activeCard, setActiveCard] = useState(null);

  const calculateDetails = () => {
    const companyQuantities = {};
    const companyRevenue = {};

    orders.forEach((order) => {
      const customer = order.customer || "Unknown";
      const quantity = parseFloat(order.totalQuantity) || 0;
      const revenue = orderTotal(order);

      companyQuantities[customer] = (companyQuantities[customer] || 0) + quantity;
      companyRevenue[customer] = (companyRevenue[customer] || 0) + revenue;
    });

    const topCompany = Object.entries(companyQuantities).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ["", 0]
    );

    const lowCompany = Object.entries(companyQuantities).reduce(
      (a, b) => (b[1] < a[1] ? b : a),
      ["", Infinity]
    );

    const topRevenue = Object.entries(companyRevenue).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ["", 0]
    );

    const lowRevenue = Object.entries(companyRevenue).reduce(
      (a, b) => (b[1] < a[1] ? b : a),
      ["", Infinity]
    );

    return { topCompany, lowCompany, topRevenue, lowRevenue, companyQuantities, companyRevenue };
  };

  const {
    topCompany,
    lowCompany,
    topRevenue,
    lowRevenue,
    companyQuantities,
    companyRevenue,
  } = calculateDetails();

  const totalQuantity = Object.values(companyQuantities).reduce((a, b) => a + b, 0);
  const totalRevenue = Object.values(companyRevenue).reduce((a, b) => a + b, 0);

  const ordersWithIssues = orders.filter(
    (order) => order.pendingApprovalReasonCode?.length > 0
  );

  const freightTermsCount = orders.reduce((acc, order) => {
    const term = order.freightTerms || "Unknown";
    acc[term] = (acc[term] || 0) + 1;
    return acc;
  }, {});

  const cards = [
    {
      id: "quantity",
      title: "Total Quantity",
      value: totalQuantity.toLocaleString(),
      detail: (
        <>
          <p><strong>Highest Ordering Company:</strong> {topCompany[0]} ({topCompany[1]})</p>
          <p><strong>Lowest Ordering Company:</strong> {lowCompany[0]} ({lowCompany[1]})</p>
        </>
      ),
    },
    {
      id: "revenue",
      title: "Total Revenue",
      value: formatMoney(totalRevenue),
      detail: (
        <>
          <p><strong>Top Revenue Company:</strong> {topRevenue[0]} ({formatMoney(topRevenue[1])})</p>
          <p><strong>Lowest Revenue Company:</strong> {lowRevenue[0]} ({formatMoney(lowRevenue[1])})</p>
        </>
      ),
    },
    {
      id: "issues",
      title: "Orders with Issues",
      value: ordersWithIssues.length,
      detail: (
        <ul>
          {ordersWithIssues.map((o) => (
            <li key={o.orderNumber}>
              {o.orderNumber}: {o.pendingApprovalReasonCode.join(", ")}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "freight",
      title: "Freight Terms Breakdown",
      value: Object.values(freightTermsCount).reduce((a, b) => a + b, 0),
      detail: (
        <ul>
          {Object.entries(freightTermsCount).map(([term, count]) => (
            <li key={term}>
              {term}: {count} orders
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome, {user?.name || "there"}</h1>
        <p>{orders.length} orders in the system. Click a card for details.</p>
      </div>
      <div className={`cards ${activeCard ? "blur-bg" : ""}`}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={`card ${activeCard === card.id ? "active" : ""}`}
            onClick={() => setActiveCard(card.id)}
          >
            <h3>{card.title}</h3>
            <p>{card.value}</p>
          </div>
        ))}
      </div>

      {activeCard && (
        <div className="card-modal">
          <div className="card-expanded">
            <button className="close-btn" onClick={() => setActiveCard(null)}>
              &times;
            </button>
            <h2>{cards.find((c) => c.id === activeCard).title}</h2>
            <div className="card-details">
              {cards.find((c) => c.id === activeCard).detail}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
