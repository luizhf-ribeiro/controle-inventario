import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("equipamentos")
export class Equipamento {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column()
    tipo: string = "";

    @Column()
    marca: string = "";

    @Column()
    modelo: string = "";

    @Column({ unique: true })
    patrimonio: string = "";

    @Column({ nullable: true })
    serialNumber: string = "";

    @Column({ default: "Disponível" })
    status: string = "Disponível";

    @Column({ nullable: true })
    usuarioResponsavel: string = "";

    @CreateDateColumn()
    dataCadastro: Date = new Date();
}