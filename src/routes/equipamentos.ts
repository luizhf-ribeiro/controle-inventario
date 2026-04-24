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
        
        // Busca geral (opcional)
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

// CRUD
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
    const item = await repo.findOneBy({ id: parseInt(req.params.id) });
    if (item) res.json(await repo.save(repo.merge(item, req.body)));
});

router.delete("/:id", async (req, res) => {
    await repo.delete(parseInt(req.params.id));
    res.json({ success: true });
});

export default router;