"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../data-source");
const Usuario_1 = require("../entities/Usuario");
const typeorm_1 = require("typeorm");
const router = (0, express_1.Router)();
const repo = data_source_1.AppDataSource.getRepository(Usuario_1.Usuario);
router.get("/", async (req, res) => {
    try {
        const { nome, search } = req.query;
        const where = {};
        if (nome)
            where.nome = (0, typeorm_1.ILike)(`%${nome}%`);
        if (search)
            where.nome = (0, typeorm_1.ILike)(`%${search}%`);
        const usuarios = await repo.find({
            where: Object.keys(where).length > 0 ? where : undefined,
            order: { nome: "ASC" }
        });
        res.json(usuarios);
    }
    catch (error) {
        console.error("Erro ao listar usuários:", error);
        res.status(500).json({ message: "Erro ao buscar usuários" });
    }
});
// CRUD mantido
router.post("/", async (req, res) => res.status(201).json(await repo.save(repo.create(req.body))));
router.put("/:id", async (req, res) => {
    const item = await repo.findOneBy({ id: parseInt(req.params.id) });
    if (item)
        res.json(await repo.save(repo.merge(item, req.body)));
});
router.delete("/:id", async (req, res) => {
    await repo.delete(parseInt(req.params.id));
    res.json({ success: true });
});
exports.default = router;
