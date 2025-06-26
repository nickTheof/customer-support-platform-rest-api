import multer from "multer";
import { Request, Response } from "express";
import { AppInvalidArgumentException, AppServerException } from "../core/exceptions/app.exceptions";
import path from "path";
import fs from "fs";
import logger from "../core/utils/logger";

/**
 * File Upload Configuration
 *
 * Configures multer middleware for handling file uploads with:
 * - Disk storage with unique filenames
 * - MIME type validation
 * - File size and count limits
 * - Custom error handling
 *
 * Supported file types: JPEG, PNG, PDF
 * Max file size: 5MB
 * Max files per request: 5
 */
const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
            // Create uploads directory if it doesn't exist
            const uploadDir = path.join(process.cwd(), "uploads");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `file-${uniqueSuffix}${ext}`);
        },
    }),
    fileFilter: (_req, file, cb) => {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf"
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            logger.warn(`Attempted upload of unsupported file type: ${file.mimetype}`);
            cb(new AppInvalidArgumentException(
                "File",
                `Unsupported file type. Allowed types: ${allowedMimeTypes.join(", ")}`
            ));
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 5,  // 5MB
        files: 5,                   // Max 5 files
        fieldSize: 1024 * 1024 * 10 // 10MB for other form fields
    },
});

/**
 * File Upload Middleware
 *
 * Handles multi-file uploads with proper error handling and validation
 *
 */
export const uploadFiles = () => {
    const handler = upload.array("files", 5);

    return async (req: Request, res: Response): Promise<void> => {
        return new Promise((resolve, reject) => {
            handler(req, res, (err: unknown) => {
                if (!err) {
                    logger.info(`Successful upload of ${req.files?.length || 0} files`);
                    return resolve();
                }

                // Handle Multer-specific errors
                if (err instanceof multer.MulterError) {
                    logger.warn(`Multer error during upload: ${err.code}`);
                    switch (err.code) {
                        case "LIMIT_FILE_SIZE":
                            return reject(new AppInvalidArgumentException(
                                "File",
                                "File too large. Maximum size is 5MB"
                            ));
                        case "LIMIT_FILE_COUNT":
                            return reject(new AppInvalidArgumentException(
                                "File",
                                "Too many files. Maximum 5 files per request"
                            ));
                        case "LIMIT_UNEXPECTED_FILE":
                            return reject(new AppInvalidArgumentException(
                                "File",
                                "Unexpected file field. Use 'files' as field name"
                            ));
                        case "LIMIT_FIELD_KEY":
                            return reject(new AppInvalidArgumentException(
                                "File",
                                "Field name too long"
                            ));
                        case "LIMIT_PART_COUNT":
                            return reject(new AppInvalidArgumentException(
                                "File",
                                "Too many form parts"
                            ));
                        default:
                            logger.error(`Unhandled Multer error: ${err.message}`);
                            return reject(new AppServerException(
                                "UploadError",
                                "Failed to process upload"
                            ));
                    }
                }

                // Handle other errors
                if (err instanceof Error) {
                    logger.error(`Upload error: ${err.message}`);
                    return reject(new AppServerException(
                        "UploadError",
                        err.message
                    ));
                }

                reject(new AppServerException(
                    "UploadError",
                    "Unknown upload error occurred"
                ));
            });
        });
    };
};

/**
 * File Cleanup Middleware
 *
 * Cleans up uploaded files if the request fails downstream
 *
 * @param req Express request object
 */
export const cleanupUploads = (req: Request) => {
    if (!req.files || !Array.isArray(req.files)) return;

    req.files.forEach((file: Express.Multer.File) => {
        try {
            fs.unlinkSync(file.path);
            logger.debug(`Cleaned up file: ${file.path}`);
        } catch (cleanupError) {
            logger.error(`Failed to cleanup file ${file.path}: ${cleanupError}`);
        }
    });
};