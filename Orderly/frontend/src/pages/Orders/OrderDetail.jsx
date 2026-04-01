import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getOrderDetail } from "../../api/orders";

export default function OrderDetails() {
    const { orderId } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(function () {
        fetchOrder();
    }, [orderId]);

    async function fetchOrder() {
        setLoading(true);
        setErrorMessage("");

        try {
            const data = await getOrderDetail(orderId);
            setOrder(data);
        }   catch (error) {
            setErrorMessage(error.message || "Failed to load order");
        }   finally {
            setLoading(false);
        }
    }

    function renderModifiers(modifiers) {
        if (!modifiers || modifiers.length === 0) {
            return null;
        }

        return (
            <div style={{ marginLeft: "1rem" }}>
                <p><strong>Modifiers:</strong></p>
                <ul>
                    {modifiers.map(renderModifierItem)}
                </ul>
            </div>
        );
    }

    function renderModifierItem(mod) {
        return (
            <li key={mod.optionId}>
                {mod.name} (+${mod.priceAdjustmentCharged})
            </li>
        );
    }

    function renderOrderItem(item) {
        return (
            <div key={item.itemId} style={{ marginBottom: "1rem"}}>
                <p>
                    <strong>{item.productName}</strong> ({item.variantName})
                </p>

                <p>Quantity: {item.quantity}</p>
                <p>Unit Price: ${item.unitPriceCharged}</p>
                <p>Item Total: ${item.itemTotal}</p>

                {renderModifiers(item.modifiers)}
            </div>
        );
    }

    function renderItems(items) {
        if (!items || items.length === 0) {
            return <p>No items in this order.</p>;
        }

        return items.map(renderOrderItem);
    }

    if (loading) {
        return <p>Loading order...</p>;
    }

    if (errorMessage) {
        return <p>{errorMessage}</p>;
    }

    if (!order) {
        return <p>No order found.</p>;
    }

    return (
        <div>
            <h2>Order #{order.id}</h2>

            <p>
                <strong>Date:</strong>{" "}
                {new Date(order.date).toLocaleString()}
            </p>

            <p>
                <strong>Status:</strong> {order.status}
            </p>

            <hr />

            <h3>Items</h3>
            {renderItems(order.items)}

            <hr />

            <h3>Totals</h3>
            <p>Tax: ${order.taxAmount}</p>
            <p>
                <strong>Total: ${order.totalDue}</strong>
            </p>
        </div>
    );
}
