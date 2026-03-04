import express from 'express';
import Service from '../models/Service.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

// Get all services
router.get('/', authMiddleware, async (req, res) => {
    try {
        const services = await Service.find({ userId: req.user.id })
            .populate('driverId')
            .populate('checklistId')
            .populate('retrievalDriverId')
            .sort({ createdAt: -1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao buscar serviços.' });
    }
});

// Create service
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { checklistId, workshopName, driverId, startDate } = req.body;
        if (!checklistId || !workshopName || !driverId) {
            return res.status(400).json({ msg: 'Campos obrigatórios ausentes.' });
        }
        const newService = new Service({
            userId: req.user.id,
            checklistId,
            workshopName,
            driverId,
            startDate: startDate || Date.now()
        });
        await newService.save();
        res.json(newService);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao criar serviço.' });
    }
});

// Add quote to service
router.post('/:id/quotes', authMiddleware, async (req, res) => {
    try {
        const { partName, price } = req.body;
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ msg: 'Serviço não encontrado.' });
        if (service.userId.toString() !== (req.user.id || req.user._id)) return res.status(401).json({ msg: 'Não autorizado.' });

        service.quotes.push({ partName, price });
        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao adicionar orçamento.' });
    }
});

// Remove quote
router.delete('/:id/quotes/:quoteId', authMiddleware, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ msg: 'Serviço não encontrado.' });
        if (service.userId.toString() !== (req.user.id || req.user._id)) return res.status(401).json({ msg: 'Não autorizado.' });

        service.quotes = service.quotes.filter(q => q._id.toString() !== req.params.quoteId);
        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao remover orçamento.' });
    }
});

// Finalize service
router.put('/:id/finalize', authMiddleware, async (req, res) => {
    try {
        const { totalValue, endDate, retrievalDriverId } = req.body;
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ msg: 'Serviço não encontrado.' });
        if (service.userId.toString() !== (req.user.id || req.user._id)) return res.status(401).json({ msg: 'Não autorizado.' });

        service.status = 'Concluído';
        service.totalValue = totalValue;
        service.endDate = endDate || Date.now();
        service.retrievalDriverId = retrievalDriverId;

        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao finalizar serviço.' });
    }
});

export default router;
