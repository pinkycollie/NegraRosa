import { Router, Request, Response } from 'express';
import { auth0Service } from '../../services/Auth0Service';
import { storage } from '../../storage';

const router = Router();

/**
 * @route GET /api/v1/users
 * @desc Get all users (admin only)
 * @access Private/Admin
 */
router.get('/', auth0Service.checkJwt, auth0Service.checkPermissions(['read:users']), async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    
    // Remove sensitive information before sending response
    const sanitizedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return res.json(sanitizedUsers);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

/**
 * @route GET /api/v1/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get('/:id', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if the user has permission to view this user
    const requestingUser = await storage.getUserByExternalId(req.user.sub);
    if (!requestingUser) {
      return res.status(404).json({ message: 'Requesting user not found' });
    }
    
    if (userId !== requestingUser.id && !req.user.permissions?.includes('read:users')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return res.json(userWithoutPassword);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

/**
 * @route POST /api/v1/users
 * @desc Create a new user (admin only)
 * @access Private/Admin
 */
router.post('/', auth0Service.checkJwt, auth0Service.checkPermissions(['create:users']), async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName, phone } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['username', 'email', 'password'] 
      });
    }
    
    // Check if username or email already exists
    const existingByUsername = await storage.getUserByUsername(username);
    if (existingByUsername) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    
    const existingByEmail = await storage.getUserByEmail(email);
    if (existingByEmail) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    
    // Create user in Auth0
    const createAuthResult = await auth0Service.createUser(username, email, password, fullName);
    
    if (createAuthResult.error) {
      return res.status(400).json({ message: createAuthResult.error });
    }
    
    // Create user in local storage
    const user = await storage.createUser({
      username,
      password, // This should be hashed in a real implementation
      email,
      fullName: fullName || null,
      phone: phone || null,
      createdAt: new Date(),
    });
    
    // Remove sensitive information before sending response
    const { password: _, ...userResponse } = user;
    
    return res.status(201).json({
      ...userResponse,
      auth0Id: createAuthResult.user_id
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

/**
 * @route PUT /api/v1/users/:id
 * @desc Update a user
 * @access Private
 */
router.put('/:id', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if the user has permission to update this user
    const requestingUser = await storage.getUserByExternalId(req.user.sub);
    if (!requestingUser) {
      return res.status(404).json({ message: 'Requesting user not found' });
    }
    
    if (userId !== requestingUser.id && !req.user.permissions?.includes('update:users')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { fullName, phone } = req.body;
    const updates: any = {};
    
    if (fullName !== undefined) updates.fullName = fullName;
    if (phone !== undefined) updates.phone = phone;
    
    // Update user in Auth0 if it's connected
    if (user.externalId) {
      const updateAuthResult = await auth0Service.updateUser(user.externalId, updates);
      
      if (updateAuthResult.error) {
        return res.status(400).json({ message: updateAuthResult.error });
      }
    }
    
    // Update user in local storage
    const updatedUser = await storage.updateUser(userId, updates);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    return res.json(userWithoutPassword);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

/**
 * @route DELETE /api/v1/users/:id
 * @desc Delete a user (admin only)
 * @access Private/Admin
 */
router.delete('/:id', auth0Service.checkJwt, auth0Service.checkPermissions(['delete:users']), async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user from Auth0 if connected
    if (user.externalId) {
      const deleteAuthResult = await auth0Service.deleteUser(user.externalId);
      
      if (deleteAuthResult.error) {
        return res.status(400).json({ message: deleteAuthResult.error });
      }
    }
    
    // Delete user from local storage
    const success = await storage.deleteUser(userId);
    if (!success) {
      return res.status(500).json({ message: 'Failed to delete user' });
    }
    
    return res.status(204).end();
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

/**
 * @route GET /api/v1/users/:id/permissions
 * @desc Get user permissions
 * @access Private
 */
router.get('/:id/permissions', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if the user has permission to view this user's permissions
    const requestingUser = await storage.getUserByExternalId(req.user.sub);
    if (!requestingUser) {
      return res.status(404).json({ message: 'Requesting user not found' });
    }
    
    if (userId !== requestingUser.id && !req.user.permissions?.includes('read:permissions')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user permissions from Auth0
    if (!user.externalId) {
      return res.json({ permissions: [] });
    }
    
    const permissionsResult = await auth0Service.getUserPermissions(user.externalId);
    
    if (permissionsResult.error) {
      return res.status(400).json({ message: permissionsResult.error });
    }
    
    return res.json({ permissions: permissionsResult.permissions || [] });
  } catch (error: any) {
    console.error('Error fetching user permissions:', error);
    return res.status(500).json({ message: 'Error fetching user permissions', error: error.message });
  }
});

/**
 * @route GET /api/v1/users/:id/roles
 * @desc Get user roles
 * @access Private
 */
router.get('/:id/roles', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if the user has permission to view this user's roles
    const requestingUser = await storage.getUserByExternalId(req.user.sub);
    if (!requestingUser) {
      return res.status(404).json({ message: 'Requesting user not found' });
    }
    
    if (userId !== requestingUser.id && !req.user.permissions?.includes('read:roles')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user roles from Auth0
    if (!user.externalId) {
      return res.json({ roles: [] });
    }
    
    const rolesResult = await auth0Service.getUserRoles(user.externalId);
    
    if (rolesResult.error) {
      return res.status(400).json({ message: rolesResult.error });
    }
    
    return res.json({ roles: rolesResult.roles || [] });
  } catch (error: any) {
    console.error('Error fetching user roles:', error);
    return res.status(500).json({ message: 'Error fetching user roles', error: error.message });
  }
});

export default router;