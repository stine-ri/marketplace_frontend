import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, CreateUserData, UpdateUserData, normalizeUser, BackendUser } from '../../types/types';
import { getAuthHeaders, isAdmin } from '../../utilis/auth';
import { 
  FiSearch, 
  FiTrash2, 
  FiEdit3, 
  FiPlus, 
  FiUsers, 
  FiAlertCircle,
  FiX,
  FiSave,
  FiFilter
} from 'react-icons/fi';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'client'
  });

  const [editForm, setEditForm] = useState<UpdateUserData>({});

  // Helper function to get user display name
  const getUserName = (user: User) => {
    return user.full_name || user.name || 'Unknown User';
  };

  // Helper function to format date safely
  const formatDate = (user: User) => {
    const dateString = user.created_at || user.createdAt;
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  // Check if user is admin
  useEffect(() => {
    console.log('UserManagement: Checking admin status...');
    const adminStatus = isAdmin();
    console.log('UserManagement: Admin status:', adminStatus);
    
    if (!adminStatus) {
      setError('Access denied. Admin privileges required.');
      return;
    }
    fetchUsers();
  }, []);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => {
        const name = getUserName(user).toLowerCase();
        const email = (user.email || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return name.includes(searchLower) || email.includes(searchLower);
      });
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching users...');
      const response = await axios.get<BackendUser[]>(`${baseURL}/api/users`, {
        headers: getAuthHeaders()
      });
      console.log('Raw backend users:', response.data);
      
      // Normalize backend response to frontend format
      const normalizedUsers = response.data.map(normalizeUser);
      console.log('Normalized users:', normalizedUsers);
      
      setUsers(normalizedUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await axios.post<User>(`${baseURL}/api/users`, createForm, {
        headers: getAuthHeaders()
      });
      setUsers([...users, response.data]);
      setCreateForm({ name: '', email: '', password: '', role: 'client' });
      setShowCreateModal(false);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
      console.error('Error creating user:', err);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const response = await axios.put<User>(
        `${baseURL}/api/users/${editingUser.id}`, 
        editForm,
        { headers: getAuthHeaders() }
      );
      setUsers(users.map(user => 
        user.id === editingUser.id ? response.data : user
      ));
      setShowEditModal(false);
      setEditingUser(null);
      setEditForm({});
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`${baseURL}/api/users/${userId}`, {
        headers: getAuthHeaders()
      });
      setUsers(users.filter(user => user.id !== userId));
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) return;

    try {
      await axios.post(`${baseURL}/api/users/bulk-delete`, 
        { ids: selectedUsers },
        { headers: getAuthHeaders() }
      );
      setUsers(users.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete users');
      console.error('Error deleting users:', err);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: getUserName(user),
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    setShowEditModal(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'service_provider': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin()) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <FiAlertCircle className="inline mr-2" />
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiUsers className="mr-2" />
          User Management
        </h1>
        
        {error && (
          <div className="w-full md:w-auto p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <FiAlertCircle className="mr-2" />
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <FiX size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="service_provider">Service Provider</option>
            <option value="client">Client</option>
          </select>
        </div>

        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              <FiTrash2 size={16} /> Delete Selected
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <FiPlus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <FiUsers className="mx-auto text-gray-400 text-4xl mb-2" />
              <p className="text-gray-500">No users found</p>
              {users.length === 0 && !isLoading && (
                <button
                  onClick={fetchUsers}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Retry loading users
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                      <input
                        type="checkbox"
                        className="rounded focus:ring-blue-500"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded focus:ring-blue-500"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getUserName(user)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {user.role?.replace('_', ' ') || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition"
                            title="Edit user"
                          >
                            <FiEdit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition"
                            title="Delete user"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New User</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  placeholder="Enter password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={createForm.role}
                  onChange={(e) => setCreateForm({...createForm, role: e.target.value as any})}
                >
                  <option value="client">Client</option>
                  <option value="service_provider">Service Provider</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateUser}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
                disabled={!createForm.name || !createForm.email || !createForm.password}
              >
                <FiSave className="inline mr-2" size={16} />
                Create User
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit User</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editForm.role || editingUser.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value as any})}
                >
                  <option value="client">Client</option>
                  <option value="service_provider">Service Provider</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  className="rounded focus:ring-blue-500 mr-2"
                  checked={editForm.isActive !== undefined ? editForm.isActive : editingUser.isActive !== false}
                  onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active User
                </label>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleUpdateUser}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
              >
                <FiSave className="inline mr-2" size={16} />
                Update User
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setError(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}