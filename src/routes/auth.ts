// src/routes/auth.ts
import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Usuario } from '../entities/Usuario';

const router = Router();
const usuarioRepo = AppDataSource.getRepository(Usuario);

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await usuarioRepo.findOne({ 
            where: { email } 
        });

        if (!usuario) {
            return res.status(401).json({ message: "Usuário não encontrado" });
        }

        // Simulação simples de senha (em produção use bcrypt)
        if (usuario.senha !== senha) {
            return res.status(401).json({ message: "Senha incorreta" });
        }

        res.json({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            cargo: usuario.cargo
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro interno" });
    }
});

export default router;