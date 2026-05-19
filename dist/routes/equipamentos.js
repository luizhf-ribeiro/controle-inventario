"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../data-source");
const Equipamento_1 = require("../entities/Equipamento");
const typeorm_1 = require("typeorm");
const router = (0, express_1.Router)();
const repo = data_source_1.AppDataSource.getRepository(Equipamento_1.Equipamento);
// ====================== IMPORTAÇÃO CSV ======================
router.post("/import", async (req, res) => {
    try {
        const equipamentos = req.body;
        if (!Array.isArray(equipamentos) || equipamentos.length === 0) {
            return res.status(400).json({
                message: "Nenhum equipamento enviado para importação"
            });
        }
        let importados = 0;
        const errors = [];
        for (const eq of equipamentos) {
            try {
                const novo = repo.create({
                    patrimonio: eq.patrimonio?.trim(),
                    tipo: eq.tipo?.trim(),
                    marca: eq.marca?.trim(),
                    modelo: eq.modelo?.trim(),
                    serialNumber: eq.serialNumber?.trim(),
                    localizacao: eq.localizacao?.trim(),
                    status: eq.status?.trim() || 'Offline',
                    usuarioResponsavel: eq.usuarioResponsavel?.trim()
                });
                await repo.save(novo);
                importados++;
            }
            catch (err) {
                if (err.code === '23505') { // Unique violation (patrimônio duplicado)
                    errors.push(`Patrimônio "${eq.patrimonio}" já existe no sistema.`);
                }
                else {
                    errors.push(`Erro ao importar "${eq.patrimonio || 'sem patrimônio'}": ${err.message}`);
                }
            }
        }
        res.json({
            message: "Importação finalizada",
            importados,
            totalTentados: equipamentos.length,
            erros: errors.length > 0 ? errors : undefined
        });
    }
    catch (error) {
        console.error("Erro na importação em lote:", error);
        res.status(500).json({ message: "Erro interno ao processar importação" });
    }
});
// Listar todos
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
            where.tipo = (0, typeorm_1.ILike)(`%${search}%`); // ou outro campo
        const equipamentos = await repo.find({
            where: Object.keys(where).length > 0 ? where : undefined,
            order: { dataCadastro: "DESC" }
        });
        res.json(equipamentos);
    }
    catch (error) {
        console.error("Erro ao listar:", error);
        res.status(500).json({ message: "Erro ao listar equipamentos" });
    }
});
// Buscar por ID
router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const equipamento = await repo.findOneBy({ id });
        if (!equipamento) {
            return res.status(404).json({ message: "Equipamento não encontrado" });
        }
        res.json(equipamento);
    }
    catch (error) {
        console.error("Erro ao buscar por ID:", error);
        res.status(500).json({ message: "Erro interno ao buscar equipamento" });
    }
});
// Criar
router.post("/", async (req, res) => {
    try {
        const novo = repo.create(req.body);
        res.status(201).json(await repo.save(novo));
    }
    catch (error) {
        if (error.code === '23505') {
            res.status(409).json({ message: "Patrimônio já existe!" });
        }
        else {
            res.status(500).json({ message: "Erro ao cadastrar" });
        }
    }
});
// Atualizar
router.put("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const item = await repo.findOneBy({ id });
        if (!item) {
            return res.status(404).json({ message: "Equipamento não encontrado" });
        }
        const atualizado = await repo.save(repo.merge(item, req.body));
        res.json(atualizado);
    }
    catch (error) {
        console.error("Erro ao atualizar:", error);
        res.status(500).json({ message: "Erro ao atualizar equipamento" });
    }
});
// Deletar
router.delete("/:id", async (req, res) => {
    try {
        await repo.delete(parseInt(req.params.id));
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ message: "Erro ao deletar" });
    }
});
exports.default = router;
