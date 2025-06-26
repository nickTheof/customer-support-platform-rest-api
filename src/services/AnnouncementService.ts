import {IAnnouncementService} from "./IAnnouncementService";
import {AnnouncementInsertDTO, AnnouncementReadOnlyDTO} from "../core/types/zod-model.types";
import mongoose, {Types} from "mongoose";
import {IAnnouncementRepository} from "../repository/IAnnouncementRepository";
import {IAttachmentRepository} from "../repository/IAttachmentRepository";
import {IUserRepository} from "../repository/IUserRepository";
import fs from "fs/promises";
import { AppServerException} from "../core/exceptions/app.exceptions";
import { UserTokenPayload} from "../core/interfaces/user.interfaces";
import logger from "../core/utils/logger";
import mapper from "../mapper/mapper";

export class AnnouncementService implements IAnnouncementService {
    constructor(private announcementRepository: IAnnouncementRepository,
                private attachmentRepository: IAttachmentRepository,
                private userRepository: IUserRepository,) {
    }


    async createAnnouncement(dto: AnnouncementInsertDTO, files: Express.Multer.File[], user: UserTokenPayload): Promise<AnnouncementReadOnlyDTO> {
        const savedFileIds: Types.ObjectId[] = [];
        const filePaths = files.map(f => f.path);
        const session = await mongoose.startSession();
        session.startTransaction();
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
            await session.commitTransaction();
            await session.endSession();
            logger.info(`Announcement with id ${newAnnouncement._id} created successfully.`);
            return mapper.mapAnnouncementToReadOnly(newAnnouncement);
        } catch (err) {
            await session.abortTransaction();
            await session.endSession();

            // Clean up files
            await Promise.all(filePaths.map(async path => {
                try {
                    await fs.unlink(path);
                } catch {
                    throw new AppServerException("AppServerError", "Fail to delete uploads")
                }
            }));
            throw new AppServerException("AnnouncementCreationFailure", "Fail to create a new announcement");
        }
    }
}