import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/foodorderpage.css';

function FoodItemsPage() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    availability: 'Available',
  });
  const [editFormData, setEditFormData] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [message, setMessage] = useState('');
  const [editItemId, setEditItemId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  const restaurant = JSON.parse(sessionStorage.getItem('restaurant'));
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/food-items', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFoodItems(response.data);
    } catch (err) {
      console.error('Error fetching food items:', err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5002/api/food-items',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(response.data.message);
      fetchFoodItems();
      setFormData({ name: '', price: '', description: '', availability: 'Available' });
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditItemId(item._id);
    setEditFormData({
      name: item.name,
      price: item.price,
      description: item.description,
      availability: item.availability,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:5002/api/food-items/${editItemId}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      setShowEditModal(false);
      fetchFoodItems();
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const response = await axios.delete(`http://localhost:5002/api/food-items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.message);
      fetchFoodItems();
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvailabilityToggle = async (id, currentAvailability) => {
    setIsLoading(true);
    try {
      const newAvailability = currentAvailability === 'Available' ? 'Unavailable' : 'Available';
      const response = await axios.patch(
        `http://localhost:5002/api/food-items/${id}/availability`,
        { availability: newAvailability },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      fetchFoodItems();
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="food-management-container">
      <div className="restaurant-header">
        <h1 className="restaurant-title">{restaurant?.name || 'Restaurant Dashboard'}</h1>
        <div className="restaurant-info">
          <p><span className="info-label">Email:</span> {restaurant?.email}</p>
          <p><span className="info-label">Address:</span> {restaurant?.address}</p>
        </div>
      </div>

      <div className="management-panel">
        <div className="form-section">
          <h2 className="section-title">Add New Food Item</h2>
          <form onSubmit={handleSubmit} className="food-form">
            <div className="form-group">
              <label htmlFor="name">Food Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
            </div>
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : 'Add Item'}
            </button>
          </form>
        </div>

        <div className="action-buttons">
          <button onClick={() => navigate('/foodadd2')} className="nav-button">Go to Food Add</button>
          <button onClick={() => navigate('/restuarantorderview')} className="nav-button">View Orders</button>
        </div>

        {message && (
          <div className={`message ${message.toLowerCase().includes('error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="food-items-section">
          <h2 className="section-title">Your Menu Items</h2>
          {foodItems.length === 0 ? (
            <p className="no-items">No food items added yet</p>
          ) : (
            <div className="food-items-grid">
              {foodItems.map((item) => (
                <div key={item._id} className="food-item-card">
                  <div className="food-item-header">
                    <h3>{item.name}</h3>
                    <span className={`availability-badge ${item.availability.toLowerCase()}`}>
                      {item.availability}
                    </span>
                  </div>
                  <p className="food-price">${item.price}</p>
                  <p className="food-description">{item.description}</p>
                  <p className="food-restaurant">{item.restaurant.name}</p>
                  <div className="food-item-actions">
                    <button
                      onClick={() => handleAvailabilityToggle(item._id, item.availability)}
                      className={`toggle-button ${item.availability.toLowerCase()}`}
                      disabled={isLoading}
                    >
                      {item.availability === 'Available' ? 'Make Unavailable' : 'Make Available'}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="edit-button"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="delete-button"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="section-title">Edit Food Item</h2>
            <form onSubmit={handleEditSubmit} className="food-update-form">
              <div className="form-group">
                <label htmlFor="name">Food Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editFormData.name} // Fixed: Use editFormData
                  onChange={handleEditChange} // Fixed: Use handleEditChange
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price ($)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={editFormData.price} // Fixed: Use editFormData
                  onChange={handleEditChange} // Fixed: Use handleEditChange
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={editFormData.description} // Fixed: Use editFormData
                  onChange={handleEditChange} // Fixed: Use handleEditChange
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-update-button">Update Item</button>
                <button type="button" className="cancel-button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodItemsPage;
