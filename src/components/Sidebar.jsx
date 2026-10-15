import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardListIcon,
  PlusCircleIcon,
  UserCircleIcon,
  XIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MenuIcon,
  PencilIcon,
  MailIcon,
  PhoneIcon,
} from '@heroicons/react/outline';
import { Modal } from 'antd';
import '../styles/Sidebar.css';

const Sidebar = ({ children, onLogout = () => {}, user = {}, updateUser = () => {} }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [orderExpanded, setOrderExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [localUser, setLocalUser] = useState(user);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
  });
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const popupRef = useRef(null);

  useEffect(() => {
    setLocalUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
  }, [user]);

  useEffect(() => {
  setOrderExpanded(false);
}, [location.pathname]);


useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth < 990) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  };

  handleResize(); 

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);


  const handleLogout = () => {
    try {
      onLogout(); 
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleAbout = () => {
    setShowPopup(false);
    Modal.info({
      title: 'About OrderDesk',
      content: 'A demo order management dashboard built with React, React Router and Ant Design. Data is stored in your browser.',
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file.');
        return;
      }
      // Store as a data URL so the photo survives a page reload.
      const reader = new FileReader();
      reader.onload = () => {
        const updatedUser = { ...localUser, profileImage: reader.result };
        setLocalUser(updatedUser);
        updateUser(updatedUser);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    const updatedUser = { ...localUser, profileImage: '' };
    setLocalUser(updatedUser);
    updateUser(updatedUser);
  };

  const handleEditToggle = () => {
    if (editMode) {
      if (!formData.name.trim()) {
        setError('Name cannot be empty.');
        return;
      }
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Please enter a valid email.');
        return;
      }
      const updatedUser = { ...localUser, ...formData };
      setLocalUser(updatedUser);
      updateUser(updatedUser);
      setEditMode(false);
      setError('');
    } else {
      setEditMode(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="layout-container">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="collapse-button" onClick={() => setCollapsed(prev => !prev)} title="Toggle Sidebar">
  <MenuIcon className="hamburger-icon" />
</div>


        <ul className="nav-list">
          <li className={`nav-item ${location.pathname === '/home' ? 'active' : ''}`}>
            <Link to="/home" className="nav-link" title="Home" data-tooltip="Home">
              <HomeIcon className="nav-icon" />
              {!collapsed && <span className="nav-text">Home</span>}
            </Link>
          </li>

        <li className="nav-item">
  <div
    className="nav-link order-toggle"
    onClick={() => setOrderExpanded(prev => !prev)}
    title="Orders"
  >
    <ClipboardListIcon className="nav-icon" />
    {!collapsed && <span className="nav-text">Orders</span>}
    {!collapsed && (
      orderExpanded ? <ChevronDownIcon className="chevron-icon" /> : <ChevronRightIcon className="chevron-icon" />
    )}
  </div>

  {(collapsed || orderExpanded) && (
  <ul className={`sub-nav-list ${!orderExpanded ? 'collapsed-submenu' : ''}`}>
    <li className={`nav-item ${location.pathname === '/create' ? 'active' : ''}`}>
      <Link to="/create" className="nav-link sub-item" title="Create">
        <PlusCircleIcon className="nav-icon" />
        {!collapsed && <span className="nav-text">Create</span>}
      </Link>
    </li>
    <li className={`nav-item ${location.pathname === '/orders' ? 'active' : ''}`}>
      <Link to="/orders" className="nav-link sub-item" title="List">
        <ClipboardListIcon className="nav-icon" />
        {!collapsed && <span className="nav-text">List</span>}
      </Link>
    </li>
  </ul>
   )}
</li>

        </ul>
      </aside>

      <div className={`main-area ${collapsed ? 'collapsed-main' : ''}`}>
        <header className="topbar">
          <div className="profile-area" onClick={() => setShowPopup(!showPopup)} role="button" tabIndex={0}>
            {localUser.profileImage ? (
              <img src={localUser.profileImage} alt="User" className="topbar-profile-pic" />
            ) : (
              <UserCircleIcon className="profile-icon" />
            )}
            <span className="username">{localUser.name || 'User'}</span>
          </div>

          {showPopup && (
            <div
              className="popup-menu"
              ref={popupRef}
              tabIndex={-1}
              onBlur={() => setShowPopup(false)}
            >
              <div className="popup-item" onClick={() => { setShowProfileModal(true); setShowPopup(false); }}>Profile</div>
              <div className="popup-item" onClick={handleAbout}>About</div>
              <div className="popup-item" onClick={handleLogout}>Logout</div>
            </div>
          )}
        </header>

        <main className="page-content">{children}</main>

        {showProfileModal && (
          <div className="profile-modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <span>Profile</span>
              <XIcon className="close-icon" onClick={() => setShowProfileModal(false)} />
            </div>
            <div className="modal-body">
              <div className="user-image-wrapper">
                {localUser.profileImage ? (
                  <img src={localUser.profileImage} alt="User" className="user-image" />
                ) : (
                  <UserCircleIcon className="modal-profile-icon" />
                )}
              </div>

              <div className="upload-section">
                <label htmlFor="upload-photo" className="upload-label">
                  <input id="upload-photo" type="file" accept="image/*" hidden onChange={handleImageUpload} />
                  {localUser.profileImage ? 'Update Photo' : 'Upload Photo'}
                </label>
                {localUser.profileImage && (
                  <button className="delete-photo-btn" onClick={handleDeleteImage}>Delete Photo</button>
                )}
              </div>

              <div className="field-row">
                <PencilIcon className="field-icon" />
                {editMode ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p><strong>Username:</strong> {localUser.name}</p>
                )}
              </div>

              <div className="field-row">
                <MailIcon className="field-icon" />
                {editMode ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter your email"
                  />
                ) : (
                  <p><strong>Email:</strong> {localUser.email}</p>
                )}
              </div>

              <div className="field-row">
                <PhoneIcon className="field-icon" />
                {editMode ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p><strong>Phone:</strong> {localUser.phone}</p>
                )}
              </div>

              {error && <p className="error-text">{error}</p>}

              <button className="edit-btn" onClick={handleEditToggle}>
                {editMode ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
