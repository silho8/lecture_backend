const { Note, File, User, sequelize } = require('../models');
const fs = require('fs').promises;
const path = require('path');

exports.createNote = async (req, res) => {
    const t = await sequelize.transaction();
    const uploadedFiles = [];

    try {
        const { title, course_code, course_name, visibility, tags } = req.body;
        const user_id = req.user.id;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one file is required.' });
        }

        // 1. Create the note record
        const note = await Note.create({
            user_id,
            title,
            course_code,
            course_name,
            visibility,
            tags: tags ? JSON.parse(tags) : null,
        }, { transaction: t });

        const note_id = note.id;

        // 2. Create final destination directory
        const finalDir = path.join(__dirname, `../../uploads/${user_id}/${note_id}`);
        await fs.mkdir(finalDir, { recursive: true });

        // 3. Move files and create file records
        for (const file of req.files) {
            const tempPath = file.path;
            const finalPath = path.join(finalDir, file.originalname);
            const relativePath = `uploads/${user_id}/${note_id}/${file.originalname}`;

            await fs.rename(tempPath, finalPath);
            uploadedFiles.push(finalPath); // Keep track for cleanup on failure

            await File.create({
                note_id,
                filename_original: file.originalname,
                file_path: relativePath,
                mimetype: file.mimetype,
                filesize_bytes: file.size,
            }, { transaction: t });
        }

        await t.commit();

        const newNote = await Note.findByPk(note_id, { include: ['files'] });

        res.status(201).json({ message: "Note created successfully", note: newNote });

    } catch (error) {
        await t.rollback();
        // Clean up uploaded files on failure
        for (const file of req.files) {
            try {
                await fs.unlink(file.path); // remove from tmp
            } catch (e) { console.error("Failed to cleanup temp file:", e.message)}
        }
        for (const file of uploadedFiles) {
             try {
                await fs.unlink(file); // remove from final dest
            } catch (e) { console.error("Failed to cleanup final file:", e.message)}
        }
        console.error(error);
        res.status(500).json({ message: "Server error during note creation." });
    }
};

exports.getNotes = async (req, res) => {
    try {
        const { page = 1, limit = 10, q, visibility = 'public' } = req.query;
        const offset = (page - 1) * limit;
        const { id: userId, role } = req.user;
        const { Op } = require('sequelize');

        let whereClause = {};

        // Search query
        if (q) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${q}%` } },
                { course_code: { [Op.like]: `%${q}%` } },
                { tags: { [Op.like]: `%${q}%` } } // Assumes tags are stored in a way that can be searched with LIKE
            ];
        }

        // Visibility filter
        if (visibility === 'public') {
            whereClause.visibility = 'public';
        } else if (visibility === 'private') {
            whereClause.visibility = 'private';
            whereClause.user_id = userId; // Can only see own private notes
        } else if (visibility === 'all') {
            // If 'all', show public notes and user's own private notes
            whereClause[Op.or] = [
                { visibility: 'public' },
                {
                    [Op.and]: [
                        { visibility: 'private' },
                        { user_id: userId }
                    ]
                }
            ];
        }


        const { count, rows } = await Note.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: offset,
            include: [{ model: User, as: 'uploader', attributes: ['id', 'full_name'] }, {model: File, as: 'files', attributes: ['id', 'mimetype']}],
            order: [['created_at', 'DESC']],
            distinct: true,
        });

        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            notes: rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching notes." });
    }
};

exports.getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;

        const note = await Note.findByPk(id, {
            include: [
                { model: User, as: 'uploader', attributes: ['id', 'full_name', 'avatar_path'] },
                { model: File, as: 'files' }
            ]
        });

        if (!note) {
            return res.status(404).json({ message: "Note not found." });
        }

        // Authorization check
        if (note.visibility === 'private' && note.user_id !== userId && role !== 'admin') {
            return res.status(403).json({ message: "You are not authorized to view this note." });
        }

        res.status(200).json({ note });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching note." });
    }
};

exports.updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, course_code, course_name, visibility, tags } = req.body;
        const { id: userId } = req.user;

        const note = await Note.findByPk(id);

        if (!note) {
            return res.status(404).json({ message: "Note not found." });
        }

        // Authorization check: only owner can update
        if (note.user_id !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this note." });
        }

        // Update fields
        note.title = title || note.title;
        note.course_code = course_code || note.course_code;
        note.course_name = course_name || note.course_name;
        note.visibility = visibility || note.visibility;
        note.tags = tags ? JSON.parse(tags) : note.tags;

        await note.save();

        const updatedNote = await Note.findByPk(id, { include: ['files', 'uploader'] });

        res.status(200).json({ message: "Note updated successfully.", note: updatedNote });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while updating note." });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;

        const note = await Note.findByPk(id);

        if (!note) {
            return res.status(404).json({ message: "Note not found." });
        }

        // Authorization check: only owner or admin can delete
        if (note.user_id !== userId && role !== 'admin') {
            return res.status(403).json({ message: "You are not authorized to delete this note." });
        }

        // Delete associated files from filesystem
        // The directory is /uploads/{user_id}/{note_id}
        const noteDir = path.join(__dirname, `../../uploads/${note.user_id}/${note.id}`);
        await fs.rm(noteDir, { recursive: true, force: true });

        // Delete note from DB (files records will be cascaded)
        await note.destroy();

        res.status(200).json({ message: "Note and associated files deleted successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while deleting note." });
    }
};

exports.previewFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { id: userId, role } = req.user;

        const file = await File.findByPk(fileId, { include: { model: Note, as: 'note' } });

        if (!file) {
            return res.status(404).json({ message: "File not found." });
        }

        // Authorization check on the parent note
        if (file.note.visibility === 'private' && file.note.user_id !== userId && role !== 'admin') {
            return res.status(403).json({ message: "You are not authorized to view this file." });
        }

        const filePath = path.join(__dirname, '../../', file.file_path);

        res.setHeader('Content-Type', file.mimetype);
        res.sendFile(filePath);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while previewing file." });
    }
};

exports.downloadFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { id: userId, role } = req.user;

        const file = await File.findByPk(fileId, { include: { model: Note, as: 'note' } });

        if (!file) {
            return res.status(404).json({ message: "File not found." });
        }

        // Authorization check
        if (file.note.visibility === 'private' && file.note.user_id !== userId && role !== 'admin') {
            return res.status(403).json({ message: "You are not authorized to download this file." });
        }

        const filePath = path.join(__dirname, '../../', file.file_path);

        res.download(filePath, file.filename_original);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while downloading file." });
    }
};
