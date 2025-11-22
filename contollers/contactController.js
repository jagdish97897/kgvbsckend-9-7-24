// controllers/contactController.js
import { Contact } from "../models/contact.js";

// Create a new contact
export const createContact = async (req, res) => {
  try {
    const { name, lastname, email, address, query } = req.body;

    if (!name || !lastname || !email || !address || !query) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const newContact = new Contact({ name, lastname, email, address, query });
    await newContact.save();

    res.status(201).json({ success: true, message: "Contact submitted successfully." });
  } catch (error) {
    console.error("Contact creation error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get all contacts (optional)
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, contacts });
  } catch (error) {
    console.error("Fetching contacts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch contacts" });
  }
};
