import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getOrderHistory, cancelOrder } from "../../api/orders";

export default function OrderHistory({}){
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(25);
    const [next, setNext] = useState(null);
    const [previous, setPrevious] = useState(null);
    const [sortKey, setSortKey] = useState("date");
    const [sortDir, setSortDir] = useState("desc");
    const [cancelling, setCancelling] = useState(null);

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
        if (next) setPage(page + 1);
    }

    function handlePrevious() {
        if (previous && page > 1) setPage(page - 1);
    }

    function handleSort(key) {
        if (sortKey === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    }

    async function handleCancel(e, orderId) {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        setCancelling(orderId);
        try {
            await cancelOrder(orderId);
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: "CANCELLED" } : o));
        } catch (error) {
            alert(error.message || "Failed to cancel order.");
        } finally {
            setCancelling(null);
        }
    }

    function sortedOrders() {
        return [...orders].sort(function (a, b) {
            let aVal = a[sortKey];
            let bVal = b[sortKey];

            if (sortKey === "date") {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else if (sortKey === "totalDue") {
                aVal = Number(aVal);
                bVal = Number(bVal);
            } else if (sortKey === "id") {
                aVal = Number(aVal);
                bVal = Number(bVal);
            }

            if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
    }

    function sortIndicator(key) {
        if (sortKey !== key) return " ↕";
        return sortDir === "asc" ? " ↑" : " ↓";
    }

    if (loading) {
        return <p>Loading order history...</p>
    }

    const isEmpty = !errorMessage && (!orders || orders.length === 0);
    const showEmpty = isEmpty || !!errorMessage;

    return (
        <>
            <div className="account-submenu">
                <Link to="/profile" className="account-submenu-tile">
                    <p className="account-submenu-tile__title">Profile</p>
                    <p className="account-submenu-tile__desc">View and update your personal information, address, and contact details.</p>
                </Link>
                <div className="account-submenu-tile account-submenu-tile--active">
                    <p className="account-submenu-tile__title">Order History</p>
                    <p className="account-submenu-tile__desc">Browse your past orders and check on their status.</p>
                </div>
            </div>
            <hr className="store-divider" />

            <div className="order-hist-pg">

                <h2 style={{ textAlign: "center" }}>Your Order History</h2>

                {showEmpty ? (
                    <p style={{ textAlign: "center" }}>You haven't placed any orders yet.</p>
                ) : (
                    <table className="order-hist-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort("id")}>Order #{sortIndicator("id")}</th>
                                <th onClick={() => handleSort("date")}>Date{sortIndicator("date")}</th>
                                <th onClick={() => handleSort("status")}>Status{sortIndicator("status")}</th>
                                <th onClick={() => handleSort("totalDue")}>Total{sortIndicator("totalDue")}</th>
                                <th className="order-hist-th--no-sort">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedOrders().map(function (order) {
                                return (
                                    <tr key={order.id} className="order-hist-row" onClick={() => navigate(`/orders/${order.id}`)}>
                                        <td>#{order.id}</td>
                                        <td>{new Date(order.date).toLocaleString()}</td>
                                        <td>{order.status}</td>
                                        <td>${order.totalDue}</td>
                                        <td onClick={e => e.stopPropagation()}>
                                            {order.status === "PENDING" && (
                                                <button
                                                    className="cancel-order-btn"
                                                    onClick={e => handleCancel(e, order.id)}
                                                    disabled={cancelling === order.id}
                                                >
                                                    {cancelling === order.id ? "Cancelling..." : "Cancel"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                <div className="order-hist-pagination">
                    <button onClick={handlePrevious} disabled={!previous}>Previous</button>
                    <span className="pg-num">Page {page}</span>
                    <button onClick={handleNext} disabled={!next}>Next</button>
                </div>
            </div>
        </>
    );
}
