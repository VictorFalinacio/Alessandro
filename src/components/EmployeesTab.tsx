import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import ConfirmModal from './ConfirmModal';
import { API_URL } from '../config';

interface Employee {
    _id: string;
    name: string;
    type: 'próprio' | 'terceirizado';
}

export const EmployeesTab: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [name, setName] = useState('');
    const [type, setType] = useState<'próprio' | 'terceirizado'>('próprio');
    const [loading, setLoading] = useState(false);

    // Deletion Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('agile_pulse_token');
            const response = await fetch(`${API_URL}/api/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                setEmployees(await response.json());
            }
        } catch (err) {
            console.error('Erro ao buscar funcionários', err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('agile_pulse_token');
            const response = await fetch(`${API_URL}/api/employees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, type })
            });
            if (response.ok) {
                setName('');
                setType('próprio');
                fetchEmployees();
            }
        } catch (err) {
            console.error('Erro ao criar funcionário', err);
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (id: string) => {
        setEmployeeToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!employeeToDelete) return;
        try {
            const token = localStorage.getItem('agile_pulse_token');
            const response = await fetch(`${API_URL}/api/employees/${employeeToDelete}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                fetchEmployees();
            }
        } catch (err) {
            console.error('Erro ao excluir', err);
        } finally {
            setIsDeleteModalOpen(false);
            setEmployeeToDelete(null);
        }
    };

    return (
        <div className="tab-container animate-fade-in">
            <div className="form-section glass-panel">
                <h3>Cadastrar Funcionário</h3>
                <form onSubmit={handleCreate} className="employee-form">
                    <Input
                        label="Nome do Funcionário"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                    <div className="input-container">
                        <label className="input-label">Tipo de Funcionário</label>
                        <select
                            className="custom-select"
                            value={type}
                            onChange={e => setType(e.target.value as 'próprio' | 'terceirizado')}
                        >
                            <option value="próprio">Próprio</option>
                            <option value="terceirizado">Terceirizado (Prefeitura)</option>
                        </select>
                    </div>
                    <Button type="submit" disabled={loading} className="mt-2">
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>
                </form>
            </div>

            <div className="list-section">
                <h3>Funcionários Cadastrados</h3>
                <div className="grid-list">
                    {employees.map(emp => (
                        <div key={emp._id} className="list-item glass-panel">
                            <div className="item-info">
                                <strong>{emp.name}</strong>
                                <span className={`badge ${emp.type === 'próprio' ? 'badge-primary' : 'badge-secondary'}`}>
                                    {emp.type}
                                </span>
                            </div>
                            <Button variant="ghost" onClick={() => openDeleteModal(emp._id)} style={{ color: 'var(--danger)', padding: '0.5rem' }} title="Excluir">
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    ))}
                    {employees.length === 0 && <p className="empty-text">Nenhum funcionário cadastrado.</p>}
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Excluir Funcionário"
                message="Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita."
                onConfirm={handleDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            />

            <style>{`
        .tab-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .form-section {
          padding: 1.5rem;
        }
        .employee-form {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 1rem;
          align-items: end;
          margin-top: 1rem;
        }
        .custom-select {
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 12px;
          padding: 0.875rem 1rem;
          color: var(--text-primary);
          font-size: 1rem;
          outline: none;
        }
        .custom-select:focus {
          border-color: var(--input-focus);
        }
        .list-section h3 {
          margin-bottom: 1rem;
        }
        .grid-list {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }
        .list-item {
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .item-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .badge {
          display: inline-block;
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          width: fit-content;
        }
        .badge-primary { background: rgba(212, 212, 212, 0.2); border: 1px solid var(--primary); }
        .badge-secondary { background: rgba(163, 163, 163, 0.2); border: 1px solid var(--secondary); }
        .empty-text { color: var(--text-secondary); }
        .mt-2 { margin-top: 0.5rem; }
        
        @media (max-width: 768px) {
          .employee-form {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};
