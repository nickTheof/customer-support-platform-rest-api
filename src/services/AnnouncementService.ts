import {IAnnouncementService} from "./IAnnouncementService";
import {AnnouncementAttachInfoDTO, AnnouncementInsertDTO, AnnouncementReadOnlyDTO} from "../core/types/zod-model.types";
import {Types} from "mongoose";
import {IAnnouncementRepository} from "../repository/IAnnouncementRepository";
import {IAttachmentRepository} from "../repository/IAttachmentRepository";
import {IUserRepository} from "../repository/IUserRepository";
import fs from "fs/promises";
import {AppObjectNotFoundException, AppServerException} from "../core/exceptions/app.exceptions";
import { UserTokenPayload} from "../core/interfaces/user.interfaces";
import logger from "../core/utils/logger";
import mapper from "../mapper/mapper";
import {IAnnouncementDocument} from "../core/interfaces/announcement.interfaces";
import {IAttachmentDocument} from "../core/interfaces/attachment.interfaces";
import {IUnitOfWork} from "../core/transactions/IUnitOfWork";

export class AnnouncementService implements IAnnouncementService {
    constructor(private announcementRepository: IAnnouncementRepository,
                private attachmentRepository: IAttachmentRepository,
                private userRepository: IUserRepository,
                private unitOfWork: IUnitOfWork) {
    }


    async createAnnouncement(dto: AnnouncementInsertDTO, files: Express.Multer.File[], user: UserTokenPayload): Promise<AnnouncementReadOnlyDTO> {
        const savedFileIds: Types.ObjectId[] = [];
        const filePaths = files.map(f => f.path);
        await this.unitOfWork.start();
        const session = this.unitOfWork.getSession();
        try {
            for (const file of files) {
                const doc = await this.attachmentRepository.create(
                    {
                        fileName: file.originalname,
                        savedName: file.filename,
                        filePath: file.path,
                        contentType: file.mimetype,
                        fileExtension: file.originalname.split(".").pop()
                    },
                    session
                )
                savedFileIds.push(doc._id);
            }
            const userToUpdate = await this.userRepository.findById(user.userId, session);
            const newAnnouncement = await this.announcementRepository.create({
                title: dto.title,
                description: dto.description,
                attachments: savedFileIds,
                authorId: userToUpdate?._id
            }, session);

            await this.userRepository.addAnnouncement(user.userId, newAnnouncement._id, session);
            await newAnnouncement.populate("authorId");
            await this.unitOfWork.commit();
            logger.info(`Announcement with id ${newAnnouncement._id} created successfully.`);
            return mapper.mapAnnouncementToReadOnly(newAnnouncement);
        } catch (err) {
            await this.unitOfWork.rollback();

            // Clean up files
            await this.cleanUpFiles(filePaths);
            throw new AppServerException("AnnouncementCreationFailure", "Fail to create a new announcement");
        }
    }

    async getAllAnnouncements(): Promise<AnnouncementAttachInfoDTO[]> {
        const data: IAnnouncementDocument[] = await this.announcementRepository.getAllPopulatedAnnouncements();
        return data.map(doc => mapper.mapAnnouncementToReadOnlyWithAttachInfo(doc))
    }

    async getAnnouncementById(id: string) : Promise<AnnouncementAttachInfoDTO> {
        const data: IAnnouncementDocument | null = await this.announcementRepository.getByIdPopulated(id)
        if (!data) {
            throw new AppObjectNotFoundException("Announcement", `Announcement with id ${id} not found`);
        }
        return mapper.mapAnnouncementToReadOnlyWithAttachInfo(data)
    }

    async deleteAnnouncementById(id: string) : Promise<void> {
        const filePathsToDelete: string[] = [];
        await this.unitOfWork.start();
        const session = this.unitOfWork.getSession();
        try {
            const toDelete = await this.announcementRepository.deleteById(id, session);
            if (!toDelete) {
                throw new AppObjectNotFoundException("Announcement", `Announcement with id ${id} not found`);
            }
            logger.info(`Announcement with id ${id} deleted successfully.`);
            if (toDelete.attachments) {
                for (const attachment of toDelete.attachments) {
                    filePathsToDelete.push((attachment as IAttachmentDocument).filePath);
                    await this.attachmentRepository.deleteById(attachment._id.toString(), session);
                }
            }
            await this.userRepository.removeAnnouncement(toDelete.authorId.toString(), id, session);
            await this.unitOfWork.commit();

            // Delete files AFTER transaction success
            await this.cleanUpFiles(filePathsToDelete);

        } catch (err) {
            await this.unitOfWork.rollback();
            throw err;
        }
    }

    async updateAnnouncement(
        id: string,
        dto: AnnouncementInsertDTO,
        files: Express.Multer.File[],
    ): Promise<AnnouncementReadOnlyDTO> {
        const newFilePaths: string[] = files.map(f => f.path);
        const savedFileIds: Types.ObjectId[] = [];
        const oldFilePathsToDelete: string[] = [];

        await this.unitOfWork.start();
        const session = this.unitOfWork.getSession();

        try {
            // Fetch the existing announcement
            const existingAnnouncement = await this.announcementRepository.getByIdPopulated(id, session);
            if (!existingAnnouncement) {
                throw new AppObjectNotFoundException("Announcement", `Announcement with id ${id} not found`);
            }
            // Save new attachments (if any)
            for (const file of files) {
                const doc = await this.attachmentRepository.create({
                    fileName: file.originalname,
                    savedName: file.filename,
                    filePath: file.path,
                    contentType: file.mimetype,
                    fileExtension: file.originalname.split(".").pop()
                }, session);
                savedFileIds.push(doc._id);
            }
            // Track old attachments to delete later
            if (existingAnnouncement.attachments) {
                for (const att of existingAnnouncement.attachments) {
                    oldFilePathsToDelete.push((att as IAttachmentDocument).filePath);
                    await this.attachmentRepository.deleteById(att._id.toString(), session);
                }
            }
            // Update announcement fields
            const updatedAnnouncement = await this.announcementRepository.updateById(id, {
                title: dto.title,
                description: dto.description,
                attachments: savedFileIds
            }, session) as IAnnouncementDocument;

            await updatedAnnouncement.populate("authorId");
            await this.unitOfWork.commit();

            // Cleanup old files only after DB changes are committed
            await this.cleanUpFiles(oldFilePathsToDelete);

            logger.info(`Announcement with id ${id} updated successfully.`);
            return mapper.mapAnnouncementToReadOnly(updatedAnnouncement);

        } catch (err) {
            await this.unitOfWork.rollback();

            // Cleanup new uploaded files if transaction fails
            await this.cleanUpFiles(newFilePaths);
            throw new AppServerException("AnnouncementUpdateFailure", "Failed to update the announcement");
        }
    }


    private async cleanUpFiles(filePathsToDelete: string[]): Promise<void> {
        await Promise.all(filePathsToDelete.map(async path => {
            try {
                await fs.unlink(path);
            } catch (e) {
                logger.warn(`Failed to delete file: ${path}`);
                throw new AppServerException("AppServerError", "Fail to delete uploads")
            }
        }));
    }
}