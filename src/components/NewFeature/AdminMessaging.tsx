// components/Admin/WhatsAppMessaging.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiMessageCircle, 
  FiUsers, 
  FiSend, 
  FiCopy, 
  FiCheck, 
  FiMail,
  FiPhone,
  FiFilter,
  FiSearch,
  FiUser,
  FiShield,
  FiShoppingBag,
  FiTool
} from 'react-icons/fi';
import { getAuthHeaders } from '../../utilis/auth';
import { showToast } from '../../utilis/toast';

interface User {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  role: string;
  college?: string;
  isActive: boolean;
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
}

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

export default function WhatsAppMessaging() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'all' | 'client' | 'service_provider' | 'product_seller' | 'admin'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [sendingMethod, setSendingMethod] = useState<'whatsapp' | 'email' | 'auto'>('auto');

  // Enhanced message templates with professional structure
  const defaultTemplates: MessageTemplate[] = [
    {
      id: 'welcome',
      name: 'Welcome Message',
      content: `Hello {name},

Welcome to Quisells.com! We're thrilled to have you join our community.

Your account has been successfully created and you can now access all our features.

Best regards,
Quisells.com Team`,
      category: 'general'
    },
    {
      id: 'promotion',
      name: 'Special Promotion',
      content: `Hello {name},

We have an exclusive promotion just for you! 

Visit Quisells.com today to discover amazing deals and offers.

Don't miss out on these limited-time opportunities.

Best regards,
Quisells.com Team`,
      category: 'marketing'
    },
    {
      id: 'urgent',
      name: 'Urgent Action Required',
      content: `Hello {name},

URGENT ACTION REQUIRED

We need your immediate attention regarding an important matter. Please review and take necessary action within 24 hours.

Security Code: QS-{code}

Please contact us immediately if you have any questions.

Best regards,
Quisells.com Team`,
      category: 'urgent'
    },
    {
      id: 'update',
      name: 'Platform Update',
      content: `Hello {name},

We're excited to inform you about recent updates on Quisells.com:

• Enhanced user interface
• New features added
• Improved performance

Log in to explore these new improvements!

Best regards,
Quisells.com Team`,
      category: 'announcement'
    },
    {
      id: 'support',
      name: 'Support Follow-up',
      content: `Hello {name},

Following up on your recent inquiry. Our team is here to assist you further.

If you need additional help, please don't hesitate to contact our support team.

Best regards,
Quisells.com Support Team
Quisells.com`,
      category: 'support'
    }
  ];

  useEffect(() => {
    fetchUsers();
    setTemplates(defaultTemplates);
  }, [userType]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${baseURL}/api/users`, {
        headers: getAuthHeaders()
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = userType === 'all' || user.role === userType;
    
    return matchesSearch && matchesType;
  });

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Generate random code for urgent templates
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const contentWithCode = template.content.replace(/{code}/g, randomCode.toString());
      setMessage(contentWithCode);
      setSelectedTemplate(templateId);
    }
  };

  const generateWhatsAppLink = (phone: string, customMessage?: string) => {
    const finalMessage = customMessage || message;
    const encodedMessage = encodeURIComponent(finalMessage);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
  };

  const generateEmailLink = (email: string, customSubject?: string, customMessage?: string) => {
    const finalSubject = customSubject || subject || 'Message from Quisells.com';
    const finalMessage = customMessage || message;
    const encodedSubject = encodeURIComponent(finalSubject);
    const encodedBody = encodeURIComponent(finalMessage);
    return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast.success('Message copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const sendIndividualMessage = (user: User) => {
    const personalizedMessage = message.replace(/{name}/g, user.full_name);
    const personalizedSubject = subject.replace(/{name}/g, user.full_name);

    let link = '';
    let method = sendingMethod;

    // Auto-detect method if set to auto
    if (method === 'auto') {
      method = user.phone_number ? 'whatsapp' : 'email';
    }

    if (method === 'whatsapp' && user.phone_number) {
      link = generateWhatsAppLink(user.phone_number, personalizedMessage);
      window.open(link, '_blank');
      showToast.success(`Opening WhatsApp for ${user.full_name}`);
    } else if (method === 'email' && user.email) {
      link = generateEmailLink(user.email, personalizedSubject, personalizedMessage);
      window.open(link, '_blank');
      showToast.success(`Opening email for ${user.full_name}`);
    } else {
      showToast.error(`No ${method === 'whatsapp' ? 'phone number' : 'email'} found for ${user.full_name}`);
    }
  };

  const sendBulkMessages = () => {
    if (selectedUsers.length === 0) {
      showToast.error('Please select at least one user');
      return;
    }

    if (!message.trim()) {
      showToast.error('Please enter a message');
      return;
    }

    const selectedUserObjects = users.filter(user => selectedUsers.includes(user.id));
    
    // Group users by available contact methods
    const usersWithPhone = selectedUserObjects.filter(user => user.phone_number);
    const usersWithEmail = selectedUserObjects.filter(user => user.email);
    const usersWithNoContact = selectedUserObjects.filter(user => !user.phone_number && !user.email);

    if (usersWithNoContact.length === selectedUserObjects.length) {
      showToast.error('No selected users have contact information');
      return;
    }

    // Show summary
    let summary = `Ready to send to ${selectedUserObjects.length} users:\n`;
    if (usersWithPhone.length > 0) summary += `• ${usersWithPhone.length} via WhatsApp\n`;
    if (usersWithEmail.length > 0) summary += `• ${usersWithEmail.length} via Email\n`;
    if (usersWithNoContact.length > 0) summary += `• ${usersWithNoContact.length} with no contact info`;

    showToast.info(summary);

    // Send to first user as example based on method
    const firstUser = selectedUserObjects[0];
    if (sendingMethod === 'whatsapp' && firstUser.phone_number) {
      sendIndividualMessage(firstUser);
    } else if (sendingMethod === 'email' && firstUser.email) {
      sendIndividualMessage(firstUser);
    } else if (sendingMethod === 'auto') {
      // Try WhatsApp first, then email
      if (firstUser.phone_number) {
        sendIndividualMessage(firstUser);
      } else if (firstUser.email) {
        sendIndividualMessage(firstUser);
      }
    }

    // If only one user with email, open email composer
    if (usersWithEmail.length === 1 && usersWithPhone.length === 0) {
      const user = usersWithEmail[0];
      const personalizedMessage = message.replace(/{name}/g, user.full_name);
      const personalizedSubject = subject.replace(/{name}/g, user.full_name);
      const emailLink = generateEmailLink(user.email, personalizedSubject, personalizedMessage);
      window.open(emailLink, '_blank');
    }
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const getRecipientCount = () => {
    return users.filter(user => selectedUsers.includes(user.id)).length;
  };

  const getUsersWithPhoneCount = () => {
    return users.filter(user => selectedUsers.includes(user.id) && user.phone_number).length;
  };

  const getUsersWithEmailCount = () => {
    return users.filter(user => selectedUsers.includes(user.id) && user.email).length;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <FiShield className="text-red-500" size={14} />;
      case 'service_provider': return <FiTool className="text-blue-500" size={14} />;
      case 'product_seller': return <FiShoppingBag className="text-purple-500" size={14} />;
      case 'client': return <FiUser className="text-green-500" size={14} />;
      default: return <FiUser className="text-gray-500" size={14} />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'service_provider': return 'bg-blue-100 text-blue-800';
      case 'product_seller': return 'bg-purple-100 text-purple-800';
      case 'client': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiMessageCircle className="text-blue-600 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Bulk Messaging</h1>
        </div>
        <p className="text-gray-600">
          Send professional messages to users via WhatsApp or Email. Messages include personalized greetings and our website name.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Selection */}
        <div className="lg:col-span-1 space-y-4">
          {/* Sending Method */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FiSend size={16} />
              Sending Method
            </h3>
            <select
              value={sendingMethod}
              onChange={(e) => setSendingMethod(e.target.value as any)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="auto">Auto-detect (WhatsApp preferred)</option>
              <option value="whatsapp">WhatsApp Only</option>
              <option value="email">Email Only</option>
            </select>
            <div className="mt-2 text-xs text-gray-500">
              {sendingMethod === 'auto' && 'Will use WhatsApp if available, otherwise Email'}
              {sendingMethod === 'whatsapp' && 'Only send to users with phone numbers'}
              {sendingMethod === 'email' && 'Only send to users with email addresses'}
            </div>
          </div>

          {/* User Type Filter */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FiFilter size={16} />
              Filter by Role
            </h3>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as any)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="client">Clients Only</option>
              <option value="service_provider">Service Providers</option>
              <option value="product_seller">Product Sellers</option>
              <option value="admin">Admins Only</option>
            </select>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FiSearch size={16} />
              Search Users
            </h3>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* User List */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">Select Users</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{selectedUsers.length} selected</span>
                <button
                  onClick={selectAllUsers}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No users found
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className={`p-3 border rounded-lg cursor-pointer transition ${
                      selectedUsers.includes(user.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedUsers(prev =>
                        prev.includes(user.id)
                          ? prev.filter(id => id !== user.id)
                          : [...prev, user.id]
                      );
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getRoleIcon(user.role)}
                          <p className="font-medium text-gray-800 text-sm">{user.full_name}</p>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{user.email}</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                          {user.isActive && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {user.phone_number && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                            <FiPhone size={10} />
                            WhatsApp
                          </span>
                        )}
                        {user.email && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                            <FiMail size={10} />
                            Email
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Message Composition */}
        <div className="lg:col-span-2 space-y-4">
          {/* Message Templates */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`p-3 text-left border rounded-lg transition ${
                    selectedTemplate === template.id
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-sm text-gray-800">{template.name}</p>
                  <p className="text-xs text-gray-600 truncate">{template.content.split('\n')[0]}</p>
                  <span className="text-xs text-gray-400 mt-1">{template.category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message Composition */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Compose Message</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Subject (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter subject... (For email)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Content *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hello {name}, kindly...\n\nBest regards,\nQuisells.com Team`}
                  rows={8}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                />
                <div className="mt-2 text-sm text-gray-500 space-y-1">
                  <p>💡 Use <code className="bg-gray-100 px-1 rounded">{'{name}'}</code> to automatically insert user's name</p>
                  <p>💡 Use <code className="bg-gray-100 px-1 rounded">{'{code}'}</code> for automatic security codes</p>
                  <p>💡 Professional signature will be added automatically</p>
                </div>
              </div>

              {/* Message Preview */}
              {message && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-800 mb-2">Preview:</h4>
                  <div className="bg-white p-3 rounded border text-sm font-mono whitespace-pre-wrap">
                    {subject && <p className="font-semibold mb-2 text-base">{subject.replace(/{name}/g, 'John Doe')}</p>}
                    <p>{message.replace(/{name}/g, 'John Doe').replace(/{code}/g, '1234')}</p>
                    {!message.includes('Quisells.com') && (
                      <p className="text-gray-500 mt-2 text-xs">— Quisells.com Team</p>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(message)}
                    className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                    {copied ? 'Copied!' : 'Copy Message'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Send Messages</h3>
                <p className="text-sm text-gray-600">
                  {getRecipientCount()} users selected • 
                  {getUsersWithPhoneCount()} with WhatsApp • 
                  {getUsersWithEmailCount()} with Email
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(message)}
                  disabled={!message.trim()}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <FiCopy size={16} />
                  Copy Text
                </button>
                <button
                  onClick={sendBulkMessages}
                  disabled={selectedUsers.length === 0 || !message.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <FiSend size={16} />
                  Send Bulk Messages
                </button>
              </div>
            </div>

            {/* Quick Individual Sends */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Quick Send to Selected Users:</p>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredUsers
                  .filter(user => selectedUsers.includes(user.id))
                  .slice(0, 5) // Limit to first 5 for space
                  .map(user => (
                    <div key={user.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="text-sm text-gray-800">{user.full_name}</span>
                        <span className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</span>
                      </div>
                      <button
                        onClick={() => sendIndividualMessage(user)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        <FiSend size={12} />
                        Send
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}