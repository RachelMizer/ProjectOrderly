import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrderHistory } from "../../api/orders";

export default function OrderHistory({}){
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(25);
    const [next, setNext] = useState(null);
    const [previous, setPrevious] = useState(null);

    useEffect(function () {
        fetchOrders();
    }, [page]);

    async function fetchOrders(){
        setLoading(true);
        setErrorMessage("");

        try {
            const data = await getOrderHistory({ page, pageSize });

            setOrders(data.results || []);
            setNext(data.next);
            setPrevious(data.previous);
        } catch (error) {
            setErrorMessage(error.message || "Failed to load order history");
        } finally {
            setLoading(false);
        }
    }

    function handleNext() {
        if (next) {
            setPage(page + 1);
        }
    }

    function handlePrevious() {
        if (previous && page > 1) {
            setPage(page - 1);
        }
    }

    function handleOrderClick(orderId) {
        navigate(`/orders/${orderId}`);
    }

    function renderOrderItems(order) {
        return (
            <div className="order-hist-item"
                key={order.id}
                onClick={function (){
                    handleOrderClick(order.id);
                }}
            >
                <p>
                    <strong>Order #{order.id}</strong>
                </p>

                <p>
                    Date: {new Date(order.date).toLocaleString()}
                </p>

                <p>Status: {order.status}</p>
                <p>Total: ${order.totalDue}</p>

            </div>
        );
    }

    function renderOrders(){
        if (!orders || orders.length === 0){
            return <p>No past orders found.</p>
        }

        return orders.map(renderOrderItems);
    }

    if (loading) {
        return <p>Loading order history...</p>
    }

    if (errorMessage) {
        return (
            <div style={{ textAlign: "center", padding: "2rem" }}>
                <p>{errorMessage}</p>
            </div>
        );
    }

    return (
        <div className="order-hist-pg">
            <h2>Order History</h2>

            <div>{renderOrders()}</div>

            <div>
                <button onClick={handlePrevious} disabled={!previous}>
                    Previous
                </button>

                    <span className="pg-num">Page {page}</span>

                <button onClick={handleNext} disabled={!next}>
                    Next
                </button>
            </div>
        </div>
    );
}