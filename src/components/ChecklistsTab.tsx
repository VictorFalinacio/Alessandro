import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import ConfirmModal from './ConfirmModal';
import { API_URL } from '../config';

export interface Checklist {
    _id: string;
    vehicleBrand: string;
    vehicleModel: string;
    vehiclePlate: string;
    mileage: number;
    fuelLiters: number;
    damages: string;
    driverId?: { _id: string, name: string };
    createdAt: string;
}

export const ChecklistsTab: React.FC = () => {
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [vehicleBrand, setVehicleBrand] = useState('');
    const [vehicleModel, setVehicleModel] = useState('');
    const [vehiclePlate, setVehiclePlate] = useState('');
    const [mileage, setMileage] = useState('');
    const [fuelLiters, setFuelLiters] = useState('');
    const [damages, setDamages] = useState('');
    const [driverId, setDriverId] = useState('');
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Deletion Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [checklistToDelete, setChecklistToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchChecklists();
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('agile_pulse_token');
            const response = await fetch(`${API_URL}/api/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) setEmployees(await response.json());
        } catch (err) {
            console.error('Erro ao buscar funcionários', err);
        }
    };

    const fetchChecklists = async () => {
        try {
            const token = localStorage.getItem('agile_pulse_token');
            const response = await fetch(`${API_URL}/api/checklists`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                setChecklists(await response.json());
            }
        } catch (err) {
            console.error('Erro ao buscar checklists', err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('agile_pulse_token');
            const response = await fetch(`${API_URL}/api/checklists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    vehicleBrand, vehicleModel, vehiclePlate,
                    mileage: Number(mileage.toString().replace(/\D/g, '')), // Remove any non-digits before saving
                    fuelLiters: Number(fuelLiters),
                    damages,
                    driverId
                })
            });
            if (response.ok) {
                setVehicleBrand(''); setVehicleModel(''); setVehiclePlate('');
                setMileage(''); setFuelLiters(''); setDamages(''); setDriverId('');
                fetchChecklists();
            }
        } catch (err) {
            console.error('Erro ao criar checklist', err);
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (id: string) => {
        setChecklistToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!checklistToDelete) return;
        try {
            const token = localStorage.getItem('agile_pulse_token');
            const response = await fetch(`${API_URL}/api/checklists/${checklistToDelete}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                fetchChecklists();
            }
        } catch (err) {
            console.error('Erro ao excluir', err);
        } finally {
            setIsDeleteModalOpen(false);
            setChecklistToDelete(null);
        }
    };

    return (
        <div className="tab-container animate-fade-in">
            <div className="form-section glass-panel">
                <h3>Criar Checklist de Entrada</h3>
                <form onSubmit={handleCreate} className="checklist-form">
                    <Input label="Marca do Veículo" value={vehicleBrand} onChange={e => setVehicleBrand(e.target.value)} required />
                    <Input label="Modelo do Veículo" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} required />
                    <Input label="Placa" value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value)} required />
                    <Input label="Quilometragem (km)" type="text" inputMode="numeric" value={mileage} onChange={e => setMileage(e.target.value.replace(/\D/g, ''))} placeholder="Ex: 35000" required />
                    <Input label="Combustível (Litros)" type="number" value={fuelLiters} onChange={e => setFuelLiters(e.target.value)} required />
                    <div className="full-width">
                        <Input label="Danos e Avarias" value={damages} onChange={e => setDamages(e.target.value)} placeholder="Ex: Arranhão na porta direita" />
                    </div>
                    <div className="form-group full-width">
                        <label className="input-label">Motorista que buscou</label>
                        <div className="select-wrapper">
                            <select className="custom-select" value={driverId} onChange={e => setDriverId(e.target.value)} required>
                                <option value="">Selecione o motorista...</option>
                                {employees.map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="full-width flex-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Checklist'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="list-section">
                <h3>Checklists Anteriores</h3>
                <div className="grid-list">
                    {checklists.map(chk => (
                        <div key={chk._id} className="list-item glass-panel">
                            <div className="item-info">
                                <strong>{chk.vehicleBrand} {chk.vehicleModel} - Placa: {chk.vehiclePlate}</strong>
                                <span className="info-text">KM: {chk.mileage} | Combustível: {chk.fuelLiters}L</span>
                                <span className="info-text">Motorista que buscou: <strong>{chk.driverId?.name || 'Não informado'}</strong></span>
                                {chk.damages && <span className="damages-text">Avarias: {chk.damages}</span>}
                                <span className="date-text">{new Date(chk.createdAt).toLocaleString('pt-BR')}</span>
                            </div>
                            <Button variant="ghost" onClick={() => openDeleteModal(chk._id)} style={{ color: 'var(--danger)', padding: '0.5rem' }} title="Excluir">
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    ))}
                    {checklists.length === 0 && <p className="empty-text">Nenhum checklist cadastrado.</p>}
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Excluir Checklist"
                message="Tem certeza que deseja excluir este registro de checklist? Esta ação não pode ser desfeita."
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
        .checklist-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .full-width {
          grid-column: 1 / -1;
        }
        .flex-end {
          display: flex;
          justify-content: flex-end;
        }
        .list-section h3 {
          margin-bottom: 1rem;
        }
        .grid-list {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        }
        .list-item {
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .item-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .info-text, .date-text { color: var(--text-secondary); font-size: 0.85rem; }
        .damages-text { color: var(--danger); font-size: 0.85rem; }
        .empty-text { color: var(--text-secondary); }

        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .select-wrapper { position: relative; }
        .custom-select { 
            width: 100%; 
            background: #1e293b; 
            border: 1px solid var(--input-border); 
            border-radius: 12px; 
            padding: 0.875rem 1rem; 
            color: var(--text-primary); 
            outline: none; 
            appearance: none;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .custom-select:focus { border-color: var(--input-focus); box-shadow: 0 0 0 4px var(--primary-glow); }
        .custom-select option { background: #0f172a; color: white; }
        .select-wrapper::after {
            content: "▼";
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.8rem;
            color: var(--text-secondary);
            pointer-events: none;
        }
      `}</style>
        </div>
    );
};
