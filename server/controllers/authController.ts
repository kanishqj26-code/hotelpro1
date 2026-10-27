import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Users, UserDoc } from '../db.ts';
import { JWT_SECRET, AuthRequest } from '../middleware/auth.ts';

export function sanitizeUser(user: UserDoc) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      res.status(400).json({ success: false, message: 'All fields (Name, Email, Password, Mobile) are required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    const existingUser = Users.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Support role selection if specified (matches the screenshot's 'SELECT USER' dropdown!)
    const assignedRole = role === 'admin' ? 'admin' : 'customer';

    const newUser = Users.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      phone: phone.trim(),
      role: assignedRole,
      isActive: true
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      user: sanitizeUser(newUser),
      token
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = Users.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email address or password.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact administration.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email address or password.' });
      return;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: sanitizeUser(user),
      token
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
}

export function getMe(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }
  res.status(200).json({
    success: true,
    user: sanitizeUser(req.user)
  });
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const { name, phone, password } = req.body;
  const updates: Partial<UserDoc> = {};

  if (name && name.trim()) updates.name = name.trim();
  if (phone && phone.trim()) updates.phone = phone.trim();

  if (password) {
    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    updates.passwordHash = await bcrypt.hash(password, salt);
  }

  const updatedUser = Users.findByIdAndUpdate(req.user._id, updates);
  if (!updatedUser) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully!',
    user: sanitizeUser(updatedUser)
  });
}
