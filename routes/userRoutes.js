import express from 'express';
import {
  signupUser,
  addUser,
  getAllUserData,
  loginUser,
  updateUserStatus,
  createSubadmin,
  updateUser,
  deleteUser,
  getDealerEmail
} from '../contollers/userController.js';


const router = express.Router();

router.post('/signup', signupUser);     // Public signup endpoint (creates inactive users)
router.post('/register', addUser);     // Frontend compatibility endpoint (admin function)
router.post('/addUser', addUser);      // Admin endpoint (same function)
router.post('/createSubadmin', createSubadmin);  // Create subadmin endpoint (for testing)
router.get('/getAllUserData', getAllUserData);
router.post('/login', loginUser);
router.put('/status/:id', updateUserStatus);
router.put('/updateUser/:id', updateUser);  // Update user endpoint
router.delete('/deleteUser/:id', deleteUser);  // Delete user endpoint
router.get("/dealer/email/:city", getDealerEmail);

export default router;