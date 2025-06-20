// Initialize dependencies
import {RoleRepository} from "./repository/RoleRepository";
import {RoleService} from "./services/RoleService";
import {createRoleRoutes} from "./routes/role.routes";
import {UserRepository} from "./repository/UserRepository";
import {UserService} from "./services/UserService";
import {createUserRoutes} from "./routes/user.routes";
import {AuthService} from "./services/AuthService";
import {createAuthRoutes} from "./routes/auth.routes";
import {createHealthCheckRoutes} from "./routes/healthcheck.routes";
import {EmailService} from "./services/EmailService";

const roleRepository = new RoleRepository();
const userRepository = new UserRepository(roleRepository);
const roleService = new RoleService(roleRepository);
const userService = new UserService(userRepository, roleRepository);
const authService = new AuthService(userRepository, roleRepository);
const emailService = new EmailService();

const healthCheckRoutes = createHealthCheckRoutes();
// Create routes with injected dependencies
const authRoutes = createAuthRoutes(userService, authService, emailService);
const roleRoutes = createRoleRoutes(roleService);
const userRoutes = createUserRoutes(userService, emailService);

export { roleRoutes, userRoutes, authRoutes, healthCheckRoutes };