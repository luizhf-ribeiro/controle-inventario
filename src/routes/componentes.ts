import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Componente } from "../entities/Componente";
import { ILike } from "typeorm";

const router = Router();
const repo = AppDataSource.getRepository(Componente);

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

// CRUD
router.post("/", async (req, res) => {
    try {
        res.status(201).json(await repo.save(repo.create(req.body)));
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(409).json({ message: "Componente já cadastrado!" });
        } else {
            res.status(500).json({ message: "Erro ao cadastrar componente" });
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