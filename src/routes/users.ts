import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Usuario } from "../entities/Usuario";

const router = Router();
const repo = AppDataSource.getRepository(Usuario);

router.get("/", async (req, res) => {
    const users = await repo.find();
    res.json(users);
});

router.post("/", async (req, res) => {
    try {
        const novo = repo.create(req.body);
        await repo.save(novo);
        res.status(201).json(novo);
    } catch (e) {
        res.status(500).json({ message: "Erro ao salvar usuário", error: e });
    }
});

export default router;