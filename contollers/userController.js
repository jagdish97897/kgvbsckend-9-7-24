import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';


dotenv.config();

const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REF-${code}`;
};

// Public Signup Function (creates inactive users)
const signupUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address
    } = req.body;

    // Validate required fields
    if (!name || !password || !email || !phone) {
      return res.status(400).json({ errorMessage: 'Please enter all required fields (name, email, password, phone)' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ errorMessage: 'Please enter a valid email address' });
    }

    // Check if user already exists by email
    const existingUser = await User.findOne({
      $or: [{ username: name }, { email }]
    });
    if (existingUser) {
      return res.status(400).json({ errorMessage: 'User with this name or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate referral code
    const referralCode = generateReferralCode();

    // Create new user with inactive status
    const newUser = new User({
      username: name,
      password: hashedPassword,
      email,
      mobile: phone,
      role: 'user', // Default role for public signup
      idproof: 'Not Provided',
      idnumber: 'Not Provided',
      address: address || 'Not Provided',
      refralcode: referralCode,
      status: 'inactive', // Inactive by default - admin needs to approve
      addedBy: 'self-registration'
    });

    // Save user
    const savedUser = await newUser.save();

    res.json({
      success: true,
      title: 'Registration Successful',
      userId: savedUser._id,
      message: 'Your account has been created and is pending admin approval. You will be notified once activated.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Server error' });
  }
};


const addUser = async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      mobile,
      role,
      idproof,
      idnumber,
      address,
      branch,
      refralcode,
      status,
      addedByEmail
    } = req.body;

    // Validate required fields
    if (!username || !password || !email || !mobile || !addedByEmail) {
      return res.status(400).json({ errorMessage: 'Please enter all required fields (username, password, email, mobile, addedByEmail)' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ errorMessage: 'Please enter a valid email address' });
    }

    if (!emailRegex.test(addedByEmail)) {
      return res.status(400).json({ errorMessage: 'Please enter a valid admin email address' });
    }

    // Validate district field for dealer role
    if (role === 'dealer' && !branch) {
      return res.status(400).json({ errorMessage: 'District is required for dealer role' });
    }

    // Check if user already exists by username or email
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    if (existingUser) {
      return res.status(400).json({ errorMessage: 'User with this username or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate referral code if not provided
    const finalReferralCode = refralcode || generateReferralCode();

    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      mobile,
      role: role || 'user', // Fixed: Default role should be 'user', not 'admin'
      idproof: idproof || 'Not Provided',
      idnumber: idnumber || 'Not Provided',
      address: address || 'Not Provided',
      branch: branch || null, 
      refralcode: finalReferralCode,
      status: status || 'active',
      addedBy: addedByEmail
    });

    // Save user
    const savedUser = await newUser.save();


    res.json({
      title: 'User Added Successfully',
      userId: savedUser._id,
      message: `User ${username} added by ${addedByEmail}. Registration email sent.`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Server error' });
  }
};


export const getDealerEmail = async (req, res) => {
  const { city } = req.params;

  if (!city) {
    return res.status(400).json({ success: false, message: "City is required" });
  }

  try {
    const dealer = await User.findOne({ role: "dealer", branch: city });

    if (!dealer) {
      return res.status(404).json({ success: false, message: "Dealer not found for this city" });
    }

    return res.status(200).json({
      success: true,
      dealerEmail: dealer.email,
    });
  } catch (error) {
    console.error("❌ Error fetching dealer:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get All Users (excluding passwords)
const getAllUserData = async (req, res) => {
  try {
    // Find all users and exclude the password field from the response
    const allUsers = await User.find({}, { password: 0 });

    res.status(200).json(allUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Server error' });
  }
};
// Login User
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);

    if (!username || !password) {
      return res.status(400).json({ errorMessage: 'Please enter all fields' });
    }

    // Check if user exists by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    }).select('+password');
    if (!user) {
      return res.status(400).json({ errorMessage: 'User not found' });
    }

    // Check if account is active
    if (user.status && user.status !== 'active') {
      return res.status(400).json({ errorMessage: 'Account is not active. Please contact admin for activation.' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errorMessage: 'Invalid credentials' });
    }

    // Prepare login details for email notification
    const loginDetails = {
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
      userAgent: req.get('User-Agent') || 'Unknown',
      timestamp: new Date().toLocaleString()
    };

    const payload = {
      id: user._id,
      username: user.username,
      role: user.role
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      async (err, token) => {
        if (err) throw err;


        // Send response immediately (don't wait for email)
        res.json({
          success: true,
          token: 'Bearer ' + token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            idproof: user.idproof,
            address: user.address,
            district: user.district,
            refralcode: user.refralcode,
            status: user.status,
            addedBy: user.addedBy,
            date: user.date
          },
          message: 'Login successful. Email notification sent.'
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Server error' });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Allowed status values
    const allowedStatuses = ['active', 'inactive', 'terminated', 'resigned'];

    // Validate input
    if (!status || !allowedStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        errorMessage: `Invalid status. Allowed values are: ${allowedStatuses.join(', ')}`
      });
    }

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status: status.toLowerCase() },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ errorMessage: 'User not found' });
    }


    res.json({
      message: 'User status updated successfully',
      user: updatedUser,
      emailSent: status.toLowerCase() === 'active' ? 'Activation email sent to user' : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Server error' });
  }
};

// Create Subadmin User Function (for testing purposes)
const createSubadmin = async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      mobile
    } = req.body;

    // Validate required fields
    if (!username || !password || !email || !mobile) {
      return res.status(400).json({ errorMessage: 'Please enter all required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    if (existingUser) {
      return res.status(400).json({ errorMessage: 'User with this username or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate referral code
    const referralCode = generateReferralCode();

    // Create new subadmin user
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      mobile,
      role: 'subadmin',
      idproof: 'Not Provided',
      idnumber: 'Not Provided',
      address: 'Not Provided',
      refralcode: referralCode,
      status: 'active',
      addedBy: 'system'
    });

    // Save user
    const savedUser = await newUser.save();

    res.json({
      title: 'Subadmin Created Successfully',
      userId: savedUser._id,
      message: `Subadmin ${username} created successfully`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Server error' });
  }
};

// Update User Function
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      mobile,
      role,
      address,
      district,
      idproof,
      idnumber
    } = req.body;

    // Validate required fields
    if (!username || !email || !mobile) {
      return res.status(400).json({ errorMessage: 'Username, email, and mobile are required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ errorMessage: 'Please enter a valid email address' });
    }

    // Check if username or email already exists for other users
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: id } }, // Exclude current user
        { $or: [{ username }, { email }] }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ errorMessage: 'Username or email already exists' });
    }

    // Validate district field for dealer role
    if (role === 'dealer' && !district) {
      return res.status(400).json({ errorMessage: 'District is required for dealer role' });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        username,
        email,
        mobile,
        role: role || 'user',
        address: address || 'Not Provided',
        district: district || null,
        idproof: idproof || 'Not Provided',
        idnumber: idnumber || 'Not Provided'
      },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ errorMessage: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Server error' });
  }
};

// Delete User Function
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ errorMessage: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: deletedUser._id,
        username: deletedUser.username,
        email: deletedUser.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Server error' });
  }
};

export { signupUser, addUser, getAllUserData, loginUser, updateUserStatus, createSubadmin, updateUser, deleteUser };
