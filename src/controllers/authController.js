const { User } = require('../models');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');

// @desc    Register a new user
exports.signup = async (req, res) => {
    try {
        const { email, password, full_name } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            email,
            password_hash,
            full_name,
        });

        const tokenPayload = { id: newUser.id, role: newUser.role };
        const token = generateToken(tokenPayload);

        // Remove password hash from the output
        const userResponse = newUser.toJSON();
        delete userResponse.password_hash;

        res.status(201).json({
            message: "Signup successful",
            user: userResponse,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
};

// @desc    Authenticate user and get token
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const tokenPayload = { id: user.id, role: user.role };
        const token = generateToken(tokenPayload);

        res.cookie('lectura_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const userResponse = user.toJSON();
        delete userResponse.password_hash;

        res.status(200).json({
            message: "Login successful",
            user: userResponse
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

// @desc    Request password reset
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Still send a 200 to not reveal which emails are registered
            return res.status(200).json({ message: "If a user with that email exists, a password reset link has been sent." });
        }

        // Create a short-lived token specific to this user and this action
        const resetTokenPayload = { id: user.id, action: 'reset-password' };
        const resetToken = jwt.sign(resetTokenPayload, process.env.JWT_SECRET, { expiresIn: '15m' });

        // In a real app, you would email this token. For this project, return it.
        console.log(`Password reset token for ${email}: ${resetToken}`);
        res.status(200).json({
            message: "Password reset token generated. In a real app, this would be emailed.",
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during password reset request.' });
    }
};

// @desc    Reset user's password
exports.resetPassword = async (req, res) => {
    try {
        const { token, new_password } = req.body;

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }

        if (decoded.action !== 'reset-password') {
             return res.status(401).json({ message: 'Invalid token purpose.' });
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(new_password, salt);

        user.password_hash = password_hash;
        await user.save();

        res.status(200).json({ message: "Password has been reset successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during password reset.' });
    }
};
