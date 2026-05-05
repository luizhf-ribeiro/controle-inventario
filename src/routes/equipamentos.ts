import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Equipamento } from "../entities/Equipamento";
import { ILike } from "typeorm";

const router = Router();
const repo = AppDataSource.getRepository(Equipamento);

// Listar todos
router.get("/", async (req, res) => {
    try {
        const { tipo, nome, status, search } = req.query;
        const where: any = {};

        if (tipo) where.tipo = ILike(`%${tipo}%`);
        if (nome) where.usuarioResponsavel = ILike(`%${nome}%`);
        if (status) where.status = ILike(`%${status}%`);
        if (search) where.tipo = ILike(`%${search}%`);

        const equipamentos = await repo.find({
            where: Object.keys(where).length > 0 ? where : undefined,
            order: { dataCadastro: "DESC" }
        });

        res.json(equipamentos);
    } catch (error) {
        console.error("Erro ao listar:", error);
        res.status(500).json({ message: "Erro ao listar equipamentos" });
    }
});

// 🔑 ESSA É A ROTA QUE O EDITAR USA
router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const equipamento = await repo.findOneBy({ id });

        if (!equipamento) {
            return res.status(404).json({ message: "Equipamento não encontrado" });
        }

        res.json(equipamento);
    } catch (error) {
        console.error("Erro ao buscar por ID:", error);
        res.status(500).json({ message: "Erro interno ao buscar equipamento" });
    }
});

// Criar
router.post("/", async (req, res) => {
    try {
        const novo = repo.create(req.body);
        res.status(201).json(await repo.save(novo));
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(409).json({ message: "Patrimônio já existe!" });
        } else {
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
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        res.status(500).json({ message: "Erro ao atualizar equipamento" });
    }
});

// Deletar
router.delete("/:id", async (req, res) => {
    try {
        await repo.delete(parseInt(req.params.id));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar" });
    }
});

export default router;