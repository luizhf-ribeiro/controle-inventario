import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Periferico } from "../entities/Periferico";
import { ILike } from "typeorm";

const router = Router();
const repo = AppDataSource.getRepository(Periferico);

router.get("/", async (req, res) => {
    try {
        const { tipo, nome, status, search } = req.query;

        const where: any = {};

        if (tipo) where.tipo = ILike(`%${tipo}%`);
        if (nome) where.usuarioResponsavel = ILike(`%${nome}%`);
        if (status) where.status = ILike(`%${status}%`);
        
        // Busca geral
        if (search) {
            where.tipo = ILike(`%${search}%`);
        }

        const perifericos = await repo.find({
            where: Object.keys(where).length > 0 ? where : undefined,
            order: { dataCadastro: "DESC" }
        });

        res.json(perifericos);
    } catch (error) {
        console.error("Erro ao listar periféricos:", error);
        res.status(500).json({ message: "Erro ao buscar periféricos" });
    }
});

// CRUD
router.post("/", async (req, res) => {
    try {
        res.status(201).json(await repo.save(repo.create(req.body)));
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(409).json({ message: "Periférico já cadastrado!" });
        } else {
            res.status(500).json({ message: "Erro ao cadastrar periférico" });
        }
    }
});

router.put("/:id", async (req, res) => {
    const item = await repo.findOneBy({ id: parseInt(req.params.id) });
    if (item) res.json(await repo.save(repo.merge(item, req.body)));
});

router.delete("/:id", async (req, res) => {
    await repo.delete(parseInt(req.params.id));
    res.json({ success: true });
});

export default router;