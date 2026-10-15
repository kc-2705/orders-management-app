// CreateOrder.js
import React, { useState } from 'react';
import '../styles/CreateOrder.css';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../components/OrderContext';
import { message } from 'antd';

const CreateOrder = () => {
  const navigate = useNavigate();
  const { addOrder, orders } = useOrders();

  const [lineInput, setLineInput] = useState({ item: '', units: '', quantity: '', price: '', amount: 0 });
  const [orderLines, setOrderLines] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [order, setOrder] = useState({
    orderNumber: '', customer: '', transactionDate: '', status: '', fromLocation: '', toLocation: '',
    reasonCodes: [], supportRep: '', incoterm: '', freightTerms: '', totalShipUnitCount: '',
    totalQuantity: '', discountRate: '', billingAddress: '', shippingAddress: '',
    earlyPickupDate: '', latePickupDate: '', orderLines: []
  });
  const [termChoice, setTermChoice] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (e) => {
    const options = Array.from(e.target.selectedOptions, (o) => o.value);
    setOrder((prev) => ({ ...prev, reasonCodes: options }));
  };

  const handleLineInputChange = (e) => {
    const { name, value } = e.target;
    const newInput = { ...lineInput, [name]: value };
    if (name === 'quantity' || name === 'price') {
      const qty = parseFloat(newInput.quantity) || 0;
      const prc = parseFloat(newInput.price) || 0;
      newInput.amount = Math.round(qty * prc * 100) / 100;
    }
    setLineInput(newInput);
  };

  const handleAddOrUpdateLine = () => {
    if (!lineInput.item || !lineInput.units || !lineInput.quantity || !lineInput.price) {
      message.warning('Please fill in all order line fields.');
      return;
    }
    const updatedLines = [...orderLines];
    if (editIndex >= 0) {
      updatedLines[editIndex] = { ...lineInput, quantity: Number(lineInput.quantity), price: Number(lineInput.price) };
      setEditIndex(-1);
    } else {
      updatedLines.push({ ...lineInput, quantity: Number(lineInput.quantity), price: Number(lineInput.price) });
    }
    setOrderLines(updatedLines);
    setLineInput({ item: '', units: '', quantity: '', price: '', amount: 0 });
  };

  const handleEditLine = (index) => {
    setLineInput(orderLines[index]);
    setEditIndex(index);
  };

  const handleDeleteLine = (index) => {
    const updated = orderLines.filter((_, i) => i !== index);
    setOrderLines(updated);
    if (editIndex === index) setLineInput({ item: '', units: '', quantity: '', price: '', amount: 0 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!order.incoterm && !order.freightTerms) || (order.incoterm && order.freightTerms)) {
      message.warning('Please select an Incoterm or a Freight Term.');
      return;
    }
    const required = ['orderNumber', 'customer', 'transactionDate', 'status', 'fromLocation', 'toLocation'];
    for (let field of required) {
      if (!order[field]) {
        message.warning(`${field} is required.`);
        return;
      }
    }
    if (orders.some((o) => o.orderNumber === order.orderNumber)) {
      message.error(`Order number ${order.orderNumber} already exists.`);
      return;
    }
    if (orderLines.length === 0) {
      message.warning('Add at least one order line.');
      return;
    }
    const totalRevenue = orderLines.reduce((sum, line) => sum + parseFloat(line.amount || 0), 0);
    const finalOrder = {
      ...order,
      id: crypto.randomUUID(),
      pendingApprovalReasonCode: order.reasonCodes,
      orderLines,
      lines: orderLines,
      createdAt: new Date().toISOString(),
      totalRevenue,
    };
    addOrder(finalOrder);
    message.success('Order successfully created!');
    setTimeout(() => navigate('/orders'), 1000);
  };

  return (
    <div className="order-form">
      <h2 className="section-title">Create Order</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-section">


          <span>Order Number<span className="required">*</span>
            <input name="orderNumber" value={order.orderNumber} onChange={handleChange} required />
          </span>

          <span>Customer<span className="required">*</span> <input name="customer" value={order.customer} onChange={handleChange} required /></span>
          <span>Transaction Date<span className="required">*</span> <input type="date" name="transactionDate" value={order.transactionDate} onChange={handleChange} required /></span>
          <span>Status<span className="required">*</span>
            <select name="status" value={order.status} onChange={handleChange} required>
              <option value="">--Select--</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Shipped</option>
              <option>Cancelled</option>
            </select>
          </span>
          <span>From Location<span className="required">*</span>
            <select name="fromLocation" value={order.fromLocation} onChange={handleChange} required>
              <option value="">--Select--</option>
              <option>Warehouse A</option>
              <option>Warehouse B</option>
              <option>Warehouse C</option>
              <option>Warehouse D</option>
            </select>
          </span>
          <span>To Location<span className="required">*</span> <input name="toLocation" value={order.toLocation} onChange={handleChange} required /></span>
          <span>Reason Codes
            <select name="reasonCodes" multiple onChange={handleMultiSelect}>
              <option>PRICE_DISCREPANCY</option>
              <option>CREDIT_HOLD</option>
              <option>STOCK_SHORTAGE</option>
              <option>CUSTOMER_REQUEST</option>
            </select>
          </span>
          <span>Support Rep <input name="supportRep" value={order.supportRep} onChange={handleChange} /></span>

          <div className="radio-dropdown-pair">
            <div className="radio-combined">
              <span className="radio-label">
                Please select One: <span className="required">*</span>
              </span>

              <label className="radio-option">
                <input
                  type="radio"
                  name="termChoice"
                  value="incoterm"
                  checked={termChoice === 'incoterm'}
                  onChange={() => {
                    setTermChoice('incoterm');
                    setOrder((prev) => ({ ...prev, freightTerms: '' }));
                  }}
                />
                Incoterm
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="termChoice"
                  value="freightTerms"
                  checked={termChoice === 'freightTerms'}
                  onChange={() => {
                    setTermChoice('freightTerms');
                    setOrder((prev) => ({ ...prev, incoterm: '' }));
                  }}
                />
                Freight Terms
              </label>

              {termChoice === 'incoterm' && (
                <select name="incoterm" value={order.incoterm} onChange={handleChange} required>
                  <option value="">--Select Incoterm--</option>
                  <option>EXW</option>
                  <option>FOB</option>
                  <option>CIF</option>
                  <option>DDP</option>
                </select>
              )}

              {termChoice === 'freightTerms' && (
                <select name="freightTerms" value={order.freightTerms} onChange={handleChange} required>
                  <option value="">--Select Freight Term--</option>
                  <option>Prepaid</option>
                  <option>Collect</option>
                </select>
              )}
            </div>
          </div>


          <div className="input-row">
            <div>
              <label>Total Ship Unit Count</label>
              <input type="number" min="0" name="totalShipUnitCount" value={order.totalShipUnitCount} onChange={handleChange} />
            </div>
            <div>
              <label>Total Quantity</label>
              <input type="number" min="0" name="totalQuantity" value={order.totalQuantity} onChange={handleChange} />
            </div>
            <div>
              <label>Discount Rate</label>
              <input type="number" min="0" max="1" step="0.01" name="discountRate" placeholder="e.g. 0.05" value={order.discountRate} onChange={handleChange} />
            </div>
          </div>


          <span>Billing Address <textarea name="billingAddress" value={order.billingAddress} onChange={handleChange} /></span>
          <span>Shipping Address <textarea name="shippingAddress" value={order.shippingAddress} onChange={handleChange} /></span>
          <span>Early Pickup Date <input type="date" name="earlyPickupDate" value={order.earlyPickupDate} onChange={handleChange} /></span>
          <span>Late Pickup Date <input type="date" name="latePickupDate" value={order.latePickupDate} onChange={handleChange} /></span>
        </div>

        <h3 className="section-title">Add Order Line</h3>
        <div className="order-line">
          <input placeholder="Item" name="item" value={lineInput.item} onChange={handleLineInputChange} />
          <select name="units" value={lineInput.units} onChange={handleLineInputChange}>
            <option value="">--Select--</option>
            <option value="Each">Each</option>
            <option value="Box">Box</option>
            <option value="Pack">Pack</option>
          </select>
          <input placeholder="Quantity" type="number" name="quantity" value={lineInput.quantity} onChange={handleLineInputChange} />
          <input placeholder="Price" type="number" name="price" value={lineInput.price} onChange={handleLineInputChange} />
          <input placeholder="Total" type="number" name="amount" value={lineInput.amount} readOnly />
          <button type="button" className="add-line-btn" onClick={handleAddOrUpdateLine}>{editIndex >= 0 ? 'Update' : 'Add Order Line'}</button>
        </div>

        <h3 className="section-title">Order Lines List</h3>
        {orderLines.length === 0 ? (
          <p>No lines added yet.</p>
        ) : (
          <table className="order-lines-table compact">
            <thead>
              <tr>
                <th>Item</th>
                <th>Units</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderLines.map((line, index) => (
                <tr key={index}>
                  <td>{line.item}</td>
                  <td>{line.units}</td>
                  <td>{line.quantity}</td>
                  <td>{line.price}</td>
                  <td>{Number(line.amount).toFixed(2)}</td>
                  <td>
                    <span
                      className="icon-btn"
                      title="Edit"
                      onClick={() => handleEditLine(index)}
                    >✏️</span>
                    <span
                      className="icon-btn"
                      title="Delete"
                      onClick={() => handleDeleteLine(index)}
                    >🗑️</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        )}


        <div className="submit-button-wrapper">
          <button type="submit">Submit Order</button>
        </div>

      </form>
    </div>
  );
};

export default CreateOrder;
