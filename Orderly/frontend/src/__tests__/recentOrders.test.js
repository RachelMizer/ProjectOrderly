import {
pushRecentOrder,
removeRecentOrder,
clearRecentOrders
} from "../utils/recentOrders";

describe("recentOrders", () => {

beforeEach(() => {
localStorage.clear();
});


test("pushes first recent order", () => {
pushRecentOrder({
id:1,
customerFirstName:"Kenny",
customerLastName:"Bacdayan"
});

const stored = JSON.parse(
localStorage.getItem("orderly_recent_orders")
);

expect(stored).toEqual([
{
id:1,
customerName:"Kenny Bacdayan"
}
]);
});


test("handles missing customer names as null", () => {
pushRecentOrder({
id:2
});

const stored = JSON.parse(
localStorage.getItem("orderly_recent_orders")
);

expect(stored[0]).toEqual({
id:2,
customerName:null
});
});


test("updates duplicate order by moving it to front", () => {
pushRecentOrder({
id:1,
customerFirstName:"First",
customerLastName:"Order"
});

pushRecentOrder({
id:2,
customerFirstName:"Second",
customerLastName:"Order"
});

pushRecentOrder({
id:1,
customerFirstName:"Updated",
customerLastName:"Order"
});

const stored = JSON.parse(
localStorage.getItem("orderly_recent_orders")
);

expect(stored[0].id).toBe(1);
expect(stored).toHaveLength(2);
});


test("limits recent orders to five", () => {
for(let i=1;i<=6;i++){
pushRecentOrder({
id:i,
customerFirstName:`User${i}`
});
}

const stored = JSON.parse(
localStorage.getItem("orderly_recent_orders")
);

expect(stored).toHaveLength(5);
expect(stored[0].id).toBe(6);
expect(
stored.find(o=>o.id===1)
).toBeUndefined();
});


test("removes a recent order", () => {
pushRecentOrder({id:1});
pushRecentOrder({id:2});

removeRecentOrder(1);

const stored = JSON.parse(
localStorage.getItem("orderly_recent_orders")
);

expect(stored).toEqual([
{
id:2,
customerName:null
}
]);
});


test("removing non-existent order leaves list unchanged", () => {
pushRecentOrder({id:1});

removeRecentOrder(99);

const stored = JSON.parse(
localStorage.getItem("orderly_recent_orders")
);

expect(stored).toHaveLength(1);
expect(stored[0].id).toBe(1);
});


test("clears recent orders", () => {
pushRecentOrder({id:1});

clearRecentOrders();

expect(
localStorage.getItem("orderly_recent_orders")
).toBeNull();
});

});