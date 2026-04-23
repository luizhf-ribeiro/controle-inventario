import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("componentes")
export class Componente {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column()
    tipo: string = "";

    @Column()
    marca: string = "";

    @Column()
    modelo: string = "";

    @Column({ default: "Disponível" })
    status: string = "Disponível";

    @Column({ nullable: true })
    usuarioResponsavel: string = "";

    @CreateDateColumn()
    dataCadastro: Date = new Date();
}