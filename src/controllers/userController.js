const { User } = require('../models');

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
exports.getUserProfile = async (req, res) => {
    // The `protect` middleware already attaches the user to the request
    res.status(200).json({ user: req.user });
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (user) {
            user.full_name = req.body.full_name || user.full_name;
            user.university = req.body.university || user.university;
            user.matric_number = req.body.matric_number || user.matric_number;

            // TODO: Handle avatar upload

            const updatedUser = await user.save();
            res.status(200).json({
                message: "Profile updated successfully",
                user: updatedUser,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating profile.' });
    }
};

// @desc    Update user theme preference
// @route   PUT /api/users/me/theme
// @access  Private
exports.updateUserTheme = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        const { theme } = req.body;

        if (user && (theme === 'light' || theme === 'dark')) {
            user.theme_preference = theme;
            await user.save();
            res.status(200).json({ message: `Theme updated to ${theme}` });
        } else if (!user) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.status(400).json({ message: 'Invalid theme value.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating theme.' });
    }
};
