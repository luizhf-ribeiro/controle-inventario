import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("usuarios")
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column()
    nome: string = "";

    @Column({ unique: true })
    email: string = "";

    @Column()
    senha: string = "hepta123";

    @Column({ default: "Analista" })
    cargo: string = "Analista";

    @Column({ default: true })
    primeiroAcesso: boolean = true;

    @CreateDateColumn()
    dataCadastro: Date = new Date();
}