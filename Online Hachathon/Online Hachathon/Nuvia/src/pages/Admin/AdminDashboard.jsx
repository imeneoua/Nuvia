import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      try {
        const response = await fetch(`http://localhost:8000/api/admin/users/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setUsers(users.filter(u => u.id !== id));
        } else {
          alert("Erreur lors de la suppression.");
        }
      } catch (error) {
        alert("Erreur réseau.");
      }
    }
  };

  const getAvatarUrl = (name) => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=9a7a5d&textColor=ffffff`;
  };

  return (
    <div className="admin-dashboard-wrapper">
      <h1 className="admin-title">Dashboard Utilisateurs (Nuvia)</h1>

      <div className="admin-container">
        {loading ? (
          <p style={{ textAlign: 'center' }}>Chargement des données...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>Aucun utilisateur trouvé.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td><b>#{user.id}</b></td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <button className="action-btn btn-view" onClick={() => setSelectedUser(user)}>
                        Détails
                      </button>
                      <button className="action-btn btn-delete" onClick={() => handleDelete(user.id)}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <img src={getAvatarUrl(selectedUser.name)} alt="Avatar" className="admin-modal-avatar" />
              <div>
                <h2 style={{ margin: '0 0 5px 0', color: '#333' }}>Profil</h2>
                <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                  Utilisateur
                </span>
              </div>
            </div>
            <div className="admin-modal-info">
              <p><strong>ID :</strong> #{selectedUser.id}</p>
              <p><strong>Nom :</strong> {selectedUser.name}</p>
              <p><strong>Email :</strong> {selectedUser.email}</p>
              <p><strong>Authentification :</strong> {selectedUser.auth || 'email'}</p>
            </div>
            <button className="admin-modal-close" onClick={() => setSelectedUser(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
