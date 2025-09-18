const { User, Note } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;

exports.listUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await User.findAndCountAll({
            limit: parseInt(limit),
            offset: offset,
            order: [['created_at', 'DESC']],
            attributes: { exclude: ['password_hash'] }
        });

        res.status(200).json({
            totalUsers: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            users: rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching users." });
    }
};

exports.banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Prevent admin from banning themselves or another admin
        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Admins cannot be banned.' });
        }

        user.status = user.status === 'active' ? 'banned' : 'active';
        await user.save();

        res.status(200).json({ message: `User status updated to ${user.status}.` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while updating user status." });
    }
};

exports.listAllNotes = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Note.findAndCountAll({
            limit: parseInt(limit),
            offset: offset,
            order: [['created_at', 'DESC']],
            include: [{ model: User, as: 'uploader', attributes: ['id', 'full_name'] }]
        });

        res.status(200).json({
            totalNotes: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            notes: rows,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching all notes." });
    }
};

exports.deleteNoteAsAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findByPk(id);

        if (!note) {
            return res.status(404).json({ message: "Note not found." });
        }

        const noteDir = path.join(__dirname, `../../uploads/${note.user_id}/${note.id}`);
        await fs.rm(noteDir, { recursive: true, force: true });

        await note.destroy();

        res.status(200).json({ message: "Note deleted successfully by admin." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while deleting note." });
    }
};
