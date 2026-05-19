"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.ts
const express_1 = require("express");
const data_source_1 = require("../data-source");
const Usuario_1 = require("../entities/Usuario");
const router = (0, express_1.Router)();
const usuarioRepo = data_source_1.AppDataSource.getRepository(Usuario_1.Usuario);
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro interno" });
    }
});
exports.default = router;
