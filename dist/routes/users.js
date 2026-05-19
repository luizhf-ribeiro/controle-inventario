"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../data-source");
const Usuario_1 = require("../entities/Usuario");
const router = (0, express_1.Router)();
const repo = data_source_1.AppDataSource.getRepository(Usuario_1.Usuario);
router.get("/", async (req, res) => {
    const users = await repo.find();
    res.json(users);
});
router.post("/", async (req, res) => {
    try {
        const novo = repo.create(req.body);
        await repo.save(novo);
        res.status(201).json(novo);
    }
    catch (e) {
        res.status(500).json({ message: "Erro ao salvar usuário", error: e });
    }
});
exports.default = router;
