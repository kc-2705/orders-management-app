import React, { createContext, useContext, useState, useEffect } from "react";

const OrderContext = createContext();

const readList = (key) => JSON.parse(localStorage.getItem(key) || "[]");

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const local = readList("orders");
        const deleted = new Set(readList("deletedOrders"));
        const response = await fetch(`${import.meta.env.BASE_URL}data.json`);
        const json = await response.json();

        const taggedJson = json.map((o) => ({ ...o, fromJson: true }));

        // Merge orders with local overriding json on duplicate orderNumber
        const mergedOrdersMap = new Map();
        taggedJson.forEach((o) => mergedOrdersMap.set(o.orderNumber, o));
        local.forEach((o) => mergedOrdersMap.set(o.orderNumber, o));

        setOrders(
          Array.from(mergedOrdersMap.values()).filter((o) => !deleted.has(o.orderNumber))
        );
      } catch (error) {
        console.error("Failed to load orders:", error);
      }
    };
    loadOrders();
  }, []);

  const saveLocal = (list) =>
    localStorage.setItem("orders", JSON.stringify(list.filter((o) => !o.fromJson)));

  const addOrder = (order) => {
    setOrders((prev) => {
      const updated = [...prev, order];
      saveLocal(updated);
      return updated;
    });
  };

  const deleteOrder = (orderNumber) => {
    const updated = orders.filter((o) => o.orderNumber !== orderNumber);
    saveLocal(updated);
    // Sample orders come from data.json, so remember deletions separately.
    localStorage.setItem(
      "deletedOrders",
      JSON.stringify([...new Set([...readList("deletedOrders"), orderNumber])])
    );
    setOrders(updated);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, deleteOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
