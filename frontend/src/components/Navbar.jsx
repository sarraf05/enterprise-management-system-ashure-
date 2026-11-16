import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Sol: Logo ve Uygulama Adı */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="8" height="8" rx="2" fill="#FFFFFF" />
              <rect x="13" y="3" width="8" height="8" rx="2" fill="#E0F2FE" fillOpacity="0.85" />
              <rect x="3" y="13" width="8" height="8" rx="2" fill="#7DD3FC" fillOpacity="0.85" />
              <rect x="13" y="13" width="8" height="8" rx="2" fill="#38BDF8" />
            </svg>
          </div>
          <span className="brand-name">ASHURE</span>
          <span className="brand-tag">DevOps Workspace</span>
        </Link>

        {/* Sağ: Aktif Kullanıcı Profil & Rol Göstergesi */}
        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">Sistem Yöneticisi</span>
            <span className="user-role">Sistem Mimarı & Ürün Sahibi</span>
          </div>
          <div className="user-avatar" title="Sistem Yöneticisi">
            <span>SM</span>
          </div>
        </div>
      </div>
    </header>
  );
}
