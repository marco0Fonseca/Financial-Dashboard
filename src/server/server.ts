import express, { Request, Response } from 'express';
import cors from 'cors'; 
import { InvestmentRepository, TransactionCategoryRepository, TransactionRepository, UserRepository } from '../repository/repository';
import { User } from '../entities/user';
import {generateToken, comparePassword, authenticateToken, AuthRequest} from './auth'
import { TransactionCategory } from '../entities/transactions/transactionCategory';
import { TransactionTypeClass } from "../entities/transactionTypeClass";
import { TransactionType } from '@prisma/client';
import { Transaction } from '../entities/transactions/transaction';
import { Investment } from '../entities/investment/investment';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Repositories
const userRepo = new UserRepository();
export const categoryRepo = new TransactionCategoryRepository();
const transactionRepo = new TransactionRepository();
const investmentRepo = new InvestmentRepository();

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
 * Create a new transaction category (protected - users can only create categories for themselves)
 * Body: { label: string, type: string }
 */
app.post('/api/users/:userId/categories', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId;
    if (!userId || !userId.trim()) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Users can only create categories for themselves
    if (req.userId !== userId) {
        return res.status(403).json({ error: 'You can only create categories for yourself' });
    }

    const user = await userRepo.findUserById(userId);
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

    const category = new TransactionCategory(label,categoryType,userId);
    const savedCategory = await categoryRepo.create(category)
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category', details: error });
  }
});

/**
 * GET /api/users/userId/category/:id
 * Get a category by ID (protected - users can only access their own categories)
 */
app.get('/api/users/userId/category/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try{
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only access their own categories
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only access your own categories' });
        }

        const user = await userRepo.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const categoryId = Number(req.params.id);
        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }

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
 * Get all categories for a specific user (protected - users can only access their own categories)
 */
app.get('/api/users/:userId/categories', authenticateToken, async (req: AuthRequest, res: Response) => {
    try{
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only access their own categories
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only access your own categories' });
        }

        const user = await userRepo.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const categories = await categoryRepo.findUserCategories(userId);
        res.json(categories);
    }catch (error){
        res.status(500).json({ error: 'Failed to fetch categories', details: error });
    }
});

/**
 * PATCH /api/users/:userId/category/:id/label
 * Update category label (protected - users can only update their own categories)
 * Body: { label : "newLabel" }
 */
app.patch('/api/users/:userId/category/:id/label', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their categories
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only update your own categories' });
        }

        const categoryId = Number(req.params.id);
        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }

        const category = await categoryRepo.findCategoryById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const { label } = req.body.label;
        if (!label || !label.trim()) {
            return res.status(400).json({ error: 'Label is required' });
        }

        category.label = label;
        const updateCategory = await categoryRepo.updateLabel(categoryId, label);
        const categoryType = TransactionType[updateCategory.type as keyof typeof TransactionType];
        res.json({
          userId : updateCategory.userId,
          id : updateCategory.id,
          label : updateCategory.label,
          type  : categoryType
        });
    } catch (error){
        res.status(500).json({ error: 'Failed to update category', details: error });
    }
});

/**
 * PATCH /api/users/:userId/category/:id/type
 * Update category type (protected - users can only update their own categories)
 * Body: { type : "newType" }
 */
app.patch('/api/users/:userId/category/:id/type', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their categories
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only update your own categories' });
        }

        const categoryId = Number(req.params.id);
        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }

        const category = await categoryRepo.findCategoryById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const { type } = req.body.type;
        if (!type || !type.trim()) {
            return res.status(400).json({ error: 'Type is required' });
        }

        const categoryType = TransactionTypeClass[type as keyof typeof TransactionTypeClass];

        category.type = type;
        const updateCategory = await categoryRepo.updateType(categoryId, categoryType);
        res.json({
          userId : updateCategory.userId,
          id : updateCategory.id,
          label : updateCategory.label,
          type  : categoryType
        });
    } catch (error){
        res.status(500).json({ error: 'Failed to update Type', details: error });
    }
});

/**
 * DELETE /api/users/:userId/category/:id
 * Delete a user category (protected - users can only delete their own categories)
 */
app.delete('/api/users/:userId/category/:id', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only delete their own categories
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only delete your own categories' });
        }

        const user = await userRepo.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const categoryId = Number(req.params.id);
        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }

        const category = await categoryRepo.findCategoryById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        await categoryRepo.delete(categoryId);
        res.json({ message: 'Category deleted successfully' });
    } catch (error){
        res.status(500).json({ error: 'Failed to delete category', details: error });
    }
});

// ==================== TRANSACTIONS ROUTES ====================

/**
 * POST /api/users/:userId/categories/:categoryId/transactions
 * Create a new transaction (protected - users can only create transactions for themselves)
 * Body: { description : string | undefined,value : number, date : date, recurrence : boolean }
 */
app.post('/api/users/:userId/categories/:categoryId/transactions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId;
    if (!userId || !userId.trim()) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Users can only create transactions for themselves
    if (req.userId !== userId) {
        return res.status(403).json({ error: 'You can only create transactions for yourself' });
    }

    const user = await userRepo.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const categoryId = Number(req.params.id);
    if (isNaN(categoryId)) {
        return res.status(400).json({ error: 'Invalid category ID' });
    }

    const category = await categoryRepo.findCategoryById(categoryId);
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }
    
    const { description, value, date, recurrence } = req.body;

    if (!value || !value.trim()) {
      return res.status(400).json({ error: 'Value is required' });
    }
    const valueNumber = Number(value);
    if(isNaN(valueNumber)){
      return res.status(400).json({ error: 'Invalid value' });
    }

    if (!date || !date.trim()) {
      return res.status(400).json({ error: 'Date is required' });
    }
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    let recurrenceBool: boolean;

    if (recurrence === "true" || recurrence === true) {
      recurrenceBool = true;
    } else if (recurrence === "false" || recurrence === false) {
      recurrenceBool = false;
    } else {
      recurrenceBool = false;
    }

    const transaction = new Transaction( 
      description,
      category, 
      valueNumber,
      dateObj,
      recurrenceBool,
      userId
    );

    const savedTransaction = await transactionRepo.create(transaction);
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction', details: error });
  }
});

/**
 * GET /api/users/userId/transaction/:id
 * Get a transaction by ID (protected - users can only access their own transactions)
 */
app.get('/api/users/userId/transaction/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try{
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only access their own transactions
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only access your own transactions' });
        }

        const user = await userRepo.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const transactionId = Number(req.params.id);
        if (isNaN(transactionId)) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }

        const transaction = await transactionRepo.findTransactionById(transactionId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(transaction);
    }catch (error){
        res.status(500).json({ error: 'Failed to fetch transaction', details: error });
    }
});

/**
 * GET /api/users/:userId/transactions
 * Get all transactions for a specific user (protected - users can only access their own trasactions)
 */
app.get('/api/users/:userId/transactions', authenticateToken, async (req: AuthRequest, res: Response) => {
    try{
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only access their own transactions
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only access your own transactions' });
        }

        const user = await userRepo.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const transactions = await transactionRepo.findUserTransactions(userId);
        res.json(transactions);
    }catch (error){
        res.status(500).json({ error: 'Failed to fetch transactions', details: error });
    }
});

/**
 * GET /api/users/:userId/transactions/byDate
 * Get all transactions of date a period (protected - users can only access their own trasactions)
 */
app.get('/api/users/:userId/transactions/byDate', authenticateToken, async (req: AuthRequest, res: Response) => {
    try{
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only access their own transactions
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only access your own transactions' });
        }

        const user = await userRepo.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const {begin , until} = req.query;

        let beginStr: string | undefined;
        let beginDate = new Date();

        if (typeof begin === "string") {
          beginStr = begin;
        } else if (Array.isArray(begin) && begin.length > 0) {
          beginStr = begin[0]?.toString();
        } else if (begin != null) {
          beginStr = begin.toString();
        } else {
          beginStr = undefined;
        }

        let untilStr: string | undefined;
        let untilDate = new Date();

        if (typeof until === "string") {
          untilStr = until;
        } else if (Array.isArray(until) && until.length > 0) {
          untilStr = until[0]?.toString();
        } else if (until != null) {
          untilStr = until.toString();
        } else {
          untilStr = undefined;
        }

        if(beginStr){      
          beginDate = new Date(beginStr);
        }

        if (isNaN(beginDate.getTime())) {
          return res.status(400).json({ error: "Invalid begin date format" });
        }

        if(untilStr){      
          untilDate = new Date(untilStr);
        }

        if (isNaN(untilDate.getTime())) {
          return res.status(400).json({ error: "Invalid until date format" });
        }

        const transactions = await transactionRepo.findTransactionsByDate(beginDate,untilDate);
        res.json(transactions);
    }catch (error){
        res.status(500).json({ error: 'Failed to fetch transactions', details: error });
    }
});

/**
 * PATCH /api/users/:userId/transactions/:id/description
 * Update transaction description (protected - users can only update their own transactions)
 * Body: { description : "newDescription" }
 */
app.patch('/api/users/:userId/transactions/:id/description', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their transactions
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only update your own transactions' });
        }

        const transactionId = Number(req.params.id);
        if (isNaN(transactionId)) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }

        const transaction = await transactionRepo.findTransactionById(transactionId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        let { description } = req.body.value;
        if (!description || !description.trim()) {
          description = ' ';
        }

        transaction.description = description;
        const updateTrasaction = await transactionRepo.updateDescription(transactionId, description);
        res.json({
          userId : updateTrasaction.userId,
          id : updateTrasaction.id,
          description : updateTrasaction.description,
          value : updateTrasaction.value,
          date  : updateTrasaction.date,
          recurrence : updateTrasaction.recurrence
        });
    } catch (error){
        res.status(500).json({ error: 'Failed to update transaction', details: error });
    }
});


/**
 * PATCH /api/users/:userId/transactions/:id/value
 * Update transaction value (protected - users can only update their own transactions)
 * Body: { value : "newValue" }
 */
app.patch('/api/users/:userId/transactions/:id/value', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their transactions
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only update your own transactions' });
        }

        const transactionId = Number(req.params.id);
        if (isNaN(transactionId)) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }

        const transaction = await transactionRepo.findTransactionById(transactionId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const { value } = req.body.value;
        if (!value || !value.trim()) {
          return res.status(400).json({ error: 'Value is required' });
        }

        const valueNumber = Number(value);
        if(isNaN(valueNumber)){
          return res.status(400).json({ error: 'Invalid Value' });
        }

        transaction.value = valueNumber;
        const updateTrasaction = await transactionRepo.updateValue(transactionId, valueNumber);
        res.json({
          userId : updateTrasaction.userId,
          id : updateTrasaction.id,
          description : updateTrasaction.description,
          value : updateTrasaction.value,
          date  : updateTrasaction.date,
          recurrence : updateTrasaction.recurrence
        });
    } catch (error){
        res.status(500).json({ error: 'Failed to update transaction', details: error });
    }
});

/**
 * PATCH /api/users/:userId/transactions/:id/date
 * Update transaction date (protected - users can only update their own transactions)
 * Body: { date : "newDate" }
 */
app.patch('/api/users/:userId/transactions/:id/date', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their transactions
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only update your own transactions' });
        }

        const transactionId = Number(req.params.id);
        if (isNaN(transactionId)) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }

        const transaction = await transactionRepo.findTransactionById(transactionId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const { date } = req.body.date;
        if (!date || !date.trim()) {
          return res.status(400).json({ error: 'Date is required' });
        }

        const dateObj = new Date(date);
        if(isNaN(dateObj.getTime())){
          return res.status(400).json({ error: 'Invalid date format' });
        }

        transaction.date = dateObj;
        const updateTrasaction = await transactionRepo.updateDate(transactionId, dateObj);
        res.json({
          userId : updateTrasaction.userId,
          id : updateTrasaction.id,
          value : updateTrasaction.value,
          description : updateTrasaction.description,
          date  : updateTrasaction.date,
          recurrence : updateTrasaction.recurrence
        });
    } catch (error){
        res.status(500).json({ error: 'Failed to update transaction', details: error });
    }
});

/**
 * PATCH /api/users/:userId/category/:categoryId/transactions/:id
 * Update transaction category (protected - users can only update their own transactions)
 */
app.patch('/api/users/:userId/category/:categoryId/transactions/:id', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their transactions
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only update your own transactions' });
        }

        const categoryId = Number(req.params.categoryId);
        if (isNaN(categoryId)) {
          return res.status(400).json({ error: 'Invalid category ID' });
        }

        const category = await categoryRepo.findCategoryById(categoryId);
        if(!category){
          return res.status(404).json({ error: 'Category not found' });
        }

        const transactionId = Number(req.params.id);
        if (isNaN(transactionId)) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }

        const transaction = await transactionRepo.findTransactionById(transactionId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        transaction.category = category;
        const updateTrasaction = await transactionRepo.updateCategoty(transactionId, categoryId);
        res.json({
          userId : updateTrasaction.userId,
          id : updateTrasaction.id,
          description : updateTrasaction.description,
          value : updateTrasaction.value,
          date  : updateTrasaction.date,
          recurrence : updateTrasaction.recurrence
        });
    } catch (error){
        res.status(500).json({ error: 'Failed to update transaction', details: error });
    }
});

/**
 * PATCH /api/users/:userId/transactions/:id/recurrence
 * Update transaction date (protected - users can only update their own transactions)
 * Body: { recurrence : "newRecurrence" }
 */
app.patch('/api/users/:userId/transactions/:id/recurrence', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their transactions
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only update your own transactions' });
        }

        const transactionId = Number(req.params.id);
        if (isNaN(transactionId)) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }

        const transaction = await transactionRepo.findTransactionById(transactionId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const { recurrence } = req.body.recurrence;
        if(!recurrence || !recurrence.trim()){
          return res.status(400).json({ error: 'Recurrence is required' });
        }

        let recurrenceBool: boolean;

        if (recurrence === "true" || recurrence === true) {
          recurrenceBool = true;
        } else if (recurrence === "false" || recurrence === false) {
          recurrenceBool = false;
        } else {
          recurrenceBool = false;
        }

        transaction.recurrence = recurrenceBool;
        const updateTrasaction = await transactionRepo.updateRecurrence(transactionId, recurrenceBool);
        res.json({
          userId : updateTrasaction.userId,
          id : updateTrasaction.id,
          description : updateTrasaction.description,
          value : updateTrasaction.value,
          date  : updateTrasaction.date,
          recurrence : updateTrasaction.recurrence
        });
    } catch (error){
        res.status(500).json({ error: 'Failed to update transaction', details: error });
    }
});

/**
 * DELETE /api/users/:userId/transactions/:id
 * Delete a user transaction (protected - users can only delete their own transactions)
 */
app.delete('/api/users/:userId/transactions/:id', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only delete their own transactions
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only delete your own transactions' });
        }

        const user = await userRepo.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const transactionId = Number(req.params.id);
        if (isNaN(transactionId)) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }

        const transaction = await transactionRepo.findTransactionById(transactionId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        await transactionRepo.delete(transactionId);
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error){
        res.status(500).json({ error: 'Failed to delete transaction', details: error });
    }
});

// ==================== INVESTMENTS ROUTES ====================

/**
 * POST /api/users/:userId/categories/:categoryId/investments
 * Create a new investments (protected - users can only create investments for themselves)
 * Body: { description : string | undefined, value : number, date : date, recurrence : boolean, rate : number, entrace : number, recurrenceAdd : number, monthsDuration : number }
 */
app.post('/api/users/:userId/categories/:categoryId/investments', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId;
    if (!userId || !userId.trim()) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Users can only create investments for themselves
    if (req.userId !== userId) {
        return res.status(403).json({ error: 'You can only create transactions for yourself' });
    }

    const user = await userRepo.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const categoryId = Number(req.params.id);
    if (isNaN(categoryId)) {
        return res.status(400).json({ error: 'Invalid category ID' });
    }
    
    const { description, value, date, recurrence, rate, entrance, recurrenceAdd, monthsDuration } = req.body;

    if (!value || !value.trim()) {
      return res.status(400).json({ error: 'Value is required' });
    }
    const valueNumber = Number(value);
    if(isNaN(valueNumber)){
      return res.status(400).json({ error: 'Invalid value' });
    }

    if (!date || !date.trim()) {
      return res.status(400).json({ error: 'Date is required' });
    }
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    let recurrenceBool: boolean;

    if (recurrence === "true" || recurrence === true) {
      recurrenceBool = true;
    } else if (recurrence === "false" || recurrence === false) {
      recurrenceBool = false;
    } else {
      recurrenceBool = false;
    }

    if (!rate || !rate.trim()) {
      return res.status(400).json({ error: 'Rate is required' });
    }
    const rateNumber = Number(rate);
    if (isNaN(rateNumber)) {
      return res.status(400).json({ error: "Invalid rate" });
    }

    if (!entrance || !entrance.trim()) {
      return res.status(400).json({ error: 'Entrance is required' });
    }
    const entranceNumber = Number(entrance);
    if (isNaN(entranceNumber)) {
      return res.status(400).json({ error: "Invalid entrance" });
    }

    let recurrenceAddNumber = Number(recurrenceAdd);
    if (!recurrenceAdd || !recurrenceAdd.trim()) {
      recurrenceAddNumber = 0;
    }

    if (!monthsDuration || !monthsDuration.trim()) {
      return res.status(400).json({ error: 'Months Duration is required' });
    }
    const monthsDurationNumber = Number(monthsDuration);
    if (isNaN(monthsDurationNumber)) {
      return res.status(400).json({ error: "Invalid months duration" });
    }

    const investment = await Investment.create( 
      description,
      valueNumber,
      dateObj,
      recurrenceBool,
      userId,
      rateNumber,
      entranceNumber,
      recurrenceAddNumber,
      monthsDurationNumber
    );

    const savedInvestment = await investmentRepo.create(investment);
    res.status(201).json(savedInvestment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create investment', details: error });
  }
});

/**
 * GET /api/users/userId/investments/:id
 * Get a investment by ID (protected - users can only access their own investments)
 */
app.get('/api/users/userId/investments/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try{
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only access their own investments
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only access your own investments' });
        }

        const user = await userRepo.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const investmentId = Number(req.params.id);
        if (isNaN(investmentId)) {
            return res.status(400).json({ error: 'Invalid investment ID' });
        }

        const investment = await investmentRepo.findInvestmentById(investmentId);
        if (!investment) {
            return res.status(404).json({ error: 'Investment not found' });
        }

        res.json(investment);
    }catch (error){
        res.status(500).json({ error: 'Failed to fetch investment', details: error });
    }
});

/**
 * GET /api/users/:userId/investments
 * Get all investments for a specific user (protected - users can only access their own investments)
 */
app.get('/api/users/:userId/investments', authenticateToken, async (req: AuthRequest, res: Response) => {
    try{
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only access their own investments
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only access your own investments' });
        }

        const user = await userRepo.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const investments = await investmentRepo.findUserInvestments(userId);
        res.json(investments);
    }catch (error){
        res.status(500).json({ error: 'Failed to fetch investments', details: error });
    }
});

/**
 * GET /api/users/userId/investments/:id/gain
 * Get the total gain of a investment in the end of months duration (protected - users can only access their own investments)
 */
app.get('/api/users/userId/investments/:id/gain', authenticateToken, async (req: AuthRequest, res: Response) => {
    try{
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only access their own investments
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only access your own investments' });
        }

        const user = await userRepo.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const investmentId = Number(req.params.id);
        if (isNaN(investmentId)) {
            return res.status(400).json({ error: 'Invalid investment ID' });
        }

        const investment = await investmentRepo.findInvestmentById(investmentId);
        if (!investment) {
            return res.status(404).json({ error: 'Investment not found' });
        }

        res.json(investment.gain());
    }catch (error){
        res.status(500).json({ error: 'Failed to fetch investment gain', details: error });
    }
});

/**
 * GET /api/users/userId/investments/:id/nowGain
 * Get gain until now of a investment in the end of months duration (protected - users can only access their own investments)
 */
app.get('/api/users/userId/investments/:id/nowGain', authenticateToken, async (req: AuthRequest, res: Response) => {
    try{
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only access their own investments
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only access your own investments' });
        }

        const user = await userRepo.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const investmentId = Number(req.params.id);
        if (isNaN(investmentId)) {
            return res.status(400).json({ error: 'Invalid investment ID' });
        }

        const investment = await investmentRepo.findInvestmentById(investmentId);
        if (!investment) {
            return res.status(404).json({ error: 'Investment not found' });
        }

        res.json(investment.calculateUntilNowGain());
    }catch (error){
        res.status(500).json({ error: 'Failed to fetch investment gain', details: error });
    }
});

/**
 * GET /api/users/userId/investments/:id/gain/:date
 * Get the total gain of a investment at a specific date(protected - users can only access their own investments)
 */
app.get('/api/users/userId/investments/:id/gain/:date', authenticateToken, async (req: AuthRequest, res: Response) => {
    try{
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only access their own investments
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only access your own investments' });
        }

        const user = await userRepo.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const date  = req.params.date;
        if(!date || !date.trim()){
          return res.status(400).json({ error: 'Date is required' });
        }
        const dateObj = new Date(date);
        if(isNaN(dateObj.getTime())){
          return res.status(400).json({ error: 'Invalid date format' });
        }

        const investmentId = Number(req.params.id);
        if (isNaN(investmentId)) {
          return res.status(400).json({ error: 'Invalid investment ID' });
        }

        const investment = await investmentRepo.findInvestmentById(investmentId);
        if (!investment) {
            return res.status(404).json({ error: 'Investment not found' });
        }

        res.json(investment.calculateOnMonth(dateObj));
    }catch (error){
        res.status(500).json({ error: 'Failed to fetch investment gain', details: error });
    }
});

/**
 * PATCH /api/users/:userId/investments/:id/description
 * Update investments description (protected - users can only update their own investments)
 * Body: { description : "newDescription" }
 */
app.patch('/api/users/:userId/investments/:id/description', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their investments
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only update your own investments' });
        }

        const investmentId = Number(req.params.id);
        if (isNaN(investmentId)) {
            return res.status(400).json({ error: 'Invalid investment ID' });
        }

        const investment = await investmentRepo.findInvestmentById(investmentId);
        if (!investment) {
            return res.status(404).json({ error: 'Investment not found' });
        }

        let { description } = req.body.value;
        if (!description || !description.trim()) {
          description = ' ';
        }

        investment.description = description;
        const updateInvestment = await investmentRepo.updateDescription(investmentId, description);
        res.json({
          userId : updateInvestment.userId,
          id : updateInvestment.id,
          description : updateInvestment.description,
          value : updateInvestment.value,
          date  : updateInvestment.date,
          recurrence : updateInvestment.recurrence,
          rate : updateInvestment.rate,
          entrance : updateInvestment.entrace,
          recurrenceAdd : updateInvestment.recurrenceAdd,
          monthsDuration : updateInvestment.monthsDuration
        });
    } catch (error){
        res.status(500).json({ error: 'Failed to update investment', details: error });
    }
});

/**
 * PATCH /api/users/:userId/investments/:id/value
 * Update investments value (protected - users can only update their own investments)
 * Body: { value : "newValue" }
 */
app.patch('/api/users/:userId/investments/:id/value', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their investments
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only update your own investments' });
        }

        const investmentId = Number(req.params.id);
        if (isNaN(investmentId)) {
            return res.status(400).json({ error: 'Invalid investment ID' });
        }

        const investment = await investmentRepo.findInvestmentById(investmentId);
        if (!investment) {
            return res.status(404).json({ error: 'Investment not found' });
        }

        const { value } = req.body.value;
        if (!value || !value.trim()) {
          return res.status(400).json({ error: 'Value is required' });
        }

        const valueNumber = Number(value);
        if(isNaN(valueNumber)){
          return res.status(400).json({ error: 'Invalid Value' });
        }

        investment.value = valueNumber;
        const updateInvestment = await investmentRepo.updateValue(investmentId, valueNumber);
        res.json({
          userId : updateInvestment.userId,
          id : updateInvestment.id,
          description : updateInvestment.description,
          value : updateInvestment.value,
          date  : updateInvestment.date,
          recurrence : updateInvestment.recurrence,
          rate : updateInvestment.rate,
          entrance : updateInvestment.entrace,
          recurrenceAdd : updateInvestment.recurrenceAdd,
          monthsDuration : updateInvestment.monthsDuration
        });
    } catch (error){
        res.status(500).json({ error: 'Failed to update investment', details: error });
    }
});

/**
 * PATCH /api/users/:userId/investments/:id/date
 * Update investment date (protected - users can only update their own investments)
 * Body: { date : "newDate" }
 */
app.patch('/api/users/:userId/investments/:id/date', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their investment
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only update your own investment' });
        }

        const investmentId = Number(req.params.id);
        if (isNaN(investmentId)) {
            return res.status(400).json({ error: 'Invalid investment ID' });
        }

        const investment = await investmentRepo.findInvestmentById(investmentId);
        if (!investment) {
            return res.status(404).json({ error: 'Investment not found' });
        }

        const { date } = req.body.date;
        if (!date || !date.trim()) {
          return res.status(400).json({ error: 'Date is required' });
        }

        const dateObj = new Date(date);
        if(isNaN(dateObj.getTime())){
          return res.status(400).json({ error: 'Invalid date format' });
        }

        investment.date = dateObj;
        const updateInvestment = await investmentRepo.updateDate(investmentId, dateObj);
        res.json({
          userId : updateInvestment.userId,
          id : updateInvestment.id,
          description : updateInvestment.description,
          value : updateInvestment.value,
          date  : updateInvestment.date,
          recurrence : updateInvestment.recurrence,
          rate : updateInvestment.rate,
          entrance : updateInvestment.entrace,
          recurrenceAdd : updateInvestment.recurrenceAdd,
          monthsDuration : updateInvestment.monthsDuration
        });
    } catch (error){
        res.status(500).json({ error: 'Failed to update investment', details: error });
    }
});

/**
 * PATCH /api/users/:userId/investments/:id/recurrence
 * Update investments date (protected - users can only update their own investments)
 * Body: { recurrence : "newRecurrence" }
 */
app.patch('/api/users/:userId/investments/:id/recurrence', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their investments
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only update your own investments' });
        }

        const investmentId = Number(req.params.id);
        if (isNaN(investmentId)) {
            return res.status(400).json({ error: 'Invalid investments ID' });
        }

        const investments = await investmentRepo.findInvestmentById(investmentId);
        if (!investments) {
            return res.status(404).json({ error: 'Investment not found' });
        }

        const { recurrence } = req.body.recurrence;
        if(!recurrence || !recurrence.trim()){
          return res.status(400).json({ error: 'Recurrence is required' });
        }

        let recurrenceBool: boolean;

        if (recurrence === "true" || recurrence === true) {
          recurrenceBool = true;
        } else if (recurrence === "false" || recurrence === false) {
          recurrenceBool = false;
        } else {
          recurrenceBool = false;
        }

        investments.recurrence = recurrenceBool;
        const updateInvestment = await investmentRepo.updateRecurrence(investmentId, recurrenceBool);
        res.json({
          userId : updateInvestment.userId,
          id : updateInvestment.id,
          description : updateInvestment.description,
          value : updateInvestment.value,
          date  : updateInvestment.date,
          recurrence : updateInvestment.recurrence,
          rate : updateInvestment.rate,
          entrance : updateInvestment.entrace,
          recurrenceAdd : updateInvestment.recurrenceAdd,
          monthsDuration : updateInvestment.monthsDuration
        });
    } catch (error){
        res.status(500).json({ error: 'Failed to update investment', details: error });
    }
});

/**
 * PATCH /api/users/:userId/investments/:id/rate
 * Update investments rate (protected - users can only update their own investments)
 * Body: { rate : "newRate" }
 */
app.patch('/api/users/:userId/investments/:id/rate', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their investments
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only update your own investments' });
        }

        const investmentId = Number(req.params.id);
        if (isNaN(investmentId)) {
            return res.status(400).json({ error: 'Invalid investment ID' });
        }

        const investment = await investmentRepo.findInvestmentById(investmentId);
        if (!investment) {
            return res.status(404).json({ error: 'Investment not found' });
        }

        const { rate } = req.body.rate;
        if (!rate || !rate.trim()) {
          return res.status(400).json({ error: 'Rate is required' });
        }

        const rateNumber = Number(rate);
        if(isNaN(rateNumber)){
          return res.status(400).json({ error: 'Invalid rate' });
        }

        investment.rate = rateNumber;
        const updateInvestment = await investmentRepo.updateRate(investmentId, rateNumber);
        res.json({
          userId : updateInvestment.userId,
          id : updateInvestment.id,
          description : updateInvestment.description,
          value : updateInvestment.value,
          date  : updateInvestment.date,
          recurrence : updateInvestment.recurrence,
          rate : updateInvestment.rate,
          entrance : updateInvestment.entrace,
          recurrenceAdd : updateInvestment.recurrenceAdd,
          monthsDuration : updateInvestment.monthsDuration
        });
    } catch (error){
        res.status(500).json({ error: 'Failed to update investment', details: error });
    }
});

/**
 * PATCH /api/users/:userId/investments/:id/recurrenceAdd
 * Update investments recurrenceAdd (protected - users can only update their own investments)
 * Body: { recurrenceAdd : "newRecurrenceAdd" }
 */
app.patch('/api/users/:userId/investments/:id/recurrenceAdd', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their investments
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only update your own investments' });
        }

        const investmentId = Number(req.params.id);
        if (isNaN(investmentId)) {
            return res.status(400).json({ error: 'Invalid investment ID' });
        }

        const investment = await investmentRepo.findInvestmentById(investmentId);
        if (!investment) {
            return res.status(404).json({ error: 'Investment not found' });
        }

        const { recurrenceAdd } = req.body.recurrenceAdd;
        if (!recurrenceAdd || !recurrenceAdd.trim()) {
          return res.status(400).json({ error: 'Recurrence Addition is required' });
        }

        const recurrenceAddNumber = Number(recurrenceAdd);
        if(isNaN(recurrenceAddNumber)){
          return res.status(400).json({ error: 'Invalid rate' });
        }

        investment.recurrenceAdd = recurrenceAddNumber;
        const updateInvestment = await investmentRepo.updateRecurrenceAdd(investmentId, recurrenceAddNumber);
        res.json({
          userId : updateInvestment.userId,
          id : updateInvestment.id,
          description : updateInvestment.description,
          value : updateInvestment.value,
          date  : updateInvestment.date,
          recurrence : updateInvestment.recurrence,
          rate : updateInvestment.rate,
          entrance : updateInvestment.entrace,
          recurrenceAdd : updateInvestment.recurrenceAdd,
          monthsDuration : updateInvestment.monthsDuration
        });
    } catch (error){
        res.status(500).json({ error: 'Failed to update investment', details: error });
    }
});

/**
 * PATCH /api/users/:userId/investments/:id/monthsDuration
 * Update investments monthsDuration (protected - users can only update their own investments)
 * Body: { monthsDuration : "newMonthsDuration" }
 */
app.patch('/api/users/:userId/investments/:id/monthsDuration', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only update their investments
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only update your own investments' });
        }

        const investmentId = Number(req.params.id);
        if (isNaN(investmentId)) {
            return res.status(400).json({ error: 'Invalid investment ID' });
        }

        const investment = await investmentRepo.findInvestmentById(investmentId);
        if (!investment) {
            return res.status(404).json({ error: 'Investment not found' });
        }

        const { monthsDuration } = req.body.monthsDuration;
        if (!monthsDuration || !monthsDuration.trim()) {
          return res.status(400).json({ error: 'A new months duration is required' });
        }

        const monthsDurationNumber = Number(monthsDuration);
        if(isNaN(monthsDurationNumber)){
          return res.status(400).json({ error: 'Invalid months duration' });
        }

        investment.monthsDuration = monthsDurationNumber;
        const updateInvestment = await investmentRepo.updateRate(investmentId, monthsDurationNumber);
        res.json({
          userId : updateInvestment.userId,
          id : updateInvestment.id,
          description : updateInvestment.description,
          value : updateInvestment.value,
          date  : updateInvestment.date,
          recurrence : updateInvestment.recurrence,
          rate : updateInvestment.rate,
          entrance : updateInvestment.entrace,
          recurrenceAdd : updateInvestment.recurrenceAdd,
          monthsDuration : updateInvestment.monthsDuration
        });
    } catch (error){
        res.status(500).json({ error: 'Failed to update investment', details: error });
    }
});

/**
 * DELETE /api/users/:userId/investments/:id
 * Delete a user investment (protected - users can only delete their own investments)
 */
app.delete('/api/users/:userId/investments/:id', authenticateToken, async (req: AuthRequest, res: Response) =>{
    try {
        const userId = req.params.userId;
        if (!userId || !userId.trim()) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Users can only delete their own investments
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'You can only delete your own investments' });
        }

        const user = await userRepo.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const investmentId = Number(req.params.id);
        if (isNaN(investmentId)) {
            return res.status(400).json({ error: 'Invalid investment ID' });
        }

        const investment = await investmentRepo.findInvestmentById(investmentId);
        if (!investment) {
            return res.status(404).json({ error: 'Investment not found' });
        }
        
        await investmentRepo.delete(investmentId);
        res.json({ message: 'Investment deleted successfully' });
    } catch (error){
        res.status(500).json({ error: 'Failed to delete investment', details: error });
    }
});

// ==================== ROOT ROUTE ====================

/**
 * GET /
 * API welcome message
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Financial Dashboard API',
    version: '2.0.0',
    authentication: {
      note: 'Most endpoints require authentication. Include JWT token in Authorization header: Bearer <token>',
      endpoints: {
        'POST /api/auth/signup': 'Create a new user account (Body: { name, email, password })',
        'POST /api/auth/signin': 'Sign in with email and password (Body: { email, password })'
      }
    },
    endpoints: {
      auth: {
        'POST /api/auth/signup': 'Create a new user account',
        'POST /api/auth/signin': 'Sign in with email and password'
      },
      users: {
        'GET /api/users/me': 'Get current authenticated user (protected)',
        'GET /api/users/:id': 'Get a user by ID (protected)',
        'PATCH /api/users/:id/name': 'Update user name ( Body: {name}) (protected)',
        'PATCH /api/users/:id/email': 'Update user email ( Body: {email}) (protected)',
        'PATCH /api/users/:id/password': 'Update user password ( Body: {password}) (protected)',
        'DELETE /api/users/:id': 'Delete a user (protected)'
      },
      categories: {
        'POST /api/users/:userId/categories': 'Create a new transaction category (protected)',
        'GET /api/users/userId/category/:id': 'Get a category by ID (protected)',
        'GET /api/users/:userId/categories': 'Get all categories for a specific user (protected)',
        'PATCH /api/users/:userId/category/:id/label': 'Update category label ( Body: {label}) (protected)',
        'PATCH /api/users/:userId/category/:id/type': 'Update category type ( Body: {type}) (protected)',
        'DELETE /api/users/:userId/category/:id': 'Delete a user category (protected)'
      },
      transactions: {
        'POST /api/users/:userId/categories/:categoryId/transactions': 'Create a new transaction (protected)',
        'GET /api/users/userId/transaction/:id': 'Get a transaction by ID (protected)',
        'GET /api/users/:userId/transactions': 'Get all transactions for a specific user (protected)',
        'GET /api/users/:userId/transactions/byDate': 'Get all transactions of date a period (protected)',
        'PATCH /api/users/:userId/transactions/:id/description': 'Update transaction description ( Body: {description}) (protected)',
        'PATCH /api/users/:userId/transactions/:id/value': 'Update transaction value ( Body: {value}) (protected)',
        'PATCH /api/users/:userId/category/:id/date': 'Update transaction date ( Body: {date}) (protected)',
        'PATCH /api/users/:userId/category/:categoryId/transactions/:id/': 'Update transaction category (protected)',
        'PATCH /api/users/:userId/transactions/:id/recurrence': 'Update transaction recurrence ( Body: {recurrence}) (protected)',
        'DELETE /api/users/:userId/transactions/:id': 'Delete a user transaction (protected)'
      },
      investments: {
        'POST /api/users/:userId/categories/:categoryId/investments': 'Create a new investment (protected)',
        'GET /api/users/userId/investments/:id': 'Get a investment by ID (protected)',
        'GET /api/users/:userId/investments': 'Get all investments for a specific user (protected)',
        'GET /api/users/userId/investments/:id/gain': 'Get the total gain of a investment in the end of months duration',
        'GET /api/users/userId/investments/:id/nowGain': 'Get gain until now of a investment in the end of months duration',
        'GET /api/users/userId/investments/:id/gain/:date': 'Get the total gain of a investment at a specific date',
        'PATCH /api/users/:userId/investments/:id/description': 'Update investment description ( Body: {description}) (protected)',
        'PATCH /api/users/:userId/investments/:id/value': 'Update investment value ( Body: {value}) (protected)',
        'PATCH /api/users/:userId/investments/:id/date': 'Update investment date ( Body: {date}) (protected)',
        'PATCH /api/users/:userId/investments/:id/recurrence': 'Update investment recurrence (protected)',
        'PATCH /api/users/:userId/investments/:id/rate': 'Update investment rate (protected)',
        'PATCH /api/users/:userId/investments/:id/recurrenceAdd': 'Update investment recurrenceAdd (protected)',
        'PATCH /api/users/:userId/investments/:id/monthsDuration': 'Update investment monthsDuration (protected)',
        'DELETE /api/users/:userId/investments/:id': 'Delete a user investment (protected)'
      }
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Task List API Server is running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/`);
});

export default app;