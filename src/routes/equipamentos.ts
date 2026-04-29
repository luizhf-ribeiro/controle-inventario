import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Equipamento } from "../entities/Equipamento";
import { ILike } from "typeorm";

const router = Router();
const repo = AppDataSource.getRepository(Equipamento);

router.get("/", async (req, res) => {
    try {
        const { tipo, nome, status, search } = req.query;
        const where: any = {};

        if (tipo) where.tipo = ILike(`%${tipo}%`);
        if (nome) where.usuarioResponsavel = ILike(`%${nome}%`);
        if (status) where.status = ILike(`%${status}%`);
        
        if (search) {
            where.tipo = ILike(`%${search}%`);
        }

        const equipamentos = await repo.find({
            where: Object.keys(where).length > 0 ? where : undefined,
            order: { dataCadastro: "DESC" }
        });

        res.json(equipamentos);
    } catch (error) {
        console.error("Erro ao listar equipamentos:", error);
        res.status(500).json({ message: "Erro ao buscar equipamentos" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const equipamento = await repo.findOneBy({ id });
        
        if (!equipamento) {
            return res.status(404).json({ message: "Equipamento não encontrado" });
        }
        
        res.json(equipamento);
    } catch (error) {
        console.error("Erro ao buscar equipamento por ID:", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
});

router.post("/", async (req, res) => {
    try {
        res.status(201).json(await repo.save(repo.create(req.body)));
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(409).json({ message: "Patrimônio já existe!" });
        } else {
            res.status(500).json({ message: "Erro ao cadastrar" });
        }
    }
});

router.put("/:id", async (req, res) => {
    try {
        const item = await repo.findOneBy({ id: parseInt(req.params.id) });
        if (item) {
            const atualizado = await repo.save(repo.merge(item, req.body));
            res.json(atualizado);
        } else {
            res.status(404).json({ message: "Equipamento não encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar equipamento" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await repo.delete(parseInt(req.params.id));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar equipamento" });
    }
});

export default router;