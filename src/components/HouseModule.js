import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import {
  getHouses,
  addHouse,
  updateHouse,
  deleteHouse,
  getRentals,
  rentHouse
} from '../api';

function HouseModule() {
  const [houses, setHouses] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // add, edit, show, rent
  const [currentHouse, setCurrentHouse] = useState({ title: '', location: '', price: '', isRented: false });

  // Fetch houses
  const fetchHouses = async () => {
    try {
      const res = await getHouses();
      setHouses(res.data);
    } catch (error) {
      console.error('Failed to fetch houses:', error);
    }
  };

  // Fetch rentals
  const fetchRentals = async () => {
    try {
      const res = await getRentals();
      setRentals(res.data);
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
    }
  };

  useEffect(() => {
    fetchHouses();
    fetchRentals();
  }, []);

  const handleShow = (house, type) => {
    setCurrentHouse(house || { title: '', location: '', price: '', isRented: false });
    setModalType(type);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setCurrentHouse({ title: '', location: '', price: '', isRented: false });
  };

  const handleChange = (e) => {
    setCurrentHouse({ ...currentHouse, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'add') {
        await addHouse(currentHouse);
      } else if (modalType === 'edit') {
        await updateHouse(currentHouse.id, currentHouse);
      }
      fetchHouses();
      handleClose();
    } catch (error) {
      console.error('Error saving house:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this house?')) {
      try {
        await deleteHouse(id);
        fetchHouses();
      } catch (error) {
        console.error('Failed to delete house:', error);
      }
    }
  };

  const handleRent = async (e) => {
    e.preventDefault();
    try {
      // Add rental record
      await rentHouse({
        houseId: currentHouse.id,
        renter: currentHouse.renter,
        days: currentHouse.days,
        date: new Date().toISOString()
      });

      // Mark house as rented
      await updateHouse(currentHouse.id, { ...currentHouse, isRented: true });

      fetchHouses();
      fetchRentals();
      handleClose();
    } catch (error) {
      console.error('Failed to rent house:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>House Management</h2>
      <Button variant="primary" onClick={() => handleShow(null, 'add')}>Add House</Button>

      {/* House Table */}
      <table className="table mt-3">
        <thead>
          <tr>
            <th>Title</th>
            <th>Location</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {houses.map(house => (
            <tr key={house.id}>
              <td>{house.title}</td>
              <td>{house.location}</td>
              <td>${house.price}</td>
              <td>{house.isRented ? 'Rented' : 'Available'}</td>
              <td>
                <Button variant="info" size="sm" onClick={() => handleShow(house, 'show')}>Show</Button>{' '}
                <Button variant="warning" size="sm" onClick={() => handleShow(house, 'edit')}>Edit</Button>{' '}
                <Button
                  variant="success"
                  size="sm"
                  disabled={house.isRented}
                  onClick={() => handleShow(house, 'rent')}
                >
                  {house.isRented ? 'Rented' : 'Rent'}
                </Button>{' '}
                <Button variant="danger" size="sm" onClick={() => handleDelete(house.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Rental History */}
      <h3>Rental History</h3>
      <table className="table">
        <thead>
          <tr>
            <th>House</th>
            <th>Renter</th>
            <th>Days</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {rentals.map(r => (
            <tr key={r.id}>
              <td>{houses.find(h => h.id === r.houseId)?.title || 'Deleted House'}</td>
              <td>{r.renter}</td>
              <td>{r.days}</td>
              <td>{new Date(r.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'add' && 'Add House'}
            {modalType === 'edit' && 'Edit House'}
            {modalType === 'show' && 'House Details'}
            {modalType === 'rent' && 'Rent House'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === 'show' ? (
            <div>
              <p><strong>Title:</strong> {currentHouse.title}</p>
              <p><strong>Location:</strong> {currentHouse.location}</p>
              <p><strong>Price:</strong> ${currentHouse.price}</p>
              <p><strong>Status:</strong> {currentHouse.isRented ? 'Rented' : 'Available'}</p>
            </div>
          ) : modalType === 'rent' ? (
            <Form onSubmit={handleRent}>
              <Form.Group className="mb-3">
                <Form.Label>Renter Name</Form.Label>
                <Form.Control
                  name="renter"
                  value={currentHouse.renter || ''}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Rental Duration (days)</Form.Label>
                <Form.Control
                  name="days"
                  type="number"
                  value={currentHouse.days || ''}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Button type="submit" variant="success">Confirm Rental</Button>
            </Form>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  name="title"
                  value={currentHouse.title}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  name="location"
                  value={currentHouse.location}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  name="price"
                  type="number"
                  value={currentHouse.price}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                {modalType === 'add' ? 'Add' : 'Update'} House
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default HouseModule;
