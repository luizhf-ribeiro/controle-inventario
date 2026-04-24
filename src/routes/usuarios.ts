import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Usuario } from "../entities/Usuario";
import { ILike } from "typeorm";

const router = Router();
const repo = AppDataSource.getRepository(Usuario);

router.get("/", async (req, res) => {
    try {
        const { nome, search } = req.query;

        const where: any = {};

        if (nome) where.nome = ILike(`%${nome}%`);
        if (search) where.nome = ILike(`%${search}%`);

        const usuarios = await repo.find({
            where: Object.keys(where).length > 0 ? where : undefined,
            order: { nome: "ASC" }
        });

        res.json(usuarios);
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        res.status(500).json({ message: "Erro ao buscar usuários" });
    }
});

// CRUD mantido
router.post("/", async (req, res) => res.status(201).json(await repo.save(repo.create(req.body))));
router.put("/:id", async (req, res) => {
    const item = await repo.findOneBy({ id: parseInt(req.params.id) });
    if (item) res.json(await repo.save(repo.merge(item, req.body)));
});
router.delete("/:id", async (req, res) => {
    await repo.delete(parseInt(req.params.id));
    res.json({ success: true });
});

export default router;