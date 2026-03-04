import React, { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import { API_URL } from '../config';

interface Service {
    _id: string;
    checklistId: { _id: string, vehicleBrand: string, vehicleModel: string, vehiclePlate: string };
    workshopName: string;
    driverId: { _id: string, name: string };
    startDate: string;
    status: 'Em andamento' | 'Concluído';
    quotes: { _id: string, partName: string, price: number }[];
    totalValue?: number;
    endDate?: string;
    retrievalDriverId?: { _id: string, name: string };
}

export const ServicesTab: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [checklists, setChecklists] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [filter, setFilter] = useState<'Todos' | 'Em andamento' | 'Concluído'>('Todos');

    // From state
    const [isCreating, setIsCreating] = useState(false);
    const [checklistId, setChecklistId] = useState('');
    const [workshopName, setWorkshopName] = useState('');
    const [driverId, setDriverId] = useState('');

    // Manage Service Detail State
    const [activeService, setActiveService] = useState<Service | null>(null);
    const [partName, setPartName] = useState('');
    const [partPrice, setPartPrice] = useState('');
    const [totalValue, setTotalValue] = useState('');
    const [retrievalDriverId, setRetrievalDriverId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('agile_pulse_token');
            const headers = { Authorization: `Bearer ${token}` };
            const [resSvc, resChk, resEmp] = await Promise.all([
                fetch(`${API_URL}/api/services`, { headers }),
                fetch(`${API_URL}/api/checklists`, { headers }),
                fetch(`${API_URL}/api/employees`, { headers })
            ]);
            if (resSvc.ok) setServices(await resSvc.json());
            if (resChk.ok) setChecklists(await resChk.json());
            if (resEmp.ok) setEmployees(await resEmp.json());
        } catch (err) {
            console.error('Erro ao buscar dados', err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('agile_pulse_token');
            const response = await fetch(`${API_URL}/api/services`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ checklistId, workshopName, driverId })
            });
            if (response.ok) {
                setIsCreating(false);
                setChecklistId(''); setWorkshopName(''); setDriverId('');
                fetchData();
            }
        } catch (err) {
            console.error('Erro ao criar serviço', err);
        }
    };

    const handleAddQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeService) return;
        try {
            const token = localStorage.getItem('agile_pulse_token');
            const response = await fetch(`${API_URL}/api/services/${activeService._id}/quotes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ partName, price: Number(partPrice) })
            });
            if (response.ok) {
                setPartName(''); setPartPrice('');
                const updated = await response.json();
                setActiveService(updated);
                fetchData();
            }
        } catch (err) {
            console.error('Erro ao adicionar peça', err);
        }
    };

    const handleFinalize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeService) return;
        try {
            const token = localStorage.getItem('agile_pulse_token');
            const response = await fetch(`${API_URL}/api/services/${activeService._id}/finalize`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ totalValue: Number(totalValue), retrievalDriverId })
            });
            if (response.ok) {
                await response.json();
                setActiveService(null);
                fetchData();
            }
        } catch (err) {
            console.error('Erro ao finalizar serviço', err);
        }
    };

    const filteredServices = services.filter(s => filter === 'Todos' ? true : s.status === filter);

    if (activeService) {
        const chk = activeService.checklistId;
        // When population gets lost during activeService set from response, we find it from lists
        const vehicleStr = chk ? `${chk.vehicleBrand} ${chk.vehicleModel} (${chk.vehiclePlate})` : 'Veículo Desconhecido';

        return (
            <div className="tab-container animate-fade-in glass-panel service-detail-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>Gerenciar Serviço: {vehicleStr} na Oficina {activeService.workshopName}</h3>
                    <Button variant="ghost" onClick={() => setActiveService(null)}>Voltar</Button>
                </div>

                {activeService.status === 'Em andamento' && (
                    <div className="quote-section">
                        <h4>1. Adicionar Peças ao Orçamento</h4>
                        <form onSubmit={handleAddQuote} className="flex-form">
                            <Input label="Nome da Peça" value={partName} onChange={e => setPartName(e.target.value)} required />
                            <Input label="Preço (R$)" type="number" step="0.01" value={partPrice} onChange={e => setPartPrice(e.target.value)} required />
                            <Button type="submit" className="mt-fix">Adicionar Peça</Button>
                        </form>
                        <div className="quotes-list">
                            {activeService.quotes.map(q => (
                                <div key={q._id} className="quote-item">
                                    <span>{q.partName}</span>
                                    <strong>R$ {q.price.toFixed(2)}</strong>
                                </div>
                            ))}
                            {activeService.quotes.length === 0 && <span className="empty-text">Sem peças no orçamento ainda.</span>}
                            {activeService.quotes.length > 0 && (
                                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                                    <strong>Total das Peças: R$ {activeService.quotes.reduce((acc, curr) => acc + curr.price, 0).toFixed(2)}</strong>
                                </div>
                            )}
                        </div>

                        <h4 style={{ marginTop: '2rem' }}>2. Finalizar Serviço</h4>
                        <form onSubmit={handleFinalize} className="flex-form">
                            <Input label="Valor Total Final (R$)" type="number" step="0.01" value={totalValue} onChange={e => setTotalValue(e.target.value)} required />
                            <div className="input-container flex-grow">
                                <label className="input-label">Motorista que buscou</label>
                                <select className="custom-select" value={retrievalDriverId} onChange={e => setRetrievalDriverId(e.target.value)} required>
                                    <option value="">Selecione...</option>
                                    {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.type})</option>)}
                                </select>
                            </div>
                            <Button type="submit" className="mt-fix" style={{ background: 'var(--success)', color: '#000' }}>Finalizar</Button>
                        </form>
                    </div>
                )}

                {activeService.status === 'Concluído' && (
                    <div className="completed-info">
                        <h4>Serviço Concluído</h4>
                        <p>Data Finalização: {activeService.endDate ? new Date(activeService.endDate).toLocaleString('pt-BR') : 'N/A'}</p>
                        <p>Valor Total: R$ {activeService.totalValue?.toFixed(2)}</p>
                        <h4>Peças Trocadas:</h4>
                        <ul>
                            {activeService.quotes.map(q => <li key={q._id}>{q.partName} - R$ {q.price.toFixed(2)}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="tab-container animate-fade-in">

            <div className="filter-bar glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="filters" style={{ display: 'flex', gap: '1rem' }}>
                    {['Todos', 'Em andamento', 'Concluído'].map(f => (
                        <Button key={f} variant={filter === f ? 'primary' : 'ghost'} onClick={() => setFilter(f as any)}>
                            {f}
                        </Button>
                    ))}
                </div>
                <Button onClick={() => setIsCreating(!isCreating)}>{isCreating ? 'Cancelar' : 'Novo Serviço'}</Button>
            </div>

            {isCreating && (
                <div className="form-section glass-panel">
                    <h3>Criar Novo Serviço</h3>
                    <form onSubmit={handleCreate} className="service-form">
                        <div className="input-container">
                            <label className="input-label">Checklist de Entrada</label>
                            <select className="custom-select" value={checklistId} onChange={e => setChecklistId(e.target.value)} required>
                                <option value="">Selecione o veículo...</option>
                                {checklists.map(chk => (
                                    <option key={chk._id} value={chk._id}>
                                        {chk.vehicleBrand} {chk.vehicleModel} - Placa {chk.vehiclePlate}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Input label="Nome da Oficina" value={workshopName} onChange={e => setWorkshopName(e.target.value)} required />
                        <div className="input-container">
                            <label className="input-label">Motorista que levou</label>
                            <select className="custom-select" value={driverId} onChange={e => setDriverId(e.target.value)} required>
                                <option value="">Selecione...</option>
                                {employees.map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="full-width flex-end">
                            <Button type="submit">Criar Serviço</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="list-section">
                <div className="grid-list">
                    {filteredServices.map(svc => (
                        <div key={svc._id} className="list-item glass-panel" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Oficina: {svc.workshopName}</strong>
                                <span className={`badge ${svc.status === 'Concluído' ? 'badge-success' : 'badge-warning'}`}>{svc.status}</span>
                            </div>
                            <div className="info-text">
                                {svc.checklistId ? `Veículo: ${svc.checklistId.vehicleBrand} ${svc.checklistId.vehicleModel} (${svc.checklistId.vehiclePlate})` : 'Veículo Desconhecido'}
                            </div>
                            <div className="info-text">
                                Início: {new Date(svc.startDate).toLocaleDateString('pt-BR')}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="secondary" onClick={() => setActiveService(svc)}>Gerenciar Serviço</Button>
                            </div>
                        </div>
                    ))}
                    {filteredServices.length === 0 && <p className="empty-text">Nenhum serviço encontrado.</p>}
                </div>
            </div>

            <style>{`
        .tab-container { display: flex; flex-direction: column; gap: 1.5rem; }
        .service-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;}
        .full-width { grid-column: 1 / -1; }
        .flex-end { display: flex; justify-content: flex-end; }
        .custom-select { width: 100%; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 12px; padding: 0.875rem 1rem; color: var(--text-primary); outline: none; }
        .custom-select:focus { border-color: var(--input-focus); }
        .grid-list { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
        .list-item { padding: 1.25rem; }
        .badge { font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; }
        .badge-success { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }
        .badge-warning { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; }
        .info-text { color: var(--text-secondary); font-size: 0.9rem; }
        .service-detail-panel { padding: 2rem; }
        .flex-form { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; margin-top: 1rem; }
        .mt-fix { margin-bottom: 1.25rem; }
        .flex-grow { flex: 1; min-width: 200px; }
        .quotes-list { margin-top: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; }
        .quote-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--card-border); }
        .completed-info { margin-top: 1.5rem; padding: 1rem; background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); border-radius: 8px; }
        .completed-info ul { margin-left: 1.5rem; margin-top: 0.5rem; }
        .completed-info li { color: var(--text-secondary); }
      `}</style>
        </div>
    );
};
