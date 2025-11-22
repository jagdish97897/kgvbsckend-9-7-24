// routes/contactRoutes.js
import express from "express";
import { createContact, getAllContacts } from "../contollers/contactController.js";

const router = express.Router();

// POST route to create a contact
router.post("/contact", createContact);

// GET route to fetch all contacts (optional, for admin)
router.get("/contacts", getAllContacts);

export default router;
