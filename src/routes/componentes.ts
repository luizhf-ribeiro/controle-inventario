import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Componente } from "../entities/Componente";

const router = Router();
const repo = AppDataSource.getRepository(Componente);

router.get("/", async (req, res) => res.json(await repo.find()));
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