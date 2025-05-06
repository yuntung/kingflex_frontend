import React, { useState, useEffect } from "react";
import "./OrderForm.css";
import { OrderConfirmationModal } from "./OrderConfirmationSystem";
import { useAuth } from "../auth/AuthContext";

const OrderForm = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [products152mm, setProducts152mm] = useState([]);
  const [sharedProducts, setSharedProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [isChairTableCollapsed, setIsChairTableCollapsed] = useState(true);
  const [isProducts152mmCollapsed, setIsProducts152mmCollapsed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const chairSizes = [
    25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180,
    190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330,
    340, 350, 360, 370, 380, 390, 400, 410, 420, 430, 440, 450, 460, 470, 480,
  ];

  const deliveryTimeOptions = {
    morning: [
      { value: "morning-anytime", label: "Morning Anytime" },
      { value: "7:00", label: "7:00" },
      { value: "7:30", label: "7:30" },
      { value: "8:00", label: "8:00" },
      { value: "8:30", label: "8:30" },
      { value: "9:00", label: "9:00" },
      { value: "9:30", label: "9:30" },
      { value: "10:00", label: "10:00" },
      { value: "10:30", label: "10:30" },
      { value: "11:00", label: "11:00" },
      { value: "11:30", label: "11:30" },
    ],
    afternoon: [
      { value: "afternoon-anytime", label: "Afternoon Anytime" },
      { value: "12:00", label: "12:00" },
      { value: "12:30", label: "12:30" },
      { value: "13:00", label: "1:00" },
      { value: "13:30", label: "1:30" },
      { value: "14:00", label: "2:00" },
      { value: "14:30", label: "2:30" },
      { value: "15:00", label: "3:00" },
    ],
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
  
      const fetchProductsByType = async (type) => {
        const response = await fetch(`/api/products?type=${type}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${type} products: ${response.status}`);
        }
        
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error(`Invalid ${type} products data format`);
        }
        
        return data;
      };
  
      const [normalProducts, products152mm, sharedProducts] = await Promise.all([
        fetchProductsByType('normal'),
        fetchProductsByType('152mm'),
        fetchProductsByType('shared')
      ]);
  
      // 確保使用正確的 id 格式
      const normalWithQuantities = [...normalProducts, ...sharedProducts].map(product => ({
        ...product,  // 保留原有的所有屬性，包括 id
        quantity: ""
      }));
      
      const products152WithQuantities = [...products152mm, ...sharedProducts].map(product => ({
        ...product,  // 保留原有的所有屬性，包括 id
        quantity: ""
      }));
  
      setProducts(normalWithQuantities);
      setProducts152mm(products152WithQuantities);
      setSharedProducts(sharedProducts);
  
      // 更新 formData
      setFormData(prev => ({
        ...prev,
        products: normalWithQuantities.map(product => {
          const existingProduct = prev.products.find(p => p.id === product.id);
          return {
            ...product,
            quantity: existingProduct ? existingProduct.quantity : ""
          };
        }),
        products152mm: products152WithQuantities.map(product => {
          const existingProduct = prev.products152mm.find(p => p.id === product.id);
          return {
            ...product,
            quantity: existingProduct ? existingProduct.quantity : ""
          };
        })
      }));
  
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError(`Failed to fetch products: ${error.message}`);
      setProducts([]);
      setProducts152mm([]);
      setSharedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Refresh products every 5 minutes
    const interval = setInterval(fetchProducts, 300000);
    return () => clearInterval(interval);
  }, []);

  // Define initial form data
  const getInitialFormData = (currentUser) => ({
    customerInfo: {
      companyName: currentUser?.companyName || "",
      orderNumber: "",
      contactPerson: "",
      phone: "",
      email: currentUser?.email || "",
      deliveryAddress: "",
      deliveryDate: "",
      deliveryTime: "",
      craneTrackRequest: "",
    },
    products: products.map(product => ({ 
      ...product, 
      quantity: "",
    })),
    products152mm: products152mm.map(product => ({ 
      ...product, 
      quantity: "",
    })),
    chairs: chairSizes.reduce((acc, size) => ({ ...acc, [size]: "" }), {}),
    note: "",
  });

  const [formData, setFormData] = useState(() => getInitialFormData(user));

  // Update form data when products or user changes
  useEffect(() => {
    setFormData(prev => {
      const newFormData = getInitialFormData(user);
      // 保持現有的數量值
      newFormData.products = newFormData.products.map(product => {
        const existingProduct = prev.products.find(p => p.id === product.id);
        return {
          ...product,
          quantity: existingProduct ? existingProduct.quantity : ""
        };
      });
      
      newFormData.products152mm = newFormData.products152mm.map(product => {
        const existingProduct = prev.products152mm.find(p => p.id === product.id);
        return {
          ...product,
          quantity: existingProduct ? existingProduct.quantity : ""
        };
      });
      
      return newFormData;
    });
  }, [user, products, products152mm]);

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      customerInfo: {
        ...prevState.customerInfo,
        [name]: value,
      },
    }));
  };

  const handleProductQuantityChange = (id, quantity) => {
    console.log('Updating quantity for product ID:', id, 'to:', quantity);
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(product =>
        product.id === id 
          ? { ...product, quantity }
          : product
      )
    }));
  };

  const handleProduct152mmQuantityChange = (id, quantity) => {
    setFormData(prev => ({
      ...prev,
      products152mm: prev.products152mm.map(product =>
        product.id === id 
          ? { ...product, quantity }
          : product
      )
    }));
  };

  const handleChairQuantityChange = (size, quantity) => {
    setFormData(prevState => ({
      ...prevState,
      chairs: {
        ...prevState.chairs,
        [size]: quantity,
      },
    }));
  };

  const handleDeliveryTimeChange = (e) => {
    let value = e.target ? e.target.value : "anytime";
    setFormData(prevState => ({
      ...prevState,
      customerInfo: {
        ...prevState.customerInfo,
        deliveryTime: value,
      },
    }));
  };

  const handleNoteChange = (e) => {
    setFormData(prevState => ({
      ...prevState,
      note: e.target.value
    }));
  };

  const resetForm = () => {
    setFormData(getInitialFormData(user));
    setIsModalOpen(false);
    setOrderNumber(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 基本驗證
    if (!formData.customerInfo.deliveryDate || !formData.customerInfo.deliveryTime) {
      alert('Please fill in all required fields');
      return;
    }

    // 驗證是否至少選擇了一個產品
    const hasProducts = formData.products.some(p => p.quantity > 0) || 
                       formData.products152mm.some(p => p.quantity > 0) ||
                       Object.values(formData.chairs).some(q => q > 0);

    if (!hasProducts) {
      alert('Please select at least one product');
      return;
    }

    try {
      setLoading(true);
      
      // 準備訂單資料
      const orderData = {
        companyName: formData.customerInfo.companyName,
        contactName: formData.customerInfo.contactPerson,
        phone: formData.customerInfo.phone,
        email: formData.customerInfo.email,
        deliveryAddress: formData.customerInfo.deliveryAddress,
        deliveryDate: formData.customerInfo.deliveryDate,
        deliveryTime: formData.customerInfo.deliveryTime,
        craneTruck: formData.customerInfo.craneTrackRequest,
        items: [
          // 12.7mm 產品
          ...formData.products
            .filter(product => product.quantity && product.quantity > 0)
            .map(product => ({
              name: product.name,
              detail: product.detail,
              quantity: parseInt(product.quantity),
              uom: product.unit
            })),
          // 15.2mm 產品
          ...formData.products152mm
            .filter(product => product.quantity && product.quantity > 0)
            .map(product => ({
              name: product.name,
              detail: product.detail,
              quantity: parseInt(product.quantity),
              uom: product.unit
            })),
          // Chair 訂單
          ...Object.entries(formData.chairs)
            .filter(([, quantity]) => quantity && quantity > 0)
            .map(([size, quantity]) => ({
              name: "Chair",
              detail: `${size}mm`,
              quantity: parseInt(quantity),
              uom: "bag"
            }))
        ],
        note: formData.note,
        isGuestOrder: !user
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Order submission failed');
      }

      const result = await response.json();
      setOrderNumber(result.order.orderNumber);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Order submission error:', error);
      alert(error.message || 'An error occurred while submitting the order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="order-form-container">
      <form className="order-form" onSubmit={handleSubmit}>
        <h2>Order Form</h2>

        {/* Customer Information Section */}
        <div className="form-section">
          <h3>Customer Information</h3>
          <div className="form-group">
            <label htmlFor="companyName">Company Name:</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.customerInfo.companyName}
              onChange={handleCustomerInfoChange}
              required
              disabled={!!user}
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactPerson">Site Contact Person:</label>
            <input
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={formData.customerInfo.contactPerson}
              onChange={handleCustomerInfoChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.customerInfo.phone}
              onChange={handleCustomerInfoChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.customerInfo.email}
              onChange={handleCustomerInfoChange}
              required
              disabled={!!user}
            />
          </div>
          <div className="form-group">
            <label htmlFor="deliveryAddress">Delivery Address:</label>
            <input
              type="text"
              id="deliveryAddress"
              name="deliveryAddress"
              value={formData.customerInfo.deliveryAddress}
              onChange={handleCustomerInfoChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="deliveryDate">Delivery Date:</label>
            <input
              type="date"
              id="deliveryDate"
              name="deliveryDate"
              value={formData.customerInfo.deliveryDate}
              onChange={handleCustomerInfoChange}
              required
              min={new Date().toISOString().split('T')[0]} // Set minimum date to today
            />
          </div>
          <div className="form-group delivery-time-group">
            <label>Delivery Time:</label>
            <div className="delivery-time-grid">
              <div className="delivery-time-option">
                <select
                  name="deliveryTime"
                  value={formData.customerInfo.deliveryTime}
                  onChange={handleDeliveryTimeChange}
                  className="delivery-time-select"
                >
                  <option value="">Morning</option>
                  {deliveryTimeOptions.morning.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="delivery-time-option">
                <select
                  name="deliveryTime"
                  value={formData.customerInfo.deliveryTime}
                  onChange={handleDeliveryTimeChange}
                  className="delivery-time-select"
                >
                  <option value="">Afternoon</option>
                  {deliveryTimeOptions.afternoon.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="delivery-time-option">
                <button
                  type="button"
                  className={`anytime-button ${
                    formData.customerInfo.deliveryTime === "anytime" ? "selected" : ""
                  }`}
                  onClick={() => handleDeliveryTimeChange({ target: { value: "anytime" } })}
                >
                  Anytime 7am to 3pm
                </button>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Crane Truck Request:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="craneTrackRequest"
                  value="YES"
                  onChange={handleCustomerInfoChange}
                  checked={formData.customerInfo.craneTrackRequest === "YES"}
                  required
                />
                YES
              </label>
              <label>
                <input
                  type="radio"
                  name="craneTrackRequest"
                  value="NO"
                  onChange={handleCustomerInfoChange}
                  checked={formData.customerInfo.craneTrackRequest === "NO"}
                />
                NO
              </label>
            </div>
          </div>
        </div>

        {/* 12.7mm Products Section */}
        <div className="form-section">
          <h3>Product Order 12.7mm</h3>
          <table className="product-table">
            <thead>
              <tr>
                <th>Item No.</th>
                <th>Item Name</th>
                <th>Detail</th>
                <th>Unit Order</th>
                <th>UOM</th>
              </tr>
            </thead>
            <tbody>
              {formData.products.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td>{product.name}</td>
                  <td>{product.detail}</td>
                  <td>
                    <input
                      type="number"
                      value={product.quantity || ""}
                      onChange={(e) => handleProductQuantityChange(product.id, e.target.value)}
                      min="0"
                    />
                  </td>
                  <td>{product.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 15.2mm Products Section */}
        <div className="form-section">
          <h3 
            onClick={() => setIsProducts152mmCollapsed(!isProducts152mmCollapsed)}
            style={{ cursor: 'pointer' }}
          >
            Product Order 15.2mm {isProducts152mmCollapsed ? '▼' : '▲'}
          </h3>
          {!isProducts152mmCollapsed && (
            <table className="product-table">
              <thead>
                <tr>
                  <th>Item No.</th>
                  <th>Item Name</th>
                  <th>Detail</th>
                  <th>Unit Order</th>
                  <th>UOM</th>
                </tr>
              </thead>
              <tbody>
                {formData.products152mm.map((product, index) => (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td>{product.name}</td>
                    <td>{product.detail}</td>
                    <td>
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => handleProduct152mmQuantityChange(product.id, e.target.value)}
                        min="0"
                      />
                    </td>
                    <td>{product.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Chair Order Section */}
        <div className="form-section">
          <h3 
            onClick={() => setIsChairTableCollapsed(!isChairTableCollapsed)}
            style={{ cursor: 'pointer' }}
          >
            Chair Order {isChairTableCollapsed ? '▼' : '▲'}
          </h3>
          {!isChairTableCollapsed && (
            <table className="chair-table">
              <thead>
                <tr>
                  <th>Chair Size (mm)</th>
                  <th>Quantity</th>
                  <th>UOM</th>
                </tr>
              </thead>
              <tbody>
                {chairSizes.map((size) => (
                  <tr key={size}>
                    <td>{size}</td>
                    <td>
                      <input
                        type="number"
                        value={formData.chairs[size]}
                        onChange={(e) => handleChairQuantityChange(size, e.target.value)}
                        min="0"
                      />
                    </td>
                    <td>bag</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Note Section */}
        <div className="form-section">
          <h3>Note</h3>
          <div className="form-group">
            <textarea
              className="note-textarea"
              rows="4"
              value={formData.note}
              onChange={handleNoteChange}
              placeholder="Add any additional notes or special instructions here..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Order'}
          </button>
        </div>
      </form>

      <OrderConfirmationModal
        isOpen={isModalOpen}
        onClose={resetForm}
        orderNumber={orderNumber}
      />
    </div>
  );
};

export default OrderForm;