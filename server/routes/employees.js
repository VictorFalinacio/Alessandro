import express from 'express';
import Employee from '../models/Employee.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const employees = await Employee.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao buscar funcionários.' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, type } = req.body;
        if (!name || !type) {
            return res.status(400).json({ msg: 'Nome e tipo são obrigatórios.' });
        }
        const newEmployee = new Employee({
            userId: req.user.id,
            name,
            type
        });
        await newEmployee.save();
        res.json(newEmployee);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao criar funcionário.' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ msg: 'Funcionário não encontrado.' });
        }
        const userId = req.user.id || req.user._id;
        if (employee.userId.toString() !== userId) {
            return res.status(401).json({ msg: 'Não autorizado.' });
        }
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Funcionário excluído com sucesso.' });
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao excluir o funcionário.' });
    }
});

export default router;
