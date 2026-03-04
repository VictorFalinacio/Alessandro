import express from 'express';
import Checklist from '../models/Checklist.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const checklists = await Checklist.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(checklists);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao buscar checklists.' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { vehicleBrand, vehicleModel, vehiclePlate, mileage, fuelLiters, damages } = req.body;
        if (!vehicleBrand || !vehicleModel || !vehiclePlate || mileage == null || fuelLiters == null) {
            return res.status(400).json({ msg: 'Campos obrigatórios ausentes.' });
        }
        const newChecklist = new Checklist({
            userId: req.user.id,
            vehicleBrand,
            vehicleModel,
            vehiclePlate,
            mileage,
            fuelLiters,
            damages
        });
        await newChecklist.save();
        res.json(newChecklist);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao criar checklist.' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const checklist = await Checklist.findById(req.params.id);
        if (!checklist) {
            return res.status(404).json({ msg: 'Checklist não encontrado.' });
        }
        const userId = req.user.id || req.user._id;
        if (checklist.userId.toString() !== userId) {
            return res.status(401).json({ msg: 'Não autorizado.' });
        }
        await Checklist.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Checklist excluído com sucesso.' });
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao excluir o checklist.' });
    }
});

export default router;
