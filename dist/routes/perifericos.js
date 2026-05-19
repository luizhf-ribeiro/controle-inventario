"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../data-source");
const Periferico_1 = require("../entities/Periferico");
const typeorm_1 = require("typeorm");
const router = (0, express_1.Router)();
const repo = data_source_1.AppDataSource.getRepository(Periferico_1.Periferico);
// Listar
router.get("/", async (req, res) => {
    try {
        const { tipo, nome, status, search } = req.query;
        const where = {};
        if (tipo)
            where.tipo = (0, typeorm_1.ILike)(`%${tipo}%`);
        if (nome)
            where.usuarioResponsavel = (0, typeorm_1.ILike)(`%${nome}%`);
        if (status)
            where.status = (0, typeorm_1.ILike)(`%${status}%`);
        if (search)
            where.tipo = (0, typeorm_1.ILike)(`%${search}%`);
        const perifericos = await repo.find({
            where: Object.keys(where).length > 0 ? where : undefined,
            order: { dataCadastro: "DESC" }
        });
        res.json(perifericos);
    }
    catch (error) {
        console.error("Erro ao listar periféricos:", error);
        res.status(500).json({ message: "Erro ao buscar periféricos" });
    }
});
// 🔑 Rota para buscar um periférico específico (Editar)
router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const item = await repo.findOneBy({ id });
        if (!item)
            return res.status(404).json({ message: "Não encontrado" });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ message: "Erro ao buscar periférico" });
    }
});
// Criar
router.post("/", async (req, res) => {
    try {
        res.status(201).json(await repo.save(repo.create(req.body)));
    }
    catch (error) {
        if (error.code === '23505') {
            res.status(409).json({ message: "Periférico já cadastrado!" });
        }
        else {
            res.status(500).json({ message: "Erro ao cadastrar" });
        }
    }
});
// Atualizar
router.put("/:id", async (req, res) => {
    try {
        const item = await repo.findOneBy({ id: parseInt(req.params.id) });
        if (!item)
            return res.status(404).json({ message: "Não encontrado" });
        res.json(await repo.save(repo.merge(item, req.body)));
    }
    catch (error) {
        res.status(500).json({ message: "Erro ao atualizar" });
    }
});
// Deletar
router.delete("/:id", async (req, res) => {
    await repo.delete(parseInt(req.params.id));
    res.json({ success: true });
});
exports.default = router;
