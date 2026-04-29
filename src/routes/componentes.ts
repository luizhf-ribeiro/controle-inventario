import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Componente } from "../entities/Componente";
import { ILike } from "typeorm";

const router = Router();
const repo = AppDataSource.getRepository(Componente);

// Listar
router.get("/", async (req, res) => {
    try {
        const { tipo, nome, status, search } = req.query;
        const where: any = {};

        if (tipo) where.tipo = ILike(`%${tipo}%`);
        if (nome) where.usuarioResponsavel = ILike(`%${nome}%`);
        if (status) where.status = ILike(`%${status}%`);
        if (search) where.tipo = ILike(`%${search}%`);

        const componentes = await repo.find({
            where: Object.keys(where).length > 0 ? where : undefined,
            order: { dataCadastro: "DESC" }
        });

        res.json(componentes);
    } catch (error) {
        console.error("Erro ao listar componentes:", error);
        res.status(500).json({ message: "Erro ao buscar componentes" });
    }
});

// 🔑 Rota para buscar um componente específico (Editar)
router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const item = await repo.findOneBy({ id });
        if (!item) return res.status(404).json({ message: "Não encontrado" });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar componente" });
    }
});

// Criar
router.post("/", async (req, res) => {
    try {
        res.status(201).json(await repo.save(repo.create(req.body)));
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(409).json({ message: "Componente já cadastrado!" });
        } else {
            res.status(500).json({ message: "Erro ao cadastrar" });
        }
    }
});

// Atualizar
router.put("/:id", async (req, res) => {
    try {
        const item = await repo.findOneBy({ id: parseInt(req.params.id) });
        if (!item) return res.status(404).json({ message: "Não encontrado" });
        res.json(await repo.save(repo.merge(item, req.body)));
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar" });
    }
});

// Deletar
router.delete("/:id", async (req, res) => {
    await repo.delete(parseInt(req.params.id));
    res.json({ success: true });
});

export default router;