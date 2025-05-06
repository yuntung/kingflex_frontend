import React from 'react';
import './OrderConfirmationSystem.css';

export const OrderConfirmationModal = ({ isOpen, onClose, orderNumber }) => {
    if (!isOpen) return null;

    const handleClose = () => {
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-content">
                    <h2>Order Completed!</h2>
                    <p>Your order has been successfully placed.</p>
                    <p>Order Number: {orderNumber}</p>
                    <p>A confirmation email will be sent to you shortly with the order details.</p>
                    <p>Please check your email for order confirmation.</p>
                    <div className="modal-buttons">
                        <button onClick={handleClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};