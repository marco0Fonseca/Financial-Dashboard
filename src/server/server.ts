import express, { Request, Response } from 'express';
import cors from 'cors'; 
import { TransactionCategoryRepository, TransactionRepository, UserRepository } from '../repository/repository';
import { User } from '../entities/user';
import {generateToken, comparePassword, authenticateToken, AuthRequest} from './auth'
import { TransactionCategory, TransactionTypeClass } from '../entities/transactions/transactionCategory';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Repositories
const userRepo = new UserRepository();
const categoryRepo = new TransactionCategoryRepository();
const transactionRepo = new TransactionRepository();

// ==================== AUTHENTICATION ROUTES ====================

/**
 * POST /api/auth/signup
 * Create a new user account
 * Body: { name: string, email: string, password: string }
 */
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password is required and must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await userRepo.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = new User(name, email, password);
    const savedUser = await userRepo.create(user);
    
    // Generate JWT token
    const token = generateToken(savedUser.id);
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user', details: error });
  }
});

/**
 * POST /api/auth/signin
 * Sign in with email and password
 * Body: { email: string, password: string }
 */
app.post('/api/auth/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password is required and must be at least 6 characters' });
    }

    // Find user with password
    const { user, password: hashedPassword } = await userRepo.findUserByEmailWithPassword(email);
    if (!user || !hashedPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, hashedPassword);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user.id);
    
    res.json({
      message: 'Sign in successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sign in', details: error });
  }
});

// ==================== USER ROUTES ====================

/**
 * GET /api/users/me
 * Get current authenticated user
 */
app.get('/api/users/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await userRepo.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user', details: error });
  }
});

/**
 * GET /api/users/:id
 * Get a user by ID (protected - returns public info only)
 */
app.get('/api/users/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || !id.trim()) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await userRepo.findUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return public info only (no email for privacy)
    res.json({
      id: user.id,
      name: user.name
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user', details: error });
  }
});

/**
 * PATCH /api/users/:id/name
 * Update user name (protected - users can only update their own profile)
 * Body: { "name" : "newName" }
 */
app.patch('/api/users/:id/name', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const id = req.params.id;
        if (!id || !id.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their own profile
        if (req.userId !== id) {
            return res.status(403).json({ error: 'You can only update your own profile' });
        }

        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const user = await userRepo.findUserById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.name = name;
        const updatedUser = await userRepo.updateName(id,name);
        res.json({
            id: updatedUser.id,
            name : updatedUser.name,
            email : updatedUser.email
        });

    } catch (error){
        res.status(500).json({ error: 'Failed to update user', details: error });
    }
});

/**
 * PATCH /api/users/:id/email
 * Update user email (protected - users can only update their own profile)
 * Body: { "email" : "newEmail" }
 */
app.patch('/api/users/:id/email', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const id = req.params.id;
        if (!id || !id.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their own profile
        if (req.userId !== id) {
            return res.status(403).json({ error: 'You can only update your own profile' });
        }

        const { email } = req.body;
        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await userRepo.findUserById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user already exists
        const existingUser = await userRepo.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        user.email = email;
        const updatedUser = await userRepo.updateEmail(id,email);
        res.json({
            id: updatedUser.id,
            name : updatedUser.name,
            email : updatedUser.email
        });

    } catch (error){
        res.status(500).json({ error: 'Failed to update user', details: error });
    }
});

/**
 * PATCH /api/users/:id/password
 * Update user password (protected - users can only update their own profile)
 * Body: { "password" : "newPassword" }
 */
app.patch('/api/users/:id/password', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const id = req.params.id;
        if (!id || !id.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their own profile
        if (req.userId !== id) {
            return res.status(403).json({ error: 'You can only update your own profile' });
        }

        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password is required and must be at least 6 characters' });
        }

        const user = await userRepo.findUserById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedUser = await userRepo.updatePassword(id,password);
        res.json({
            id: updatedUser.id,
            name : updatedUser.name,
            email : updatedUser.email
        });

    } catch (error){
        res.status(500).json({ error: 'Failed to update user', details: error });
    }
});

/**
 * DELETE /api/users/:id
 * Delete a user (protected - users can only delete their own account)
 */
app.delete('/api/users/:id', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const id = req.params.id;
        if (!id || !id.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only delete their own account
        if (req.userId !== id) {
            return res.status(403).json({ error: 'You can only delete your own account' });
        }

        const user = await userRepo.findUserById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        await userRepo.delete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error){
        res.status(500).json({ error: 'Failed to delete user', details: error });
    }
});

// ==================== CATEGORIES ROUTES ====================

/**
 * POST /api/users/:userId/categories
 * Create a new transaction category (protected - users can only create tasks for themselves)
 * Body: { label: string, type: string }
 */
app.post('/api/users/:userId/categories', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || !id.trim()) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Users can only create categories for themselves
    if (req.userId !== id) {
        return res.status(403).json({ error: 'You can only create categories for yourself' });
    }

    const user = await userRepo.findUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { label, type } = req.body;

    if (!label || !label.trim()) {
      return res.status(400).json({ error: 'Lable is required' });
    }

    if (!type || !type.trim()) {
      return res.status(400).json({ error: 'Type is required' });
    }

    const categoryType = TransactionTypeClass[type as keyof typeof TransactionTypeClass];
    if (!categoryType) {
        return res.status(400).json({ error: 'Invalid category type' });
    }

    const category = new TransactionCategory(label,categoryType,id);
    const savedCategory = await categoryRepo.create(category)
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category', details: error });
  }
});

/**
 * GET /api/category/:id
 * Get a category by ID (protected - users can only access their own tasks)
 * Body: { userId: userId, id: categoryId }
 */
app.get('/api/category/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try{
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only access their own tasks
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only access your own tasks' });
        }

        const user = await userRepo.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const categoryId = Number(req.params.id);
        const category = await categoryRepo.findCategoryById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(category);
    }catch (error){
        res.status(500).json({ error: 'Failed to fetch category', details: error });
    }
});

/**
 * GET /api/users/:userId/categories
 * Get all categories for a specific user (protected - users can only access their own tasks)
 * Body: { userId: string }
 */
app.get('/api/users/:userId/categories', authenticateToken, async (req: AuthRequest, res: Response) => {
    try{
        const id = req.params.id;
        if (!id || !id.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only access their own tasks
        if (req.userId !== id) {
            return res.status(403).json({ error: 'You can only access your own tasks' });
        }

        const user = await userRepo.findUserById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const categories = await categoryRepo.findUserCategories(id);
        res.json(categories);
    }catch (error){
        res.status(500).json({ error: 'Failed to fetch categories', details: error });
    }
});

/**
 * PATCH /api/category/:id/label
 * Update user email (protected - users can only update their own profile)
 * Body: { userId : string, id : string, label : "newLabel" }
 */
app.patch('/api/users/:id/email', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their categories
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only update your own categories' });
        }

        const categoryId = req.params.id;
        if (!categoryId || !categoryId.trim()) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }

        
    } catch (error){
        res.status(500).json({ error: 'Failed to update user', details: error });
    }
});

// ==================== TRANSACTIONS ROUTES ====================

// ==================== ROOT ROUTE ====================

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Task List API Server is running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/`);
});

export default app;