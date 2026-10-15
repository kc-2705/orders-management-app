import React, { useState, useEffect, useRef } from "react";
import "../styles/DisplayOrdersList.css";
import { useOrders } from "../components/OrderContext";
import { parseDate, formatDate, formatMoney, orderTotal } from "../utils/format";
import { FaTimes, FaSortUp, FaSortDown } from "react-icons/fa";

const statuses = ["Pending", "Approved", "Shipped", "Cancelled"];

const DisplayOrdersList = () => {
  const { orders, deleteOrder } = useOrders();

  const [filteredStatuses, setFilteredStatuses] = useState([]);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [activeMenu, setActiveMenu] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [historyOrder, setHistoryOrder] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeRange, setActiveRange] = useState(null);
  const menuRef = useRef(null);

  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    orderToDelete: null,
    doNotShowAgain: localStorage.getItem("skipDeleteConfirm") === "true",
  });

useEffect(() => {
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setActiveMenu(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);



  const handleSort = (field) => {
    const allowedFields = ["orderNumber", "customer", "transactionDate", "latePickupDate"];
    if (!allowedFields.includes(field)) return;

    const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  const toggleStatusFilter = (status) => {
    setFilteredStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const requestDelete = (order) => {
    if (deleteConfirm.doNotShowAgain) {
      performDelete(order.orderNumber);
    } else {
      setDeleteConfirm({ show: true, orderToDelete: order, doNotShowAgain: false });
      setActiveMenu(null);
    }
  };

  const performDelete = (orderNumber) => {
    deleteOrder(orderNumber);
    setDeleteConfirm({ show: false, orderToDelete: null, doNotShowAgain: deleteConfirm.doNotShowAgain });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, orderToDelete: null, doNotShowAgain: deleteConfirm.doNotShowAgain });
  };

  const toggleDoNotShowAgain = () => {
    const newVal = !deleteConfirm.doNotShowAgain;
    setDeleteConfirm((prev) => ({ ...prev, doNotShowAgain: newVal }));
    localStorage.setItem("skipDeleteConfirm", newVal.toString());
  };

  const handleView = (order) => {
    setViewOrder(order);
    setActiveMenu(null);
  };

  const handleHistory = (order) => {
    setHistoryOrder(order);
    setActiveMenu(null);
  };

  const clearStartDate = () => {
    setStartDate("");
    setActiveRange(null);
  };
  const clearEndDate = () => {
    setEndDate("");
    setActiveRange(null);
  };

  const setDateRange = (range) => {
    if (activeRange === range) {
      setStartDate("");
      setEndDate("");
      setActiveRange(null);
      return;
    }

    const now = new Date();
    let start = new Date();

    if (range === "week") {
      start.setDate(now.getDate() - 7);
    } else if (range === "month") {
      start.setMonth(now.getMonth() - 1);
    } else if (range === "year") {
      start.setFullYear(now.getFullYear() - 1);
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(now.toISOString().split("T")[0]);
    setActiveRange(range);
  };

  let filteredOrders = orders.filter((order) => {
    const statusMatch = filteredStatuses.length === 0 || filteredStatuses.includes(order.status);
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const transactionDate = parseDate(order.transactionDate);
    const dateMatch =
      (!start || transactionDate >= start) &&
      (!end || transactionDate <= end);
    return statusMatch && dateMatch;
  });

  if (sortField) {
    filteredOrders = [...filteredOrders].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  const statusCounts = statuses.reduce((acc, status) => {
    acc[status] = orders.filter((o) => o.status === status).length;
    return acc;
  }, {});

  return (
    <div className="order-list-page with-sidebar">
      <div className="filters-summary">
        <div className="date-range-filter">
          <h3>Filter by Created Date</h3>
          <div className="quick-range-buttons">
            {["week", "month", "year"].map((range) => (
              <button
                key={range}
                className={`range-btn ${activeRange === range ? "active" : ""}`}
                onClick={() => setDateRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          <div className="date-input">
            <label>Start:</label>
            <div className="input-with-clear small">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: "160px" }}
              />
              {startDate && <FaTimes className="clear-icon" onClick={clearStartDate} />}
            </div>
          </div>
          <div className="date-input">
            <label>End:</label>
            <div className="input-with-clear small">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: "160px" }}
              />
              {endDate && <FaTimes className="clear-icon" onClick={clearEndDate} />}
            </div>
          </div>
        </div>

        <div className="summary-panel interactive-summary">
          <h4>📊 Order Summary</h4>
          <div className="status-row">
            <div><strong>⏳ Pending:</strong> {statusCounts["Pending"] || 0}</div>
            <div><strong>🚚 Shipped:</strong> {statusCounts["Shipped"] || 0}</div>
          </div>
          <div className="status-row">
            <div><strong>✅ Approved:</strong> {statusCounts["Approved"] || 0}</div>
            <div><strong>❌ Cancelled:</strong> {statusCounts["Cancelled"] || 0}</div>
          </div>
          <div className="total-row">
            <strong>📦 Total Orders:</strong> {orders.length}
          </div>
        </div>
      </div>

      <div className="multi-status-filter">
        <label>Filter by Status:</label>
        <div className="status-buttons">
          {statuses.map((status) => (
            <button
              key={status}
              className={`status-btn ${filteredStatuses.includes(status) ? "active" : ""}`}
              onClick={() => toggleStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="table-scroll">
      <table className="orders-table">
        <thead>
          <tr>
            {["orderNumber", "customer", "transactionDate", "latePickupDate", "amount"].map((field) => (
              <th key={field} onClick={() => handleSort(field)}>
                {field === 'orderNumber' && 'Order Number'}
                {field === 'customer' && 'Customer'}
                {field === 'transactionDate' && 'Created Date'}
                {field === 'latePickupDate' && 'Due Date'}
                {field === 'amount' && 'Amount'}
                {["orderNumber", "customer", "transactionDate", "latePickupDate"].includes(field) &&
                  (sortField === field ? (
                    sortOrder === "asc" ? <FaSortUp className="sort-icon" /> : <FaSortDown className="sort-icon" />
                  ) : <FaSortUp className="sort-icon disabled" />)}
              </th>
            ))}
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.orderNumber}>
              <td className="nowrap-td">{order.orderNumber}</td>
              <td className="nowrap-td" title={order.customer}>{order.customer}</td>
              <td className="nowrap-td">{formatDate(order.transactionDate)}</td>
              <td className="nowrap-td">{formatDate(order.latePickupDate)}</td>
              <td className="nowrap-td">
                {formatMoney(orderTotal(order))}
              </td>
              <td className="nowrap-td">{order.status}</td>
              <td className="action-cell">
                <div className="action-wrapper">
                  <div
                    className="action-dots"
                    onClick={() =>
                      setActiveMenu((prev) => (prev === order.orderNumber ? null : order.orderNumber))
                    }
                  >
                    ⋮
                  </div>
                  {activeMenu === order.orderNumber && (
                    <div className="action-menu">
                      <div className="action-item" onClick={() => handleView(order)}>View</div>
                      <div className="action-item" onClick={() => handleHistory(order)}>History</div>
                      <div className="action-item delete" onClick={() => requestDelete(order)}>Delete</div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {filteredOrders.length === 0 && (
            <tr>
              <td colSpan={7} className="empty-row">No orders match these filters.</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>


      {viewOrder && (
        <div className="order-details-modal modal-overlay">
          <div className="modal-content view-modal">
            <button className="close-btn" onClick={() => setViewOrder(null)}>&times;</button>
            <h2>Order Details</h2>
            <div className="order-summary">
              <p><strong>Order Number:</strong> {viewOrder.orderNumber}</p>
              <p><strong>Customer:</strong> {viewOrder.customer}</p>
              <p><strong>Status:</strong> {viewOrder.status}</p>
              <p><strong>Created Date:</strong> {formatDate(viewOrder.transactionDate)}</p>
              <p><strong>Due Date:</strong> {formatDate(viewOrder.latePickupDate)}</p>
              <p><strong>Amount:</strong> {formatMoney(orderTotal(viewOrder))}</p>
              <p><strong>Number of Items:</strong> {viewOrder.lines?.length || 0}</p>
            </div>
          </div>
        </div>
      )}



      {/* Delete Confirm Modal */}
      {deleteConfirm.show && (
        <div className="order-details-modal">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete order #{deleteConfirm.orderToDelete.orderNumber}?</p>
            <label>
              <input
                type="checkbox"
                checked={deleteConfirm.doNotShowAgain}
                onChange={toggleDoNotShowAgain}
              />
              Do not show this confirmation again
            </label>
            <div className="modal-buttons">
              <button onClick={() => performDelete(deleteConfirm.orderToDelete.orderNumber)}>Delete</button>
              <button onClick={handleDeleteCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyOrder && (
        <div className="order-details-modal modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setHistoryOrder(null)}>&times;</button>
            <h2>Order History</h2>
            {historyOrder.history && historyOrder.history.length > 0 ? (
              <ul className="timeline">
                {historyOrder.history.map((item, index) => (
                  <li className="timeline-item" key={index}>
                    <div className="timeline-icon">✓</div>
                    <div className="timeline-content">
                      <p className="event">{item.event}</p>
                      <span className="timestamp">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>

            ) : (
              <p>No history available for this order.</p>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayOrdersList;
