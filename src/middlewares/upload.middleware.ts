import multer from "multer";
import { Request, Response } from "express";
import { AppInvalidArgumentException, AppServerException } from "../core/exceptions/app.exceptions";

const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, "uploads/"),
        filename: (_req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const ext = file.originalname.split(".").pop();
            cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
        },
    }),
    fileFilter: (_req, file, cb) => {
        if (["image/jpeg", "image/png", "application/pdf"].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppInvalidArgumentException("File", "Unsupported file type"));
        }
    },
    limits: { fileSize: 1024 * 1024 * 5, files: 5 }, // 5MB, max 5 files
});

export const uploadFiles = () => {
    const handler = upload.array("files", 5);
    return async (req: Request, res: Response): Promise<void> => {
        return new Promise((resolve, reject) => {
            handler(req, res, (err) => {
                if (!err) return resolve();
                if (err instanceof multer.MulterError) {
                    switch (err.code) {
                        case "LIMIT_FILE_SIZE":
                            return reject(new AppInvalidArgumentException("File", "File too large (max 5MB)"));
                        case "LIMIT_FILE_COUNT":
                            return reject(new AppInvalidArgumentException("File", "Too many files (max 5)"));
                        case "LIMIT_UNEXPECTED_FILE":
                            return reject(new AppInvalidArgumentException("File", "Unexpected field"));
                        default:
                            return reject(new AppServerException("MulterError", err.message));
                    }
                }
                reject(err);
            });
        });
    };
};
