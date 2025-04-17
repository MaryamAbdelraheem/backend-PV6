const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { Doctor } = require('../models'); // استيراد موديل الطبيب
const { generateToken } = require("../middleware/authMiddleware");

const SECRET_KEY = process.env.JWT_SECRET || 'ophiucs-project-secret-jwt';

/**
 * @method POST
 * @route /api/doctor
 * @desc login a doctor
 * @access public 
 */
//chat
exports.login = asyncHandler(async (req, res, next) => {
    const hashed = await bcrypt.hash('password123', 1);
    console.log('Hashed password:', hashed);

    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ where: { email } });
    if (!doctor) {
        return res.status(401).json({ message: 'بيانات الاعتماد غير صحيحة' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'بيانات الاعتماد غير صحيحة' });
    }

    const token = generateToken(doctor, "doctor");

    res.status(200).json({
        message: 'تم تسجيل الدخول بنجاح',
        doctor: {
            doctorId: doctor.doctorId, // ✅ استخدم نفس الاسم اللي في الموديل
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            email: doctor.email,
            phoneNumber: doctor.phoneNumber,
            specialization: doctor.specialization,
            gender: doctor.gender
        },
        token
    });

});

const tokenBlacklist = new Set();
/**
 * @method POST
 * @route /api/doctor
 * @desc logout a doctor
 * @access public 
 */

exports.logout = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "لم يتم توفير التوكن" });
    }

    const token = authHeader.split(" ")[1];

    try {
        jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return res.status(401).json({ message: "توكن غير صالح" });
    }

    tokenBlacklist.add(token);

    res.status(200).json({
        message: "تم تسجيل الخروج بنجاح"
    });
});