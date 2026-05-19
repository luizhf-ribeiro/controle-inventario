"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../data-source");
const Ativo_1 = require("../entities/Ativo");
const router = (0, express_1.Router)();
const repo = data_source_1.AppDataSource.getRepository(Ativo_1.Ativo);
// GET - Listar todos
router.get("/", async (req, res) => {
    const ativos = await repo.find();
    res.json(ativos);
});
// POST - Criar
router.post("/", async (req, res) => {
    const novo = repo.create(req.body);
    await repo.save(novo);
    res.status(201).json(novo);
});
// PUT - Atualizar
router.put("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const existente = await repo.findOneBy({ id });
    if (!existente)
        return res.status(404).json({ message: "Não encontrado" });
    repo.merge(existente, req.body);
    await repo.save(existente);
    res.json(existente);
});
// DELETE - Excluir
router.delete("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await repo.delete(id);
    if (result.affected === 0)
        return res.status(404).json({ message: "Não encontrado" });
    res.json({ message: "Excluído com sucesso" });
});
exports.default = router;
