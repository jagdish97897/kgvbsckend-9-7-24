import express from "express";
import { checkout, getKey, verifyPayment, getAllOrders, getOrderById } from "../contollers/orderController.js";

const router = express.Router();

router.post("/order/checkout", checkout);
router.post("/order/verify", verifyPayment);
router.get("/order/getkey", getKey);

router.get("/orders", getAllOrders);
router.get("/order/:id", getOrderById);

export default router;