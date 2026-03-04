import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Users, ClipboardCheck, Wrench } from 'lucide-react';
import Button from '../components/Button';
import { EmployeesTab } from '../components/EmployeesTab';
import { ChecklistsTab } from '../components/ChecklistsTab';
import { ServicesTab } from '../components/ServicesTab';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Usuário');
  const [activeTab, setActiveTab] = useState<'employees' | 'checklists' | 'services'>('services');

  useEffect(() => {
    const storedUser = localStorage.getItem('agile_pulse_current_user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(storedUser);
    setUserName(user.name || 'Usuário');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('agile_pulse_token');
    localStorage.removeItem('agile_pulse_current_user');
    navigate('/login');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'employees': return <EmployeesTab />;
      case 'checklists': return <ChecklistsTab />;
      case 'services': return <ServicesTab />;
      default: return <ServicesTab />;
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header glass-panel">
        <div className="logo-section" onClick={() => setActiveTab('services')} style={{ cursor: 'pointer' }}>
          <LayoutDashboard size={32} color="var(--primary)" />
          <h2>Gestão de Frota</h2>
        </div>

        <nav className="desktop-nav">
          <Button variant={activeTab === 'employees' ? 'primary' : 'ghost'} onClick={() => setActiveTab('employees')}>
            <Users size={18} /> Funcionários
          </Button>
          <Button variant={activeTab === 'checklists' ? 'primary' : 'ghost'} onClick={() => setActiveTab('checklists')}>
            <ClipboardCheck size={18} /> Checklists
          </Button>
          <Button variant={activeTab === 'services' ? 'primary' : 'ghost'} onClick={() => setActiveTab('services')}>
            <Wrench size={18} /> Serviços Oficinas
          </Button>
        </nav>

        <div className="user-section">
          <span className="user-name">{userName}</span>
          <Button variant="ghost" onClick={handleLogout} className="logout-btn">
            Sair <LogOut size={18} />
          </Button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="mobile-nav glass-panel">
        <button className={activeTab === 'employees' ? 'active' : ''} onClick={() => setActiveTab('employees')}>
          <Users size={20} /> <span>Func.</span>
        </button>
        <button className={activeTab === 'checklists' ? 'active' : ''} onClick={() => setActiveTab('checklists')}>
          <ClipboardCheck size={20} /> <span>Checks</span>
        </button>
        <button className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>
          <Wrench size={20} /> <span>Serviços</span>
        </button>
      </nav>

      <main className="dashboard-content animate-fade-in">
        <div className="dashboard-welcome">
          <div className="welcome-text">
            <h1>Olá, {userName}</h1>
            <p>Gerencie seus funcionários, avaliações de veículos e serviços em oficinas de forma simplificada.</p>
          </div>

          <div className="tab-render-area">
            {renderTabContent()}
          </div>
        </div>
      </main>

      <style>{`
        .dashboard-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          border-radius: 0;
          background: rgba(10, 10, 10, 0.9);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid var(--card-border);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s ease;
        }
        .logo-section:hover { transform: scale(1.02); }
        .logo-section h2 { font-size: 1.5rem; margin: 0; font-weight: 700; background: linear-gradient(135deg, #fff 0%, #a3a3a3 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        .desktop-nav {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .mobile-nav {
          display: none;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .user-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .logout-btn {
          gap: 0.5rem;
          color: var(--text-secondary);
        }

        .dashboard-content {
          flex: 1;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .welcome-text {
          text-align: left;
          margin-bottom: 2rem;
        }

        .welcome-text h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .welcome-text p {
          color: var(--text-secondary);
          font-size: 1.1rem;
          max-width: 600px;
        }
        
        .tab-render-area {
          margin-top: 1rem;
        }

        @media (max-width: 900px) {
           .desktop-nav { display: none; }
           .mobile-nav {
             display: flex;
             justify-content: space-around;
             padding: 0.75rem;
             margin: 1rem;
             border-radius: 12px;
           }
           .mobile-nav button {
             background: transparent; border: none; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: 0.25rem; font-size: 0.8rem;
           }
           .mobile-nav button.active { color: var(--primary-hover); }
        }

        @media (max-width: 768px) {
          .dashboard-header { padding: 1rem; }
          .user-name { display: none; }
          .dashboard-content { padding: 1rem; }
          .welcome-text h1 { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
