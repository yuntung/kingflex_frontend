// ProductManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProductManagement.css';

const ProductManagement = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('normal');
    const [editingProduct, setEditingProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        detail: '',
        unit: '',
        type: 'normal'
    });

    // 檢查權限
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
    }, [user, navigate]);

    // 載入產品資料
    useEffect(() => {
        if (user?.role === 'admin') {
            loadProducts(activeTab);
        }
    }, [activeTab, user]);

    const loadProducts = async (type) => {
        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products?type=${type}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'  // 這確保所有請求都帶上 cookies，包括認證token
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch products');
            }

            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error('Load products error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.unit) {
            alert('Product name and unit are required!');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const productToAdd = {
                ...newProduct,
                type: activeTab
            };

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(productToAdd),
              });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add product');
            }

            const addedProduct = await response.json();
            setProducts(prevProducts => [...prevProducts, addedProduct]);

            setNewProduct({
                name: '',
                detail: '',
                unit: '',
                type: activeTab
            });

            alert('Product added successfully!');
        } catch (err) {
            setError(err.message);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        if (!editingProduct?.id || !editingProduct.name || !editingProduct.unit) {
            alert('Product name and unit are required!');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${editingProduct.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(editingProduct),
              });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update product');
            }

            const updatedProduct = await response.json();
            setProducts(prevProducts =>
                prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
            );
            setEditingProduct(null);
            alert('Product updated successfully!');
        } catch (err) {
            setError(err.message);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${productId}`, {
                method: 'DELETE',
                credentials: 'include'
              });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete product');
            }

            await response.json();
            setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
            alert('Product deleted successfully!');
        } catch (err) {
            setError(err.message);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="product-management">
            <h2>Product Management</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="product-tabs">
                <button 
                    className={`tab-button ${activeTab === 'normal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('normal')}
                >
                    12.7mm Products
                </button>
                <button 
                    className={`tab-button ${activeTab === '152mm' ? 'active' : ''}`}
                    onClick={() => setActiveTab('152mm')}
                >
                    15.2mm Products
                </button>
                <button 
                    className={`tab-button ${activeTab === 'shared' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shared')}
                >
                    Shared Products
                </button>
            </div>
            
            <div className="add-product-form">
                <h3>Add New {activeTab === 'normal' ? '12.7mm' : activeTab === '152mm' ? '15.2mm' : 'Shared'} Products</h3>
                <form onSubmit={handleAddProduct}>
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Detail"
                        value={newProduct.detail}
                        onChange={(e) => setNewProduct({...newProduct, detail: e.target.value})}
                    />
                    <input
                        type="text"
                        placeholder="Unit (e.g., Ton, Set, M)"
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Product'}
                    </button>
                </form>
            </div>

            <div className="products-list">
                <h3>{activeTab === 'normal' ? '12.7mm' : activeTab === '152mm' ? '15.2mm' : 'Shared'} Products List</h3>
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : products.length === 0 ? (
                    <div className="no-products">No products found</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Detail</th>
                                <th>Unit</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        {editingProduct?.id === product.id ? (
                                            <input
                                                value={editingProduct.name}
                                                onChange={(e) => setEditingProduct({
                                                    ...editingProduct,
                                                    name: e.target.value
                                                })}
                                                required
                                            />
                                        ) : product.name}
                                    </td>
                                    <td>
                                        {editingProduct?.id === product.id ? (
                                            <input
                                                value={editingProduct.detail}
                                                onChange={(e) => setEditingProduct({
                                                    ...editingProduct,
                                                    detail: e.target.value
                                                })}
                                            />
                                        ) : product.detail}
                                    </td>
                                    <td>
                                        {editingProduct?.id === product.id ? (
                                            <input
                                                value={editingProduct.unit}
                                                onChange={(e) => setEditingProduct({
                                                    ...editingProduct,
                                                    unit: e.target.value
                                                })}
                                                required
                                            />
                                        ) : product.unit}
                                    </td>
                                    <td>
                                        {editingProduct?.id === product.id ? (
                                            <>
                                                <button
                                                    className="save-btn"
                                                    onClick={handleUpdateProduct}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className="cancel-btn"
                                                    onClick={() => setEditingProduct(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => setEditingProduct(product)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ProductManagement;