import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Ativo } from "../entities/Ativo";

const router = Router();
const repo = AppDataSource.getRepository(Ativo);

// GET - Listar todos
router.get("/", async (req: Request, res: Response) => {
    const ativos = await repo.find();
    res.json(ativos);
});

// POST - Criar
router.post("/", async (req: Request, res: Response) => {
    const novo = repo.create(req.body);
    await repo.save(novo);
    res.status(201).json(novo);
});

// PUT - Atualizar
router.put("/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const existente = await repo.findOneBy({ id });
    if (!existente) return res.status(404).json({ message: "Não encontrado" });

    repo.merge(existente, req.body);
    await repo.save(existente);
    res.json(existente);
});

// DELETE - Excluir
router.delete("/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const result = await repo.delete(id);
    if (result.affected === 0) return res.status(404).json({ message: "Não encontrado" });
    res.json({ message: "Excluído com sucesso" });
});

export default router;