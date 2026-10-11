// Seed demo orders so the Track Order page returns real data.
// Usage: node scripts/seedOrders.js
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../db/mongodb");
const Order = require("../app/user/model/order.model");
const SubOrder = require("../app/user/model/subOrder.model");

(async () => {
  await connectDB();

  const orderId = "BENNA-ORD-20251011-000001";
  const subOrderId = "BENNA-SUB-20251011-000001-A";

  const lineItems = [
    {
      id: "li-1",
      productName: "Ordinary Portland Cement OPC 50kg",
      quantity: 40,
      productPrice: 14.25,
      image:
        "https://static.wixstatic.com/media/a3b8d7_2fdc5e16c9484b12a48207f662a594af~mv2.jpg",
    },
    {
      id: "li-2",
      productName: "Steel Rebar 12mm Grade 60",
      quantity: 1,
      productPrice: 2650,
      image:
        "https://static.wixstatic.com/media/b99a57_ee69ec4b62f94b1497e0fd89332226c4~mv2.png",
    },
    {
      id: "li-3",
      productName: "Porcelain Floor Tiles 60x60",
      quantity: 12,
      productPrice: 42,
      image:
        "https://static.wixstatic.com/media/a3b8d7_037a45671d2e4d0d9e1789e3af24b975~mv2.jpg",
    },
  ];

  const subtotal = lineItems.reduce(
    (s, i) => s + i.productPrice * i.quantity,
    0,
  );
  const shippingRate = 30;
  const vat = +(subtotal * 0.15).toFixed(2);
  const grandTotal = subtotal + vat + shippingRate;

  await Order.updateOne(
    { orderId },
    {
      $set: {
        orderId,
        orderNumber: orderId,
        customerId: new mongoose.Types.ObjectId(),
        customerEmail: "demo@test.com",
        customerPhone: "+966501234567",
        guestId: "demo-guest",
        isGuest: true,
        status: "shipped",
        paymentStatus: "paid",
        fulfillmentStatus: "shipped",
        paymentMethod: "card",
        currency: "SAR",
        totalPrice: grandTotal,
        shippingRate,
        lineItems,
        lineItemsCount: lineItems.length,
        shippingAddress: {
          city: "Riyadh",
          address: "King Fahd Rd",
          phone: "+966501234567",
        },
        amounts: {
          subtotal,
          vat,
          shipping: shippingRate,
          discount: 0,
          grandTotal,
          currency: "SAR",
        },
      },
    },
    { upsert: true },
  );

  await SubOrder.updateOne(
    { orderId: subOrderId },
    {
      $set: {
        orderId: subOrderId,
        parentOrderId: orderId,
        status: "shipped",
        products: [
          {
            productId: "demo-p1",
            productName: "Ordinary Portland Cement OPC 50kg",
            quantity: 40,
            price: 14.25,
            image:
              "https://static.wixstatic.com/media/a3b8d7_2fdc5e16c9484b12a48207f662a594af~mv2.jpg",
          },
        ],
        payments: [{ method: "card", amount: grandTotal, status: "captured" }],
        orderProofs: [],
      },
    },
    { upsert: true },
  );

  console.log(`Seeded demo order ${orderId} + sub-order ${subOrderId}`);
  console.log("Track it at /track-order?orderId=" + orderId);
  await mongoose.disconnect();
})();
