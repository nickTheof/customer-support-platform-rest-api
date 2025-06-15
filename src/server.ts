import app from "./app";
import mongoose from "mongoose";
import logger from "./core/utils/logger";
import env_config from "./core/env_config";

mongoose.connect(`mongodb+srv://${env_config.MONGODB_USER}:${env_config.MONGODB_PASSWORD}@${env_config.MONGODB_CLUSTER_URI}${env_config.MONGODB_DATABASE}?retryWrites=true&w=majority&appName=Cluster0`)
    .then(
    () => {
        logger.info("Mongo DB connection established");
        app.listen(env_config.PORT, () => {
            logger.info(`Server is up and running on port ${env_config.PORT}...`);
        });
    },
    (err) => {
        logger.error("Mongo DB Connection failed", err.message);
    }
);